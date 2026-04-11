"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
   const { handleGoogleLogin } = useAuth();

   return (
      <div className="grid min-h-screen w-full lg:grid-cols-2 bg-background">
         <div className="flex flex-col justify-center items-center px-8 py-12 md:px-16 lg:px-24 relative">
            <div className="w-full max-w-sm space-y-12">
               <div className="flex flex-col items-center text-center space-y-2">
                  <Link href="/" className="relative mb-8 w-48 h-12">
                     <Image
                        src="/logo.svg"
                        alt="Butterfast Logo"
                        fill
                        className="object-contain brightness-0 invert"
                        priority
                     />
                  </Link>
                  <h1 className="font-mono text-[32px] text-foreground tracking-tight">
                     Welcome back
                  </h1>
                  <p className="font-sans text-muted-foreground text-[15px] max-w-[280px] leading-relaxed mt-2">
                     Enter your details to access your designs and start creating.
                  </p>
               </div>

               <div className="space-y-8">
                  <Button
                     onClick={() => handleGoogleLogin()}
                     className="group flex w-full items-center justify-center gap-3 font-mono"
                  >
                     <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                  </Button>

                  <div className="relative">
                     <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                     </div>
                     <div className="relative flex justify-center">
                        <span className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground/50 px-3">
                           Secure Authentication
                        </span>
                     </div>
                  </div>
               </div>

               <p className="font-sans text-center text-[13px] text-muted-foreground/50 leading-relaxed">
                  By clicking continue, you agree to our <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a> and <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>.
               </p>
            </div>
         </div>

         <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-background border-l border-border">
            <div className="relative z-10 w-full max-w-[500px] p-8 -mt-10">
               <h2 className="font-mono text-4xl md:text-[48px] text-foreground mb-14 text-center leading-[1] tracking-tight">
                  From prompt<br />to mobile app.
               </h2>

               <div className="space-y-6 relative">
                  <div className="absolute left-[47px] top-10 bottom-10 w-[1px] bg-border" />

                  <div className="relative group border border-border bg-card p-8 transition-colors duration-500 hover:border-border-strong">
                     <div className="flex items-start gap-6">
                        <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center border border-border group-hover:border-border-strong transition-colors duration-500">
                           <span className="text-2xl">01</span>
                        </div>
                        <div>
                           <h3 className="font-sans text-[20px] text-foreground mb-2 tracking-tight">Describe your app</h3>
                           <p className="font-sans text-muted-foreground text-[14px] leading-relaxed">
                              Simply type a topic or paste your requirements. Our AI understands context and structure instantly.
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="relative group border border-border bg-card p-8 transition-colors duration-500 hover:border-border-strong">
                     <div className="flex items-start gap-6">
                        <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center border border-border group-hover:border-border-strong transition-colors duration-500">
                           <span className="text-2xl">02</span>
                        </div>
                        <div>
                           <h3 className="font-sans text-[20px] text-foreground mb-2 tracking-tight">AI generates UI</h3>
                           <p className="font-sans text-muted-foreground text-[14px] leading-relaxed">
                              Watch as layouts, images, and components are generated automatically in our premium design system.
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="relative group border border-border bg-card p-8 transition-colors duration-500 hover:border-border-strong">
                     <div className="flex items-start gap-6">
                        <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center border border-border group-hover:border-border-strong transition-colors duration-500">
                           <span className="text-2xl">03</span>
                        </div>
                        <div>
                           <h3 className="font-sans text-[20px] text-foreground mb-2 tracking-tight">Export & Share</h3>
                           <p className="font-sans text-muted-foreground text-[14px] leading-relaxed">
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
