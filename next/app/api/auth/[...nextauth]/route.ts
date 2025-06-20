// /api/auth/anything will be handled by this file

import { prismaClient } from "@/lib/db";
import NextAuth from "next-auth"
import { authOptions } from "./authOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };