
import React, { useState, useRef } from 'react';
import htm from 'htm';
import { Image, Smile, Calendar, MapPin, X } from 'lucide-react';
import { Mood } from '../types.js';
import { analyzeDiaryEntry } from '../services/gemini.js';
import { saveEntry } from '../services/storage.js';

const html = htm.bind(React.createElement);

export const ComposeBox = ({ userProfile, onPostSuccess, onProfileClick }) => {
  const [inputText, setInputText] = useState('');
  const [selectedMood, setSelectedMood] = useState(Mood.Neutral);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  const handleInput = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!inputText.trim() && !attachedImage) return;

    setIsAnalyzing(true);
    const newEntryId = Date.now().toString();
    const tempEntry = {
      id: newEntryId,
      content: inputText,
      createdAt: Date.now(),
      mood: selectedMood,
      imageUrl: attachedImage
    };

    try {
      // 1. Get AI analysis
      // Pass image boolean to AI if needed, but currently only text analysis
      const analysis = await analyzeDiaryEntry(inputText, selectedMood);
      
      const finalEntry = {
        ...tempEntry,
        aiResponse: analysis.reply,
        aiAnalysisTags: analysis.tags
      };

      const updatedEntries = saveEntry(finalEntry);
      onPostSuccess(updatedEntries); 
      setInputText('');
      setAttachedImage(null);
      setSelectedMood(Mood.Neutral);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Reset height
      const textarea = document.querySelector('.compose-textarea');
      if (textarea) textarea.style.height = 'auto';

    } catch (error) {
        console.error("Error posting:", error);
        // Save without AI if fails
        const updatedEntries = saveEntry(tempEntry);
        onPostSuccess(updatedEntries);
        setInputText('');
        setAttachedImage(null);
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
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 flex-shrink-0"
          onClick=${onProfileClick}
        />
        <div className="flex-1 min-w-0">
          <textarea
            value=${inputText}
            onChange=${handleInput}
            placeholder="What is happening?!"
            className="compose-textarea w-full bg-transparent text-lg sm:text-xl text-black outline-none resize-none placeholder-gray-500 min-h-[50px]"
            rows=${1}
          />
          
          <!-- Image Preview -->
          ${attachedImage && html`
            <div className="relative mt-2 mb-2">
                <img src=${attachedImage} alt="Preview" className="rounded-2xl max-h-[300px] w-full object-cover border border-gray-100" />
                <button 
                    onClick=${removeImage}
                    className="absolute top-2 left-2 bg-black/70 p-1.5 rounded-full text-white hover:bg-black/50 transition-colors"
                >
                    <${X} size=${18} />
                </button>
            </div>
          `}

          ${isAnalyzing && html`
            <div className="text-[#1d9bf0] text-sm animate-pulse mb-2">
              Gemini is replying... 
            </div>
          `}

          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
            <div className="flex gap-0 sm:gap-2 text-[#1d9bf0]">
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
               
               <input 
                 type="file" 
                 accept="image/*" 
                 ref=${fileInputRef} 
                 onChange=${handleFileChange} 
                 className="hidden" 
               />
               <button onClick=${handleImageClick} className="p-2 hover:bg-blue-50 rounded-full transition-colors"><${Image} size=${20} /></button>
               <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><${Calendar} size=${20} /></button>
               <button className="p-2 hover:bg-blue-50 rounded-full transition-colors"><${MapPin} size=${20} /></button>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                   <span className="hidden sm:inline">Mood:</span> <${MoodIcon} mood=${selectedMood} />
                </div>
                <button
                    onClick=${handlePost}
                    disabled=${(!inputText.trim() && !attachedImage) || isAnalyzing}
                    className=${`bg-[#1d9bf0] text-white font-bold px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base transition-colors ${((!inputText.trim() && !attachedImage) || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a8cd8]'}`}
                >
                    <span className="sm:hidden">Post</span>
                    <span className="hidden sm:inline">Post</span>
                </button>
            </div>
          </div>
        </div>
      </div>
  `;
};
