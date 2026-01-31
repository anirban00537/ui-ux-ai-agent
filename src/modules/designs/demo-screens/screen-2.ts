// Welcome Screen HTML Content - Figma-quality enhanced version
export const screen2HTML = `
 <div class="bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-12 pb-6">
        <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"></path>
          </svg>
        </div>
        <h1 class="text-lg font-light text-black">Artist</h1>
        <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
          </svg>
        </div>
      </div>

      <!-- Artist Header -->
      <div class="px-6 mb-8">
        <div class="bg-white rounded-3xl shadow-sm p-6">
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <svg class="w-10 h-10 text-black opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-light text-black mb-1">Maria Rodriguez</h2>
              <p class="text-sm text-black opacity-60 mb-2">Contemporary Artist</p>
              <p class="text-xs text-black opacity-50">Barcelona, Spain</p>
            </div>
          </div>
          
          <div class="flex space-x-6 mb-6">
            <div class="text-center">
              <p class="text-lg font-light text-black">47</p>
              <p class="text-xs text-black opacity-50">Artworks</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-light text-black">12.4k</p>
              <p class="text-xs text-black opacity-50">Followers</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-light text-black">23</p>
              <p class="text-xs text-black opacity-50">Exhibitions</p>
            </div>
          </div>

          <div class="flex space-x-3">
            <button class="flex-1 bg-black text-white py-3 rounded-xl font-light text-sm">
              Follow
            </button>
            <button class="px-6 py-3 bg-gray-50 rounded-xl">
              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="px-6 mb-6">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-base font-light text-black mb-3">About</h3>
          <p class="text-sm text-black opacity-70 leading-relaxed mb-4">
            Maria explores the boundaries between abstract expressionism and contemporary minimalism. Her work has been featured in galleries across Europe and North America.
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-gray-50 rounded-full text-xs text-black opacity-60">Abstract</span>
            <span class="px-3 py-1 bg-gray-50 rounded-full text-xs text-black opacity-60">Mixed Media</span>
            <span class="px-3 py-1 bg-gray-50 rounded-full text-xs text-black opacity-60">Contemporary</span>
          </div>
        </div>
      </div>

      <!-- Recent Works -->
      <div class="px-6 mb-6">
        <h3 class="text-base font-light text-black mb-4">Recent Works</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="h-32 bg-gradient-to-br from-gray-100 to-gray-200">
              <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&amp;h=150&amp;fit=crop" alt="Artwork 1" class="w-full h-full object-cover">
            </div>
            <div class="p-3">
              <h4 class="text-sm font-light text-black mb-1">Convergence</h4>
              <p class="text-xs text-black opacity-50">2023</p>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="h-32 bg-gradient-to-br from-gray-100 to-gray-200">
              <img src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&amp;h=150&amp;fit=crop" alt="Artwork 2" class="w-full h-full object-cover">
            </div>
            <div class="p-3">
              <h4 class="text-sm font-light text-black mb-1">Flow State</h4>
              <p class="text-xs text-black opacity-50">2023</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Exhibitions -->
      <div class="px-6 mb-6">
        <h3 class="text-base font-light text-black mb-4">Upcoming Exhibitions</h3>
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h4 class="text-sm font-light text-black">Modern Expressions</h4>
              <p class="text-xs text-black opacity-60">Gallery Moderne, Paris</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-black opacity-50">Mar 15</p>
              <p class="text-xs text-black opacity-50">2024</p>
            </div>
          </div>
          <div class="w-full h-1 bg-gray-100 rounded-full">
            <div class="w-3/4 h-1 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
`;
