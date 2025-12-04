
import React, { useState } from 'react';
import htm from 'htm';
import { Image, Smile, Calendar, MapPin } from 'lucide-react';
import { Mood } from '../types.js';
import { analyzeDiaryEntry } from '../services/gemini.js';
import { saveEntry } from '../services/storage.js';

const html = htm.bind(React.createElement);

export const ComposeBox = ({ userProfile, onPostSuccess, onProfileClick }) => {
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
      onPostSuccess(updatedEntries); // Callback to update parent state
      setInputText('');
      setSelectedMood(Mood.Neutral);
      
      // Reset height
      const textarea = document.querySelector('.compose-textarea');
      if (textarea) textarea.style.height = 'auto';

    } catch (error) {
        console.error("Error posting:", error);
        // Save without AI if fails
        const updatedEntries = saveEntry(tempEntry);
        onPostSuccess(updatedEntries);
        setInputText('');
    } finally {
      setIsAnalyzing(false);
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
    <div className="px-4 py-3 border-b border-gray-100 flex gap-4">
        <img 
          src=${userProfile?.avatarUrl || "https://picsum.photos/200"} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90"
          onClick=${onProfileClick}
        />
        <div className="flex-1">
          <textarea
            value=${inputText}
            onChange=${handleInput}
            placeholder="오늘 무슨 일이 있었나요?"
            className="compose-textarea w-full bg-transparent text-xl text-black outline-none resize-none placeholder-gray-500 min-h-[50px]"
            rows=${1}
          />
          ${isAnalyzing && html`
            <div className="text-[#1d9bf0] text-sm animate-pulse mb-2">
              Gemini가 내용을 분석하고 있어요... 
            </div>
          `}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
            <div className="flex gap-2 text-[#1d9bf0]">
               <!-- Mood Selector -->
               <div className="relative group">
                 <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                   <${Smile} size=${20} />
                 </button>
                 <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-lg p-2 flex gap-2 hidden group-hover:flex z-20">
                    ${Object.values(Mood).map((m) => html`
                        <button 
                            key=${m} 
                            onClick=${() => setSelectedMood(m)}
                            className=${`p-2 rounded hover:bg-gray-100 ${selectedMood === m ? 'bg-blue-50' : ''}`}
                            title=${m}
                        >
                            <${MoodIcon} mood=${m} />
                        </button>
                    `)}
                 </div>
               </div>
               <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><${Image} size=${20} /></button>
               <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><${Calendar} size=${20} /></button>
               <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><${MapPin} size=${20} /></button>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                   기분: <${MoodIcon} mood=${selectedMood} />
                </div>
                <button
                onClick=${handlePost}
                disabled=${!inputText.trim() || isAnalyzing}
                className=${`bg-[#1d9bf0] text-white font-bold px-4 py-2 rounded-full transition-colors ${(!inputText.trim() || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a8cd8]'}`}
                >
                게시하기
                </button>
            </div>
          </div>
        </div>
      </div>
  `;
};
