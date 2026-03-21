import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    adminPortalAccess?: boolean;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      adminPortalAccess: boolean;
      mustChangePassword?: boolean;
      totpEnabled?: boolean;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    adminPortalAccess?: boolean;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
  }
}
