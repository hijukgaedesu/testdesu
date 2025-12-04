
import React from 'react';
import htm from 'htm';
import { MessageCircle, Repeat, Heart, BarChart2, Share, Trash2 } from 'lucide-react';
import { Mood } from '../types.js';
import { deleteEntry } from '../services/storage.js';
import { ComposeBox } from './ComposeBox.js';

const html = htm.bind(React.createElement);

export const Feed = ({ entries, setEntries, userProfile, onProfileClick }) => {
  
  const handleDelete = (id) => {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      const updated = deleteEntry(id);
      setEntries(updated);
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
    <div className="flex-1 min-w-0 border-r border-gray-100 max-w-[600px]">
      <!-- Header -->
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 cursor-pointer">
        <h1 className="text-xl font-bold text-black">홈</h1>
      </div>

      <!-- Compose Box -->
      <${ComposeBox} 
        userProfile=${userProfile} 
        onPostSuccess=${setEntries} 
        onProfileClick=${onProfileClick}
      />

      <!-- Feed List -->
      <div>
        ${entries.map((entry) => html`
          <div key=${entry.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative group">
            <div className="flex gap-3">
              <img src=${userProfile?.avatarUrl || "https://picsum.photos/200"} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <!-- User Info Row -->
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                    <span className="font-bold text-black">${userProfile?.name}</span>
                    <span className="text-gray-500">${userProfile?.handle}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 hover:underline">
                        ${new Date(entry.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    </div>
                    <button 
                        onClick=${(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                        <${Trash2} size=${16} />
                    </button>
                </div>

                <!-- Content -->
                <p className="text-black mt-1 whitespace-pre-wrap">${entry.content}</p>

                <!-- Mood & Tags -->
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        기분: <${MoodIcon} mood=${entry.mood} />
                    </span>
                    ${entry.aiAnalysisTags?.map(tag => html`
                        <span key=${tag} className="text-[#1d9bf0] text-sm hover:underline">${tag}</span>
                    `)}
                </div>

                <!-- AI Reply Block -->
                ${entry.aiResponse && html`
                    <div className="mt-3 border border-gray-200 rounded-2xl p-3 bg-blue-50/50">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#1d9bf0] text-xs font-bold flex items-center gap-1">
                                <span className="bg-[#1d9bf0] text-white rounded-sm px-1 text-[10px]">AI</span>
                                Gemini Companion
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm">${entry.aiResponse}</p>
                    </div>
                `}

                <!-- Action Bar -->
                <div className="flex justify-between max-w-[425px] mt-3 text-gray-500">
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-[#1d9bf0]">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-50 transition-colors">
                        <${MessageCircle} size=${18} />
                    </div>
                    <span className="text-xs">1</span>
                  </div>
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-green-500">
                    <div className="p-2 rounded-full group-hover/action:bg-green-50 transition-colors">
                        <${Repeat} size=${18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-pink-600">
                    <div className="p-2 rounded-full group-hover/action:bg-pink-50 transition-colors">
                        <${Heart} size=${18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-[#1d9bf0]">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-50 transition-colors">
                        <${BarChart2} size=${18} />
                    </div>
                  </div>
                   <div className="flex items-center gap-1 group/action cursor-pointer hover:text-[#1d9bf0]">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-50 transition-colors">
                        <${Share} size=${18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `)}
        <div className="h-40 text-center text-gray-500 py-10">
            더 이상 기록이 없습니다.
        </div>
      </div>
    </div>
  `;
};
