import NextAuth from "next-auth";
import MicrosoftEntraID, {
  type MicrosoftEntraIDProfile,
} from "next-auth/providers/microsoft-entra-id";
import {
  isAllowedEntraObjectId,
  tenantIdFromEntraIssuer,
} from "@/lib/entra-config";

const ENTRA_PROVIDER_ID = "microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [
    MicrosoftEntraID({
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: {
        params: { scope: "openid profile email" },
      },
      profile(profile) {
        return {
          id: profile.oid || profile.sub,
          name: profile.name,
          email: profile.email || profile.preferred_username,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== ENTRA_PROVIDER_ID) return false;

      const entraProfile = profile as
        | Partial<MicrosoftEntraIDProfile>
        | undefined;
      const tenantId = tenantIdFromEntraIssuer();

      return Boolean(
        tenantId &&
          entraProfile?.tid?.toLowerCase() === tenantId &&
          isAllowedEntraObjectId(entraProfile.oid),
      );
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === ENTRA_PROVIDER_ID && profile) {
        const entraProfile = profile as Partial<MicrosoftEntraIDProfile>;
        token.entraObjectId = entraProfile.oid;
        token.entraTenantId = entraProfile.tid?.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.entraObjectId =
          typeof token.entraObjectId === "string"
            ? token.entraObjectId
            : undefined;
        session.user.entraTenantId =
          typeof token.entraTenantId === "string"
            ? token.entraTenantId
            : undefined;
      }
      return session;
    },
  },
});
