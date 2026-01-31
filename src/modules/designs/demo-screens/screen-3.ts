// Welcome Screen HTML Content - Figma-quality enhanced version
export const screen3HTML = `
<div class="bg-slate-950">
      <div class="stars"></div>
      
      <!-- Header -->
      <div class="relative z-10 px-6 pt-12 pb-6">
        <div class="flex items-center justify-between mb-2">
          <button class="text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-white text-xl font-light">Sleep Tracking</h1>
          <button class="text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Current Time -->
      <div class="relative z-10 px-6 mb-8 text-center">
        <div class="text-white text-5xl font-thin mb-2">10:47</div>
        <div class="text-gray-400 text-lg font-light">PM</div>
        <div class="text-gray-300 text-sm mt-2">Sunday, March 12</div>
      </div>

      <!-- Sleep Status -->
      <div class="relative z-10 px-6 mb-8">
        <div class="bg-slate-950 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-10 text-center">
          <div class="w-20 h-20 mx-auto mb-6 relative">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center pulse">
              <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </div>
          </div>
          <h2 class="text-white text-2xl font-light mb-2">Ready to Sleep</h2>
          <p class="text-gray-300 text-sm mb-6">Tap to start tracking your sleep</p>
          
          <button class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-medium text-lg mb-4 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200">
            Start Sleep Tracking
          </button>
          
          <button class="text-gray-400 text-sm">Set Sleep Goal</button>
        </div>
      </div>

      <!-- Sleep Environment -->
      <div class="relative z-10 px-6 mb-6">
        <h3 class="text-white text-lg font-light mb-4">Sleep Environment</h3>
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-slate-950 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-10 text-center">
            <svg class="w-6 h-6 text-blue-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
            <div class="text-white text-sm font-light">22°C</div>
            <div class="text-gray-400 text-xs">Temperature</div>
          </div>
          
          <div class="bg-slate-950 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-10 text-center">
            <svg class="w-6 h-6 text-green-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-white text-sm font-light">45%</div>
            <div class="text-gray-400 text-xs">Humidity</div>
          </div>
          
          <div class="bg-slate-950 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-10 text-center">
            <svg class="w-6 h-6 text-purple-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path>
            </svg>
            <div class="text-white text-sm font-light">Quiet</div>
            <div class="text-gray-400 text-xs">Noise Level</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="relative z-10 px-6 mb-6">
        <div class="bg-slate-950 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-10">
          <div class="flex justify-around">
            <button class="flex flex-col items-center p-3">
              <svg class="w-6 h-6 text-gray-300 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-300 text-xs">Sleep Tips</span>
            </button>
            
            <button class="flex flex-col items-center p-3">
              <svg class="w-6 h-6 text-gray-300 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.896-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.984 5.984 0 01-.757 2.828 1 1 0 11-1.415-1.656A3.989 3.989 0 0013 12a3.989 3.989 0 00-.172-1.172 1 1 0 010-1.657z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-300 text-xs">Sounds</span>
            </button>
            
            <button class="flex flex-col items-center p-3">
              <svg class="w-6 h-6 text-gray-300 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-300 text-xs">Alarm</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="relative z-10 mt-auto px-6 pb-8">
        <div class="bg-slate-950 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-10">
          <div class="flex justify-around">
            <div class="flex flex-col items-center">
              <svg class="w-6 h-6 text-gray-400 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
              <span class="text-gray-400 text-xs">Overview</span>
            </div>
            <div class="flex flex-col items-center">
              <svg class="w-6 h-6 text-blue-400 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-blue-400 text-xs">Track</span>
            </div>
            <div class="flex flex-col items-center">
              <svg class="w-6 h-6 text-gray-400 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-400 text-xs">Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
`;
