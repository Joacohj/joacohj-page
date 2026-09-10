import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import {prisma} from './prisma'
import { nextCookies } from "better-auth/next-js";
export const auth = betterAuth({
  //...other options
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: { 
    enabled: true,
    // disableSignUp: true
  },
  plugins: [nextCookies()]
});