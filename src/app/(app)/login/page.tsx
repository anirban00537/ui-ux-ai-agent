"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Palette, Zap } from "lucide-react";

export default function LoginPage() {
  const { handleGoogleLogin } = useAuth();

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Left Column - Login Form */}
      <div className="flex flex-col justify-center items-center px-8 py-12 md:px-16 lg:px-24 bg-background relative">
        <div className="w-full max-w-sm space-y-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-4">
             <Link href="/" className="relative mb-4 w-40 h-40 transition-transform hover:scale-105">
               <Image 
                 src="/logo.svg" 
                 alt="Butterfast Logo" 
                 fill 
                 className="object-contain" 
                 priority 
               />
             </Link>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back
             </h1>
             <p className="text-muted-foreground text-sm max-w-[280px]">
                Enter your details to access your designs and start creating.
             </p>
          </div>

          {/* Login Actions */}
          <div className="space-y-6">
            <button
              onClick={() => handleGoogleLogin()}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted hover:border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                   <span className="bg-background px-2 text-muted-foreground tracking-wider font-medium">
                     Secure Authentication
                   </span>
                </div>
            </div>
          </div>

          {/* Footer Terms */}
          <p className="text-center text-xs text-muted-foreground">
             By clicking continue, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Right Column - Visuals */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-muted">
        <div className="relative z-10 w-full max-w-[480px] p-8">
           <h2 className="text-4xl font-bold tracking-tight text-foreground mb-12 font-serif text-center drop-shadow-sm leading-tight">
              From prompt<br/>to mobile app.
           </h2>

           <div className="space-y-6 relative">
              {/* Connecting Line */}
              <div className="absolute left-[27px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-foreground/10 to-transparent"></div>

              {/* Step 1 */}
              <div className="relative group rounded-2xl bg-card/80 border border-border p-5 backdrop-blur-xl shadow-sm transition-all hover:bg-card hover:shadow-md hover:translate-x-1">
                 <div className="flex items-start gap-5">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
                       <span className="text-2xl filter drop-shadow-sm">💡</span>
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-foreground mb-1">Describe your app</h3>
                       <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                          Simply type a topic or paste your requirements. Our AI understands context and structure instantly.
                       </p>
                    </div>
                 </div>
              </div>

              {/* Step 2 */}
              <div className="relative group rounded-2xl bg-card/80 border border-border p-5 backdrop-blur-xl shadow-sm transition-all hover:bg-card hover:shadow-md hover:translate-x-1">
                 <div className="flex items-start gap-5">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
                       <Sparkles className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-foreground mb-1">AI generates UI</h3>
                       <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                          Watch as layouts, images, and components are generated automatically in our premium design system.
                       </p>
                    </div>
                 </div>
              </div>

              {/* Step 3 */}
              <div className="relative group rounded-2xl bg-card/80 border border-border p-5 backdrop-blur-xl shadow-sm transition-all hover:bg-card hover:shadow-md hover:translate-x-1">
                 <div className="flex items-start gap-5">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
                       <Zap className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-foreground mb-1">Export & Share</h3>
                       <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                          Get production-ready code, export to design tools, or share a live prototype with your team.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
