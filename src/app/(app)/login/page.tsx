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
         <div className="flex flex-col justify-center items-center px-8 py-12 md:px-16 lg:px-24 relative bg-gradient-to-br from-[#fbfcff] to-[#e8f0fe] z-10 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="w-full max-w-sm space-y-10">
               {/* Logo & Header */}
               <div className="flex flex-col items-center text-center space-y-2">
                  <Link href="/" className="relative mb-6 w-48 h-12 transition-transform hover:scale-105">
                     <Image
                        src="/logo.svg"
                        alt="Butterfast Logo"
                        fill
                        className="object-contain"
                        priority
                     />
                  </Link>
                  <h1 className="text-[32px] font-bold tracking-tight text-[#0a0f1c]">
                     Welcome back
                  </h1>
                  <p className="text-muted-foreground/90 text-[15px] font-medium max-w-[280px] leading-relaxed mt-2">
                     Enter your details to access your designs and start creating.
                  </p>
               </div>

               {/* Login Actions */}
               <div className="space-y-8">
                  <button
                     onClick={() => handleGoogleLogin()}
                     className="group flex w-full items-center justify-center gap-3 rounded-full border border-black/[0.06] bg-white px-8 py-4 text-[15px] font-semibold text-[#0a0f1c] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                        <span className="w-full border-t border-black/5" />
                     </div>
                     <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-[#f2f6ff] px-3 text-muted-foreground/70 tracking-widest font-bold">
                           Secure Authentication
                        </span>
                     </div>
                  </div>
               </div>

               {/* Footer Terms */}
               <p className="text-center text-[13px] font-medium text-muted-foreground/80 leading-relaxed">
                  By clicking continue, you agree to our <a href="#" className="underline hover:text-[#0a0f1c] transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-[#0a0f1c] transition-colors">Privacy Policy</a>.
               </p>
            </div>
         </div>

         {/* Right Column - Visuals */}
         <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-[#050a14]">
            <Image
               src="/background.jpg"
               alt="Butterfast Experience"
               fill
               className="object-cover opacity-80"
               priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-[#050a14]/60 z-[5]" />
            <div className="absolute inset-0 bg-[#5338ff]/10 mix-blend-overlay z-[6]" />

            <div className="relative z-10 w-full max-w-[500px] p-8 -mt-10">
               <h2 className="text-4xl md:text-[48px] font-[900] tracking-[-0.04em] text-white mb-14 text-center leading-[1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                  From prompt<br />to mobile app.
               </h2>

               <div className="space-y-6 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[47px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                  {/* Step 1 */}
                  <div className="relative group rounded-[32px] bg-white/[0.08] border border-white/10 p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 hover:bg-white/[0.12] hover:-translate-y-1 hover:border-white/20">
                     <div className="flex items-start gap-6">
                        <div className="relative z-10 flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[20px] bg-white/10 shadow-[inner_0_2px_4px_rgba(255,255,255,0.1)] border border-white/10 group-hover:scale-110 transition-transform duration-500">
                           <span className="text-2xl">💡</span>
                        </div>
                        <div>
                           <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight group-hover:text-primary transition-colors">Describe your app</h3>
                           <p className="text-white/70 text-[14px] leading-relaxed font-medium">
                              Simply type a topic or paste your requirements. Our AI understands context and structure instantly.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative group rounded-[32px] bg-white/[0.08] border border-white/10 p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 hover:bg-white/[0.12] hover:-translate-y-1 hover:border-white/20">
                     <div className="flex items-start gap-6">
                        <div className="relative z-10 flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[20px] bg-primary/20 shadow-[inner_0_2px_4px_rgba(83,56,255,0.2)] border border-primary/30 group-hover:scale-110 transition-transform duration-500">
                           <Sparkles className="w-6 h-6 text-primary filter drop-shadow-[0_0_8px_rgba(83,56,255,0.5)]" />
                        </div>
                        <div>
                           <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight group-hover:text-primary transition-colors">AI generates UI</h3>
                           <p className="text-white/70 text-[14px] leading-relaxed font-medium">
                              Watch as layouts, images, and components are generated automatically in our premium design system.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative group rounded-[32px] bg-white/[0.08] border border-white/10 p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 hover:bg-white/[0.12] hover:-translate-y-1 hover:border-white/20">
                     <div className="flex items-start gap-6">
                        <div className="relative z-10 flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[20px] bg-white/10 shadow-[inner_0_2px_4px_rgba(255,255,255,0.1)] border border-white/10 group-hover:scale-110 transition-transform duration-500">
                           <Zap className="w-6 h-6 text-primary filter drop-shadow-[0_0_8px_rgba(83,56,255,0.5)]" />
                        </div>
                        <div>
                           <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight group-hover:text-primary transition-colors">Export & Share</h3>
                           <p className="text-white/70 text-[14px] leading-relaxed font-medium">
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
