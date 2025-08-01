import NextAuth, { NextAuthOptions } from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: "brasilprivacy-app",
      clientSecret: "fRRBZpcvLKTgJINXRtffID6Wuh1XAvbU",
      issuer: "http://localhost:8080/realms/brasilprivacy",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }: { token: any; account?: any }) {
      if (account) token.accessToken = account.access_token
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
