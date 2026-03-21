/**
 * TOTP (Time-based One-Time Password) Implementation
 * RFC 6238 compliant TOTP generator and verifier
 */

import crypto from "crypto";

// TOTP Configuration
const TOTP_WINDOW = 1; // Allow 1 step before/after current time (30 seconds each)
const TOTP_STEP = 30; // 30 second time step
const TOTP_DIGITS = 6; // 6 digit codes

/**
 * Generate a random base32 secret for TOTP
 */
export function generateTOTPSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generate TOTP code for a given secret and time
 */
export function generateTOTP(secret: string, timeStep?: number): string {
  const time = timeStep ?? Math.floor(Date.now() / 1000 / TOTP_STEP);
  const secretBuffer = base32Decode(secret);
  
  // Create time buffer (8 bytes, big-endian)
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(time));
  
  // HMAC-SHA1
  const hmac = crypto.createHmac("sha1", secretBuffer);
  hmac.update(timeBuffer);
  const hash = hmac.digest();
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  // Generate 6-digit code
  const otp = (code % Math.pow(10, TOTP_DIGITS)).toString().padStart(TOTP_DIGITS, "0");
  return otp;
}

/**
 * Verify TOTP code against secret
 * Allows for time drift by checking adjacent time windows
 */
export function verifyTOTP(secret: string, token: string): boolean {
  const currentTime = Math.floor(Date.now() / 1000 / TOTP_STEP);
  
  // Check current time window and adjacent windows
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    const testCode = generateTOTP(secret, currentTime + i);
    if (testCode === token) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate TOTP provisioning URI for QR code
 * Compatible with Google Authenticator, Authy, etc.
 */
export function getTOTPUri(secret: string, accountName: string, issuer: string = "Retro Gigz"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP}`;
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  
  return output;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.ceil((encoded.length * 5) / 8));
  
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i].toUpperCase();
    const val = alphabet.indexOf(char);
    
    if (val === -1) continue;
    
    value = (value << 5) | val;
    bits += 5;
    
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  
  return output.slice(0, index);
}

/**
 * Generate QR code data URL for TOTP setup
 * Uses a simple QR code library approach
 */
export async function generateQRCode(text: string): Promise<string> {
  // For a production system, you'd use a QR code library like 'qrcode'
  // For now, we'll return the URI for manual entry
  // In production: npm install qrcode
  // import QRCode from 'qrcode';
  // return await QRCode.toDataURL(text);
  
  // Fallback: return text for manual entry
  return text;
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  
  return codes;
}
