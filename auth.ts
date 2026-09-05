import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AdapterUser } from "@auth/core/adapters";
import type { OIDCConfig } from "@auth/core/providers/oauth";
import { prisma } from "@/lib/prisma";

const prismaAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...prismaAdapter,
    async createUser(user) {
      return (await prisma.user.create({
        data: {
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          slackId: (user as { slackId?: string }).slackId ?? null,
          hcaId: (user as { hcaId?: string }).hcaId ?? null,
        },
      })) as unknown as AdapterUser;
    },
    async updateUser(user) {
      return (await prisma.user.update({
        where: { id: user.id! },
        data: {
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          slackId: (user as { slackId?: string }).slackId ?? null,
          hcaId: (user as { hcaId?: string }).hcaId ?? null,
        },
      })) as unknown as AdapterUser;
    },
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    {
      id: "hackclub",
      name: "Hack Club",
      type: "oidc",
      issuer: "https://auth.hackclub.com",
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.AUTH_HCA_CLIENT_ID,
      clientSecret: process.env.AUTH_HCA_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid profile email name" },
      },
      token: "https://auth.hackclub.com/oauth/token",
      userinfo: "https://auth.hackclub.com/api/v1/me",
      profile(profile) {
        const p = profile as Record<string, unknown>;
        const id = String(p.sub ?? p.id ?? "0");
        return {
          id,
          name: (p.name as string) ?? null,
          email: (p.email as string) ?? null,
          image: (p.avatar as string) ?? (p.picture as string) ?? null,
          slackId: (p.slack_id as string) ?? null,
          hcaId: id,
        };
      },
    } satisfies OIDCConfig<Record<string, unknown>>,
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
