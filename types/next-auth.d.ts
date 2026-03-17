import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    adminPortalAccess?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      adminPortalAccess: boolean;
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
  }
}
