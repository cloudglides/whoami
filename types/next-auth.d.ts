import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      slackId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    slackId?: string | null;
    hcaId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    slackId?: string | null;
  }
}
