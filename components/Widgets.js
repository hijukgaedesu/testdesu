

import React from 'react';
import htm from 'htm';
import { Search } from 'lucide-react';

const html = htm.bind(React.createElement);

export const Widgets = ({ entries, onTagClick }) => {
  
  // Calculate top hashtags from actual entries
  const tagCounts = entries.reduce((acc, entry) => {
    if (entry.aiAnalysisTags) {
        entry.aiAnalysisTags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
        });
    }
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5); // Top 5

  return html`
    <div className="hidden lg:flex flex-col w-[350px] pl-8 min-h-screen py-2 border-l border-gray-100 text-black">
      <!-- Search Bar -->
      <div className="sticky top-0 bg-white pt-1 pb-3 z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <${Search} className="text-gray-500 group-focus-within:text-[#1d9bf0]" size=${20} />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#eff3f4] text-black rounded-full py-3 pl-12 pr-4 outline-none focus:bg-white focus:ring-1 focus:ring-[#1d9bf0] border border-transparent focus:border-[#1d9bf0] transition-all placeholder-gray-500"
          />
        </div>
      </div>

      <!-- Trends for you -->
      <div className="bg-[#f7f9f9] rounded-2xl mt-4 py-3">
        <h2 className="text-xl font-bold mb-3 px-4 text-black">Trends for you</h2>
        <div className="flex flex-col">
          ${sortedTags.length > 0 ? sortedTags.map(([tag, count], idx) => html`
            <div 
                key=${idx} 
                onClick=${() => onTagClick(tag)}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <p className="text-gray-500 text-xs text-right mb-1">Trending in your diary</p>
              <p className="font-bold text-black">${tag}</p>
              <p className="text-gray-500 text-xs mt-1">${count} posts</p>
            </div>
          `) : html`
             <div className="px-4 py-4 text-gray-500 text-sm">
                No trends yet. Write some entries!
             </div>
          `}
        </div>
        ${sortedTags.length > 0 && html`
            <div className="p-4 text-[#1d9bf0] text-sm cursor-pointer hover:underline">
            Show more
            </div>
        `}
      </div>
      
      <!-- Footer-like Links -->
      <div className="px-4 mt-4 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
        <span className="hover:underline cursor-pointer">Terms of Service</span>
        <span className="hover:underline cursor-pointer">Privacy Policy</span>
        <span className="hover:underline cursor-pointer">Cookie Policy</span>
        <span className="hover:underline cursor-pointer">Accessibility</span>
        <span className="hover:underline cursor-pointer">Ads info</span>
        <span className="hover:underline cursor-pointer">More ...</span>
        <span>© 2024 Haru Tweet, Inc.</span>
      </div>
    </div>
  `;
};
