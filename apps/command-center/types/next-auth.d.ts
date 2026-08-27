import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      entraObjectId?: string;
      entraTenantId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    entraObjectId?: string;
    entraTenantId?: string;
  }
}
