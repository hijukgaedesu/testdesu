
import React, { useState } from 'react';
import htm from 'htm';
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon, MoreHorizontal } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal.js';
import { ComposeBox } from './ComposeBox.js';
import { Mood } from '../types.js';

const html = htm.bind(React.createElement);

export const Profile = ({ userProfile, entries, setEntries }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter entries for this user (currently all entries are local user's)
  const myEntries = entries;

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
      <!-- Header with Back Button (Visual only since we use tab nav) -->
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-1 border-b border-gray-100 flex items-center gap-4 h-[53px]">
        <div className="cursor-pointer hover:bg-gray-200 p-2 rounded-full transition-colors">
            <${ArrowLeft} size=${20} className="text-black" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-black leading-5">${userProfile.name}</h2>
            <!-- Count Removed -->
        </div>
      </div>

      <!-- Hero / Banner -->
      <div className="h-[200px] bg-gray-200 relative">
         ${userProfile.headerUrl && html`
            <img src=${userProfile.headerUrl} alt="Header" className="w-full h-full object-cover" />
         `}
      </div>

      <!-- Profile Info Section -->
      <div className="px-4 pb-4 relative">
        <div className="flex justify-between items-start">
            <div className="-mt-[15%] w-[25%] min-w-[120px]">
                <img 
                    src=${userProfile.avatarUrl} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
            </div>
            <div className="mt-3">
                <button 
                    onClick=${() => setIsEditModalOpen(true)}
                    className="border border-gray-300 font-bold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-black"
                >
                    프로필 수정
                </button>
            </div>
        </div>

        <div className="mt-4">
            <h1 className="text-xl font-bold text-black">${userProfile.name}</h1>
            <p className="text-gray-500">@${userProfile.handle.replace('@', '')}</p>
        </div>

        <div className="mt-4 text-black whitespace-pre-wrap">
            ${userProfile.bio}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-gray-500 text-sm">
            ${userProfile.location && html`
                <div className="flex items-center gap-1">
                    <${MapPin} size=${16} />
                    <span>${userProfile.location}</span>
                </div>
            `}
            <div className="flex items-center gap-1">
                <${Calendar} size=${16} />
                <span>가입일: 2024년 3월</span>
            </div>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
            <span className="text-black font-bold hover:underline cursor-pointer">
                ${userProfile.following || 10} <span className="text-gray-500 font-normal">팔로잉</span>
            </span>
            <span className="text-black font-bold hover:underline cursor-pointer">
                ${userProfile.followers || 42} <span className="text-gray-500 font-normal">팔로워</span>
            </span>
        </div>
      </div>

      <!-- Tabs -->
      <div className="flex border-b border-gray-100 mt-2">
         <div className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center font-bold text-black relative">
            게시물
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>
         </div>
         <div className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
            답글
         </div>
         <div className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
            미디어
         </div>
         <div className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center text-gray-500 font-medium">
            마음에 들어요
         </div>
      </div>

      <!-- Compose Box in Profile -->
      <${ComposeBox} 
        userProfile=${userProfile} 
        onPostSuccess=${setEntries} 
      />

      <!-- Profile Feed (Reusing simple list for now) -->
      <div>
        ${myEntries.map((entry) => html`
            <div key=${entry.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                 <div className="flex gap-3">
                    <img src=${userProfile.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                        <div className="flex items-center gap-1">
                             <span className="font-bold text-black">${userProfile.name}</span>
                             <span className="text-gray-500">@${userProfile.handle.replace('@', '')}</span>
                             <span className="text-gray-500">·</span>
                             <span className="text-gray-500 text-sm">${new Date(entry.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <p className="text-black mt-1 whitespace-pre-wrap">${entry.content}</p>
                        <div className="mt-2 text-sm text-gray-500 flex gap-2">
                             <span>기분: <${MoodIcon} mood=${entry.mood} /></span>
                        </div>
                    </div>
                 </div>
            </div>
        `)}
      </div>

      <!-- Edit Modal -->
      ${isEditModalOpen && html`
        <${EditProfileModal} 
            userProfile=${userProfile} 
            onClose=${() => setIsEditModalOpen(false)} 
        />
      `}
    </div>
  `;
};
