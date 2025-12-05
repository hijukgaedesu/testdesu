
import React from 'react';
import htm from 'htm';
import { MessageCircle, Heart, Share, Trash2, Bot, Bookmark } from 'lucide-react';
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
    onToggleAiLike, 
    onToggleAiBookmark, 
    onDeleteAiReply, 
    onTagClick, 
    isBookmarkView = false 
}) => {
  
  const handleDeleteCheck = (id) => {
    // Immediate deletion as requested
    onDelete(id);
  };

  const handleAiDeleteCheck = (entryId, aiId) => {
    // Immediate deletion as requested
    onDeleteAiReply(entryId, aiId);
  };

  // Helper to normalize responses into an array
  const getResponses = (entry) => {
    let responses = [];
    if (entry.aiResponses) {
        responses = entry.aiResponses;
    } else if (entry.aiResponse) {
        // Legacy fallback
        responses = [{
            aiId: entry.aiId,
            reply: entry.aiResponse,
            isLiked: entry.aiIsLiked,
            isBookmarked: entry.aiIsBookmarked
        }];
    }
    return responses;
  };

  // Helper to find the AI config for a specific ID
  const getAiInfo = (id) => {
      if (aiSettings?.ais) {
          return aiSettings.ais.find(ai => ai.id === id) || { name: 'AI', handle: '@ai' };
      }
      return { name: 'AI', handle: '@ai' };
  };

  return html`
    <div className="flex-1 min-w-0 border-r border-gray-100 max-w-[600px] w-full">
      <!-- Header -->
      <div className="sticky top-0 z-20 bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-4 sm:block">
        <div className="sm:hidden cursor-pointer" onClick=${onProfileClick}>
           <img src=${userProfile?.avatarUrl || "https://picsum.photos/200"} className="w-8 h-8 rounded-full object-cover" />
        </div>
        <div className="flex flex-col">
            <h1 className="text-xl font-bold text-black">${viewTitle}</h1>
            ${isBookmarkView && html`<p className="text-xs text-gray-500">${entries.length} saved</p>`}
        </div>
      </div>

      <!-- Compose Box (Only on Home and not in filtered view) -->
      ${!isBookmarkView && viewTitle === 'Home' && html`
        <${ComposeBox} 
            userProfile=${userProfile} 
            onPostSuccess=${setEntries} 
            onProfileClick=${onProfileClick}
        />
      `}

      <!-- Feed List -->
      <div>
        ${entries.map((entry) => {
          const responses = getResponses(entry);
          
          return html`
          <div key=${entry.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative group">
            <!-- Connector Line if AI Replied -->
            ${responses.length > 0 && html`
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
                </div>

                <!-- Content -->
                <p className="text-black mt-1 whitespace-pre-wrap break-words text-[15px] sm:text-base">${entry.content}</p>

                <!-- Image Attachment -->
                ${entry.imageUrl && html`
                    <div className="mt-3">
                        <img src=${entry.imageUrl} alt="Attached" className="rounded-2xl max-h-[400px] w-full object-cover border border-gray-100" />
                    </div>
                `}

                <!-- Tags -->
                ${entry.aiAnalysisTags && entry.aiAnalysisTags.length > 0 && html`
                    <div className="flex flex-wrap gap-2 mt-3">
                        ${entry.aiAnalysisTags.map(tag => html`
                            <span 
                                key=${tag} 
                                onClick=${(e) => { e.stopPropagation(); onTagClick && onTagClick(tag); }}
                                className="text-[#1d9bf0] text-sm hover:underline cursor-pointer"
                            >
                                ${tag}
                            </span>
                        `)}
                    </div>
                `}

                <!-- User Action Bar -->
                <div className="flex justify-between max-w-[425px] mt-3 text-gray-500">
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-[#1d9bf0]">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-50 transition-colors">
                        <${MessageCircle} size=${18} />
                    </div>
                    <span className="text-xs">${responses.length}</span>
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
                  
                  <div 
                    onClick=${(e) => { e.stopPropagation(); handleDeleteCheck(entry.id); }}
                    className="flex items-center gap-1 group/action cursor-pointer hover:text-red-500"
                    title="Delete Post"
                  >
                    <div className="p-2 rounded-full group-hover/action:bg-red-50 transition-colors">
                         <${Trash2} size=${18} />
                    </div>
                  </div>
                </div>

                <!-- AI Reply Section (Thread style) -->
                ${responses.length > 0 && html`
                    <div className="mt-4 pt-0 space-y-4">
                        ${responses.map(response => {
                            const replyAi = getAiInfo(response.aiId);
                            return html`
                                <div key=${response.aiId} className="flex gap-3">
                                    <div className="w-10 flex flex-col items-center">
                                        ${replyAi.avatarUrl 
                                        ? html`<img src=${replyAi.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200" />`
                                        : html`
                                            <div className="bg-[#1d9bf0] p-1.5 rounded-full text-white">
                                                <${Bot} size=${20} />
                                            </div>
                                        `
                                        }
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 relative">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-black text-sm">${replyAi.name}</span>
                                            <span className="text-gray-500 text-xs">${replyAi.handle}</span>
                                        </div>
                                        <p className="text-gray-800 text-sm whitespace-pre-wrap">${response.reply}</p>
                                        
                                        <!-- AI Action Bar -->
                                        <div className="flex gap-4 mt-3 text-gray-500">
                                            <div 
                                                className=${`flex items-center gap-1 group/action cursor-pointer ${response.isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                                                onClick=${(e) => { e.stopPropagation(); onToggleAiLike(entry.id, response.aiId); }}
                                            >
                                                <${Heart} size=${14} className=${response.isLiked ? 'fill-current' : ''} />
                                            </div>

                                            <div 
                                                className=${`flex items-center gap-1 group/action cursor-pointer ${response.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}
                                                onClick=${(e) => { e.stopPropagation(); onToggleAiBookmark(entry.id, response.aiId); }}
                                            >
                                                <${Bookmark} size=${14} className=${response.isBookmarked ? 'fill-current' : ''} />
                                            </div>
                                            
                                            <div 
                                                className="flex items-center gap-1 group/action cursor-pointer hover:text-red-500"
                                                onClick=${(e) => { e.stopPropagation(); handleAiDeleteCheck(entry.id, response.aiId); }}
                                                title="Delete Reply"
                                            >
                                                <${Trash2} size=${14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        })}
                    </div>
                `}

              </div>
            </div>
          </div>
        `})}
        <div className="h-40 text-center text-gray-500 py-10">
            ${entries.length === 0 ? 'No posts found.' : 'No more posts.'}
        </div>
      </div>
    </div>
  `;
};
