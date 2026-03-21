import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateTOTPSecret, getTOTPUri, verifyTOTP } from "@/lib/totp";

interface User {
  id: number;
  email: string;
  password: string;
  must_change_password: number;
  totp_secret: string | null;
  totp_enabled: number;
}

// GET - Generate TOTP secret for setup
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = db
      .prepare("SELECT id, email, must_change_password, totp_secret, totp_enabled FROM users WHERE email = ?")
      .get(session.user.email) as User | undefined;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new secret
    const secret = generateTOTPSecret();
    const uri = getTOTPUri(secret, user.email);

    return NextResponse.json({
      secret,
      uri,
      qrCode: uri, // In production, generate actual QR code image
      mustChangePassword: user.must_change_password === 1,
      totpEnabled: user.totp_enabled === 1,
    });
  } catch (error) {
    console.error("Error generating TOTP secret:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Complete setup (change password + enable 2FA)
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, totpSecret, totpCode } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(session.user.email) as User | undefined;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password if user is changing password
    if (user.must_change_password === 1 || currentPassword) {
      const validPassword = await bcrypt.compare(currentPassword || "", user.password);
      if (!validPassword && user.must_change_password === 0) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    // Verify TOTP code if provided
    if (totpSecret && totpCode) {
      const isValid = verifyTOTP(totpSecret, totpCode);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid 2FA code. Please try again." },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user with new password and 2FA settings
    db.prepare(
      `UPDATE users 
       SET password = ?, 
           must_change_password = 0,
           totp_secret = ?,
           totp_enabled = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    ).run(
      hashedPassword,
      totpSecret || null,
      totpSecret && totpCode ? 1 : 0,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: "Account setup completed successfully",
      totpEnabled: !!(totpSecret && totpCode),
    });
  } catch (error) {
    console.error("Error completing setup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
