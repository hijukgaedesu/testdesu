
import React from 'react';
import htm from 'htm';
import { MessageCircle, Repeat, Heart, BarChart2, Share, Trash2, Bot, Bookmark } from 'lucide-react';
import { Mood } from '../types.js';
import { ComposeBox } from './ComposeBox.js';

const html = htm.bind(React.createElement);

export const Feed = ({ 
    entries, 
    setEntries, 
    userProfile, 
    onProfileClick, 
    aiSettings, 
    viewTitle = 'Home', 
    onDelete, 
    onToggleLike, 
    onToggleBookmark,
    isBookmarkView = false
}) => {
  
  const handleDeleteCheck = (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      onDelete(id);
    }
  };

  const MoodIcon = ({ mood }) => {
     switch(mood) {
         case Mood.Happy: return html`<span className="text-yellow-400">😊</span>`;
         case Mood.Excited: return html`<span className="text-orange-400">🤩</span>`;
         case Mood.Sad: return html`<span className="text-blue-400">😢</span>`;
         case Mood.Angry: return html`<span className="text-red-500">😡</span>`;
         default: return html`<span className="text-gray-400">😐</span>`;
     }
  };

  return html`
    <div className="flex-1 min-w-0 border-r border-gray-100 max-w-[600px] w-full">
      <!-- Header -->
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center gap-4 sm:block">
        <div className="sm:hidden cursor-pointer" onClick=${onProfileClick}>
           <img src=${userProfile?.avatarUrl || "https://picsum.photos/200"} className="w-8 h-8 rounded-full object-cover" />
        </div>
        <div className="flex flex-col">
            <h1 className="text-xl font-bold text-black">${viewTitle}</h1>
            ${isBookmarkView && html`<p className="text-xs text-gray-500">${entries.length} saved</p>`}
        </div>
      </div>

      <!-- Compose Box (Only on Home) -->
      ${!isBookmarkView && html`
        <${ComposeBox} 
            userProfile=${userProfile} 
            onPostSuccess=${setEntries} 
            onProfileClick=${onProfileClick}
        />
      `}

      <!-- Feed List -->
      <div>
        ${entries.map((entry) => html`
          <div key=${entry.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative group">
            <!-- Connector Line if AI Replied -->
            ${entry.aiResponse && html`
                <div className="absolute left-[34px] top-[50px] bottom-[20px] w-0.5 bg-gray-200 z-0"></div>
            `}

            <div className="flex gap-3 relative z-10">
              <img src=${userProfile?.avatarUrl || "https://picsum.photos/200"} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <!-- User Info Row -->
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 overflow-hidden">
                        <span className="font-bold text-black truncate">${userProfile?.name}</span>
                        <span className="text-gray-500 truncate hidden sm:inline">${userProfile?.handle}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm hover:underline whitespace-nowrap">
                            ${new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <button 
                            onClick=${(e) => { e.stopPropagation(); handleDeleteCheck(entry.id); }}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                            title="Delete"
                        >
                            <${Trash2} size=${16} />
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <p className="text-black mt-1 whitespace-pre-wrap break-words text-[15px] sm:text-base">${entry.content}</p>

                <!-- Image Attachment -->
                ${entry.imageUrl && html`
                    <div className="mt-3">
                        <img src=${entry.imageUrl} alt="Attached" className="rounded-2xl max-h-[400px] w-full object-cover border border-gray-100" />
                    </div>
                `}

                <!-- Mood & Tags -->
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        Mood: <${MoodIcon} mood=${entry.mood} />
                    </span>
                    ${entry.aiAnalysisTags?.map(tag => html`
                        <span key=${tag} className="text-[#1d9bf0] text-sm hover:underline">${tag}</span>
                    `)}
                </div>

                <!-- Action Bar -->
                <div className="flex justify-between max-w-[425px] mt-3 text-gray-500">
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-[#1d9bf0]">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-50 transition-colors">
                        <${MessageCircle} size=${18} />
                    </div>
                    <span className="text-xs">${entry.aiResponse ? 1 : 0}</span>
                  </div>
                  
                  <div 
                    className=${`flex items-center gap-1 group/action cursor-pointer ${entry.isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                    onClick=${(e) => { e.stopPropagation(); onToggleLike(entry.id); }}
                  >
                    <div className="p-2 rounded-full group-hover/action:bg-pink-50 transition-colors">
                        <${Heart} size=${18} className=${entry.isLiked ? 'fill-current' : ''} />
                    </div>
                    ${entry.isLiked && html`<span className="text-xs">1</span>`}
                  </div>

                  <div 
                    className=${`flex items-center gap-1 group/action cursor-pointer ${entry.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}
                    onClick=${(e) => { e.stopPropagation(); onToggleBookmark(entry.id); }}
                  >
                    <div className="p-2 rounded-full group-hover/action:bg-blue-50 transition-colors">
                        <${Bookmark} size=${18} className=${entry.isBookmarked ? 'fill-current' : ''} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-[#1d9bf0]">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-50 transition-colors">
                        <${Share} size=${18} />
                    </div>
                  </div>
                </div>

                <!-- AI Reply Section (Thread style) -->
                ${entry.aiResponse && html`
                    <div className="mt-4 pt-0">
                        <div className="flex gap-3">
                            <div className="w-10 flex flex-col items-center">
                                ${aiSettings?.avatarUrl 
                                  ? html`<img src=${aiSettings.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200" />`
                                  : html`
                                      <div className="bg-[#1d9bf0] p-1.5 rounded-full text-white">
                                          <${Bot} size=${20} />
                                      </div>
                                  `
                                }
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 relative">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-black text-sm">${aiSettings?.name || 'Gemini AI'}</span>
                                    <span className="text-gray-500 text-xs">${aiSettings?.handle || '@gemini_companion'}</span>
                                </div>
                                <p className="text-gray-800 text-sm whitespace-pre-wrap">${entry.aiResponse}</p>
                            </div>
                        </div>
                    </div>
                `}

              </div>
            </div>
          </div>
        `)}
        <div className="h-40 text-center text-gray-500 py-10">
            ${entries.length === 0 ? 'No entries found.' : 'No more entries.'}
        </div>
      </div>
    </div>
  `;
};
