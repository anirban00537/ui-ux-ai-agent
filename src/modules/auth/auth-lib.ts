import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import * as bcrypt from "bcrypt";

dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

// Use dynamic imports for ESM-only modules
let authInstance: any = null;

export const getAuth = async () => {
  if (authInstance) return authInstance;
  
  const { betterAuth } = await import("better-auth");
  const { prismaAdapter } = await import("better-auth/adapters/prisma");
  
  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    basePath: "/api/auth",
    emailAndPassword: {
      enabled: true,
      password: {
        hash: async (password: string) => {
          return bcrypt.hash(password, 10);
        },
        verify: async (data: { password: string; hash: string }) => {
          return bcrypt.compare(data.password, data.hash);
        },
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectURI: (() => {
          const uri = process.env.BETTER_AUTH_URL 
            ? `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`
            : "http://localhost:3001/api/auth/callback/google";
          console.log("[Auth] Google OAuth redirectURI:", uri);
          console.log("[Auth] BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
          return uri;
        })(),
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: process.env.BETTER_AUTH_URL?.includes("butterfast.com")
          ? ".butterfast.com"
          : undefined,
      },
      cookiePrefix: "butterfast",
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    trustedOrigins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
          "https://api.butterfast.com",
          "https://butterfast.com",
          "https://dev.butterfast.com",
        ],
  });
  
  return authInstance;
};

// For backward compatibility - but this will now be async
export const auth = {
  handler: async (req: any, res: any) => {
    const authInst = await getAuth();
    return authInst.handler(req, res);
  },
  api: {
    getSession: async (options: any) => {
      const authInst = await getAuth();
      return authInst.api.getSession(options);
    },
  },
};
