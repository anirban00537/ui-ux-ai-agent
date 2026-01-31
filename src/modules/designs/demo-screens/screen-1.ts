// Welcome Screen HTML Content - Figma-quality enhanced version
export const screen1HTML = `
 <div class="bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-12 pb-6">
        <div>
          <h1 class="text-2xl font-light text-black tracking-wide">Gallery</h1>
          <p class="text-sm text-black opacity-60 mt-1">Curated Collections</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
      </div>

      <!-- Featured Section -->
      <div class="px-6 mb-8">
        <div class="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div class="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative">
            <img src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&amp;h=300&amp;fit=crop" alt="Featured artwork" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black bg-opacity-10"></div>
          </div>
          <div class="p-6">
            <h3 class="text-lg font-light text-black mb-2">Abstract Expressions</h3>
            <p class="text-sm text-black opacity-70 mb-3">Contemporary mixed media collection</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-black opacity-50">12 pieces</span>
              <svg class="w-4 h-4 text-black opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="px-6 mb-6">
        <h2 class="text-lg font-light text-black mb-4">Collections</h2>
        <div class="space-y-4">
          <!-- Architecture -->
          <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center space-x-4">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <svg class="w-7 h-7 text-black opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-light text-black">Architecture</h3>
              <p class="text-sm text-black opacity-60">Modern structures &amp; spaces</p>
            </div>
            <div class="text-xs text-black opacity-40">24</div>
          </div>

          <!-- Paintings -->
          <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center space-x-4">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
              <svg class="w-7 h-7 text-black opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-light text-black">Paintings</h3>
              <p class="text-sm text-black opacity-60">Oil, acrylic &amp; watercolor</p>
            </div>
            <div class="text-xs text-black opacity-40">18</div>
          </div>

          <!-- Photography -->
          <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center space-x-4">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
              <svg class="w-7 h-7 text-black opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-light text-black">Photography</h3>
              <p class="text-sm text-black opacity-60">Digital &amp; analog captures</p>
            </div>
            <div class="text-xs text-black opacity-40">31</div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="mt-auto bg-white border-t border-gray-100 px-6 py-4">
        <div class="flex items-center justify-around">
          <div class="flex flex-col items-center space-y-1">
            <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
            </svg>
            <span class="text-xs text-black">Home</span>
          </div>
          <div class="flex flex-col items-center space-y-1">
            <svg class="w-6 h-6 text-black opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span class="text-xs text-black opacity-40">Search</span>
          </div>
          <div class="flex flex-col items-center space-y-1">
            <svg class="w-6 h-6 text-black opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span class="text-xs text-black opacity-40">Saved</span>
          </div>
          <div class="flex flex-col items-center space-y-1">
            <svg class="w-6 h-6 text-black opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span class="text-xs text-black opacity-40">Profile</span>
          </div>
        </div>
      </div>
    </div>
`;
