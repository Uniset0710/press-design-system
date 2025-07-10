import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    /** The JWT access token returned by NextAuth authorize callback */
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The accessToken property stored in JWT */
    accessToken?: string;
  }
} 