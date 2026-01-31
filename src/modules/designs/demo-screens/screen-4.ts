// Welcome Screen HTML Content - Figma-quality enhanced version
export const screen4HTML = `
 <div class="bg-green-100 h-[800px]">
      <!-- Zen Particles -->
      
      
      
      
      
      <!-- Content -->
      <div class="flex flex-col h-full relative z-10">
        <!-- Header -->
        <div class="pt-12 px-6 flex items-center justify-between">
          <button class="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"></path>
            </svg>
          </button>
          <h1 class="text-lg font-medium text-black">Forest Sounds</h1>
          <button class="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
            </svg>
          </button>
        </div>

        <!-- Main Breathing Animation -->
        <div class="flex-1 flex items-center justify-center relative">
          <div class="breathing-circle-large"></div>
          <div class="breathing-circle-medium"></div>
          <div class="breathing-circle-small"></div>
          
          <!-- Central Progress Circle -->
          <div class="relative z-20">
            <svg class="w-32 h-32 progress-ring" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="transparent"></circle>
              <circle cx="50" cy="50" r="45" stroke="rgba(139,195,139,0.8)" stroke-width="2" fill="transparent" class="progress-ring-circle"></circle>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl font-light text-black mb-1">12:30</div>
                <div class="text-xs text-black opacity-60">remaining</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Breathing Guide -->
        <div class="px-6 mb-8">
          <div class="text-center mb-8">
            <h2 class="text-xl font-light text-black mb-2">Breathe In</h2>
            <p class="text-black opacity-60 text-sm">Follow the gentle rhythm</p>
          </div>

          <!-- Control Buttons -->
          <div class="flex items-center justify-center space-x-8 mb-8">
            <button class="w-12 h-12 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
              </svg>
            </button>
            
            <button class="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"></path>
              </svg>
            </button>
            
            <button class="w-12 h-12 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path>
              </svg>
            </button>
          </div>

          <!-- Session Info -->
          <div class="bg-white/30 backdrop-blur-sm rounded-2xl p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-black text-sm">Deep Forest</h4>
                  <p class="text-black opacity-60 text-xs">Nature sounds meditation</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-black">15 min</div>
                <div class="text-xs text-black opacity-60">Beginner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
`;
