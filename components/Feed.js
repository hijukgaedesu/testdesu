import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Image, Smile, Calendar, MapPin, MessageCircle, Repeat, Heart, BarChart2, Share, Trash2 } from 'lucide-react';
import { Mood } from '../types.js';
import { analyzeDiaryEntry } from '../services/gemini.js';
import { saveEntry, deleteEntry } from '../services/storage.js';

const html = htm.bind(React.createElement);

export const Feed = ({ entries, setEntries }) => {
  const [inputText, setInputText] = useState('');
  const [selectedMood, setSelectedMood] = useState(Mood.Neutral);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-resize textarea
  const handleInput = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handlePost = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    const newEntryId = Date.now().toString();
    const tempEntry = {
      id: newEntryId,
      content: inputText,
      createdAt: Date.now(),
      mood: selectedMood,
    };

    try {
      // 1. Get AI analysis
      const analysis = await analyzeDiaryEntry(inputText, selectedMood);
      
      const finalEntry = {
        ...tempEntry,
        aiResponse: analysis.reply,
        aiAnalysisTags: analysis.tags
      };

      const updatedEntries = saveEntry(finalEntry);
      setEntries(updatedEntries);
      setInputText('');
      setSelectedMood(Mood.Neutral);
    } catch (error) {
        console.error("Error posting:", error);
        // Save without AI if fails
        const updatedEntries = saveEntry(tempEntry);
        setEntries(updatedEntries);
        setInputText('');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    <div className="flex-1 min-w-0 border-r border-gray-800 max-w-[600px]">
      <!-- Header -->
      <div className="sticky top-0 z-10 bg-black/60 backdrop-blur-md px-4 py-3 border-b border-gray-800 cursor-pointer">
        <h1 className="text-xl font-bold text-white">홈</h1>
      </div>

      <!-- Compose Box -->
      <div className="px-4 py-3 border-b border-gray-800 flex gap-4">
        <img src="https://picsum.photos/200" alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <textarea
            value=${inputText}
            onChange=${handleInput}
            placeholder="오늘 무슨 일이 있었나요?"
            className="w-full bg-transparent text-xl text-white outline-none resize-none placeholder-gray-500 min-h-[50px]"
            rows=${1}
          />
          ${isAnalyzing && html`
            <div className="text-blue-400 text-sm animate-pulse mb-2">
              Gemini가 내용을 분석하고 있어요... 
            </div>
          `}
          <div className="flex items-center justify-between border-t border-gray-800 pt-3 mt-2">
            <div className="flex gap-2 text-blue-400">
               <!-- Mood Selector Popover substitute for simplicity -->
               <div className="relative group">
                 <button className="p-2 hover:bg-blue-900/20 rounded-full transition-colors">
                   <${Smile} size=${20} />
                 </button>
                 <div className="absolute top-full left-0 bg-black border border-gray-700 rounded-lg p-2 flex gap-2 hidden group-hover:flex z-20">
                    ${Object.values(Mood).map((m) => html`
                        <button 
                            key=${m} 
                            onClick=${() => setSelectedMood(m)}
                            className=${`p-2 rounded hover:bg-gray-800 ${selectedMood === m ? 'bg-blue-900/30' : ''}`}
                            title=${m}
                        >
                            <${MoodIcon} mood=${m} />
                        </button>
                    `)}
                 </div>
               </div>
               <button className="p-2 hover:bg-blue-900/20 rounded-full transition-colors"><${Image} size=${20} /></button>
               <button className="p-2 hover:bg-blue-900/20 rounded-full transition-colors"><${Calendar} size=${20} /></button>
               <button className="p-2 hover:bg-blue-900/20 rounded-full transition-colors"><${MapPin} size=${20} /></button>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                   기분: <${MoodIcon} mood=${selectedMood} />
                </div>
                <button
                onClick=${handlePost}
                disabled=${!inputText.trim() || isAnalyzing}
                className=${`bg-[#1d9bf0] text-white font-bold px-4 py-2 rounded-full transition-colors ${(!inputText.trim() || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                게시하기
                </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feed List -->
      <div>
        ${entries.map((entry) => html`
          <div key=${entry.id} className="p-4 border-b border-gray-800 hover:bg-[#080808] transition-colors cursor-pointer relative group">
            <div className="flex gap-3">
              <img src="https://picsum.photos/200" alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <!-- User Info Row -->
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                    <span className="font-bold text-white">내 일기장</span>
                    <span className="text-gray-500">@my_diary</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 hover:underline">
                        ${new Date(entry.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    </div>
                    <button 
                        onClick=${(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                        <${Trash2} size=${16} />
                    </button>
                </div>

                <!-- Content -->
                <p className="text-white mt-1 whitespace-pre-wrap">${entry.content}</p>

                <!-- Mood & Tags -->
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-gray-900 border border-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        기분: <${MoodIcon} mood=${entry.mood} />
                    </span>
                    ${entry.aiAnalysisTags?.map(tag => html`
                        <span key=${tag} className="text-blue-400 text-sm hover:underline">${tag}</span>
                    `)}
                </div>

                <!-- AI Reply Block -->
                ${entry.aiResponse && html`
                    <div className="mt-3 border border-gray-700 rounded-2xl p-3 bg-blue-900/10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#1d9bf0] text-xs font-bold flex items-center gap-1">
                                <span className="bg-[#1d9bf0] text-white rounded-sm px-1 text-[10px]">AI</span>
                                Gemini Companion
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm">${entry.aiResponse}</p>
                    </div>
                `}

                <!-- Action Bar -->
                <div className="flex justify-between max-w-[425px] mt-3 text-gray-500">
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-blue-400">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-900/20 transition-colors">
                        <${MessageCircle} size=${18} />
                    </div>
                    <span className="text-xs">1</span>
                  </div>
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-green-400">
                    <div className="p-2 rounded-full group-hover/action:bg-green-900/20 transition-colors">
                        <${Repeat} size=${18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-pink-600">
                    <div className="p-2 rounded-full group-hover/action:bg-pink-900/20 transition-colors">
                        <${Heart} size=${18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 group/action cursor-pointer hover:text-blue-400">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-900/20 transition-colors">
                        <${BarChart2} size=${18} />
                    </div>
                  </div>
                   <div className="flex items-center gap-1 group/action cursor-pointer hover:text-blue-400">
                    <div className="p-2 rounded-full group-hover/action:bg-blue-900/20 transition-colors">
                        <${Share} size=${18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `)}
        <div className="h-40 text-center text-gray-600 py-10">
            더 이상 기록이 없습니다.
        </div>
      </div>
    </div>
  `;
};