import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "admin@example.com" && credentials?.password === "admin123") {
          return { id: "1", name: "Admin User", email: "admin@example.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "some-secret-string",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
