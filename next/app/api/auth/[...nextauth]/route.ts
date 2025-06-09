// /api/auth/anything will be handled by this file

import { prismaClient } from "@/lib/db";
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secondary secret",
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                console.log("JWT Callback - User ID:", user.id);
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string;
                console.log("Session Callback - User ID:", session.user.id);
            }
            return session;
        },
        async signIn({ user, account }) {
            if (!user.email) return false;
            
            try {
                const existingUser = await prismaClient.user.findUnique({
                    where: { email: user.email }
                });

                if (!existingUser) {
                    const newUser = await prismaClient.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "",
                            provider: "Google",
                        }
                    });
                    console.log("Created new user with ID:", newUser.id);
                    user.id = newUser.id;
                } else {
                    console.log("Found existing user with ID:", existingUser.id);
                    user.id = existingUser.id;
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        }
    }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };