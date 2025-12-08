
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { ArrowLeft, Calendar, MapPin, Bot, Heart, Save, Camera, MessageCircle, Share, Bookmark, Trash2, CheckCircle, Key, Plus, Download, Upload, Copy } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal.js';
import { ComposeBox } from './ComposeBox.js';
import { saveAISettings, getAllData, restoreData } from '../services/storage.js';

const html = htm.bind(React.createElement);

export const Profile = ({ 
    userProfile, 
    entries, 
    setEntries, 
    onBackClick, 
    onDrawerOpen, 
    aiSettings, 
    onDelete, 
    onToggleLike, 
    onToggleBookmark, 
    onToggleAiLike, 
    onToggleAiBookmark, 
    onDeleteAiReply, 
    defaultTab 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab || 'posts'); 
  
  // AI Settings State
  const [localAiSettings, setLocalAiSettings] = useState(aiSettings);
  const [editingAiId, setEditingAiId] = useState(1);
  const [apiKey, setApiKey] = useState('');
  
  // Sync State
  const [syncData, setSyncData] = useState('');
  const [importText, setImportText] = useState('');

  const aiAvatarInputRef = useRef(null);

  useEffect(() => {
    if (aiSettings) {
        setLocalAiSettings(aiSettings);
        if (!editingAiId && aiSettings.ais.length > 0) {
            setEditingAiId(aiSettings.ais[0].id);
        }
    }
  }, [aiSettings]);

  // Load API Key
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  // Update active tab when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
        setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Helper: Get the AI object currently being edited
  const currentEditingAi = localAiSettings.ais?.find(ai => ai.id === editingAiId) || {};

  // Filter entries for Profile Feed
  let displayedEntries = entries;
  if (activeTab === 'likes') {
      displayedEntries = entries.filter(e => {
        if (e.isLiked) return true;
        if (e.aiIsLiked) return true; // Legacy
        if (e.aiResponses && e.aiResponses.some(r => r.isLiked)) return true;
        return false;
      });
  }

  const handleAiConfigChange = (e) => {
    const { name, value } = e.target;
    setLocalAiSettings(prev => {
        const updatedAis = prev.ais.map(ai => 
            ai.id === editingAiId ? { ...ai, [name]: value } : ai
        );
        return { ...prev, ais: updatedAis };
    });
  };

  const handleAiAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalAiSettings(prev => {
            const updatedAis = prev.ais.map(ai => 
                ai.id === editingAiId ? { ...ai, avatarUrl: reader.result } : ai
            );
            return { ...prev, ais: updatedAis };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleActiveAi = (id) => {
      setLocalAiSettings(prev => {
          const currentActiveIds = prev.activeAiIds || [];
          let newActiveIds;
          if (currentActiveIds.includes(id)) {
              if (currentActiveIds.length === 1) return prev;
              newActiveIds = currentActiveIds.filter(aid => aid !== id);
          } else {
              newActiveIds = [...currentActiveIds, id];
          }
          return { ...prev, activeAiIds: newActiveIds };
      });
  };

  const handleAddAi = () => {
      if (localAiSettings.ais.length >= 2) return;
      
      const newId = Date.now();
      const newAi = {
          id: newId,
          name: 'New AI',
          handle: '@new_ai',
          persona: 'You are a helpful assistant.',
          avatarUrl: ''
      };

      setLocalAiSettings(prev => ({
          ...prev,
          ais: [...prev.ais, newAi],
          activeAiIds: [...(prev.activeAiIds || []), newId] 
      }));
      setEditingAiId(newId);
  };

  const handleDeleteAi = () => {
      if (localAiSettings.ais.length <= 1) return;

      if (confirm('Are you sure you want to delete this AI?')) {
          setLocalAiSettings(prev => {
              const remainingAis = prev.ais.filter(ai => ai.id !== editingAiId);
              const newActiveIds = (prev.activeAiIds || [])
                .filter(id => id !== editingAiId);
              
              if (newActiveIds.length === 0 && remainingAis.length > 0) {
                  newActiveIds.push(remainingAis[0].id);
              }

              setEditingAiId(remainingAis[0].id);
              
              return {
                  ...prev,
                  ais: remainingAis,
                  activeAiIds: newActiveIds
              };
          });
      }
  };

  const saveAiConfig = () => {
    saveAISettings(localAiSettings);
    window.dispatchEvent(new Event('aiSettingsUpdated'));
    alert('AI Settings Saved!');
  };

  const handleSaveApiKey = () => {
      localStorage.setItem('gemini_api_key', apiKey);
      alert('API Key Saved! AI features are now enabled.');
  };
  
  const handleExportData = () => {
      const data = getAllData();
      const jsonStr = JSON.stringify(data);
      setSyncData(jsonStr);
      navigator.clipboard.writeText(jsonStr).then(() => {
          alert("Sync code copied to clipboard! Send this to your desktop/mobile to load your data.");
      });
  };
  
  const handleImportData = () => {
      if (!importText.trim()) return;
      try {
          const data = JSON.parse(importText);
          const success = restoreData(data);
          if (success) {
              alert("Data restored successfully! reloading...");
              window.location.reload();
          } else {
              alert("Failed to restore data. Invalid format.");
          }
      } catch (e) {
          alert("Invalid JSON format.");
      }
  };

  const handleDeleteCheck = (id) => {
    onDelete(id);
  };

  const handleAiDeleteCheck = (entryId, aiId) => {
    onDeleteAiReply(entryId, aiId);
  };

  const getResponses = (entry) => {
    let responses = [];
    if (entry.aiResponses) {
        responses = entry.aiResponses;
    } else if (entry.aiResponse) {
        responses = [{
            aiId: entry.aiId,
            reply: entry.aiResponse,
            isLiked: entry.aiIsLiked,
            isBookmarked: entry.aiIsBookmarked
        }];
    }
    return responses;
  };

  const getAiInfo = (id) => {
      if (aiSettings?.ais) {
          return aiSettings.ais.find(ai => ai.id === id) || { name: 'AI', handle: '@ai' };
      }
      return { name: 'AI', handle: '@ai' };
  };

  return html`
    <div className="flex-1 min-w-0 border-r border-gray-100 max-w-[600px] w-full">
      <!-- Header with Back Button -->
      <div className="sticky top-0 z-20 bg-white px-4 py-1 border-b border-gray-100 flex items-center gap-4 h-[53px]">
        <div onClick=${onBackClick} className="cursor-pointer hover:bg-gray-200 p-2 rounded-full transition-colors">
            <${ArrowLeft} size=${20} className="text-black" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-black leading-5">${userProfile.name}</h2>
            <p className="text-xs text-gray-500">${entries.length} posts</p>
        </div>
      </div>

      <!-- Hero / Banner -->
      <div className="h-[150px] sm:h-[200px] bg-gray-200 relative">
         ${userProfile.headerUrl && html`
            <img src=${userProfile.headerUrl} alt="Header" className="w-full h-full object-cover" />
         `}
      </div>

      <!-- Profile Info Section -->
      <div className="px-4 pb-4 relative">
        <div className="flex justify-between items-start">
            <div className="-mt-[15%] w-[25%] min-w-[80px] max-w-[130px]">
                <img 
                    src=${userProfile.avatarUrl} 
                    alt="Profile" 
                    className="w-full aspect-square rounded-full border-4 border-white object-cover"
                />
            </div>
            <div className="mt-3">
                <button 
                    onClick=${() => setIsEditModalOpen(true)}
                    className="border border-gray-300 font-bold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-black text-sm sm:text-base"
                >
                    Edit profile
                </button>
            </div>
        </div>

        <div className="mt-3">
            <h1 className="text-xl font-bold text-black">${userProfile.name}</h1>
            <p className="text-gray-500 text-sm">${userProfile.handle}</p>
        </div>

        <div className="mt-3 text-black whitespace-pre-wrap text-[15px]">
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
                <span>Joined March 2024</span>
            </div>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
            <span className="text-black font-bold hover:underline cursor-pointer">
                ${userProfile.following || 10} <span className="text-gray-500 font-normal">Following</span>
            </span>
            <span className="text-black font-bold hover:underline cursor-pointer">
                ${userProfile.followers || 42} <span className="text-gray-500 font-normal">Followers</span>
            </span>
        </div>
      </div>

      <!-- Tabs -->
      <div className="flex border-b border-gray-100 mt-2 overflow-x-auto no-scrollbar">
         <div onClick=${() => setActiveTab('posts')} className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center relative min-w-fit whitespace-nowrap">
            <span className=${activeTab === 'posts' ? 'font-bold text-black' : 'text-gray-500 font-medium'}>Posts</span>
            ${activeTab === 'posts' && html`<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>`}
         </div>
         <div onClick=${() => setActiveTab('media')} className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center relative min-w-fit whitespace-nowrap">
            <span className=${activeTab === 'media' ? 'font-bold text-black' : 'text-gray-500 font-medium'}>Media</span>
             ${activeTab === 'media' && html`<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>`}
         </div>
         <div onClick=${() => setActiveTab('likes')} className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center relative min-w-fit whitespace-nowrap flex justify-center items-center">
             <${Heart} size=${20} className=${activeTab === 'likes' ? 'text-black fill-current' : 'text-gray-500'} />
             ${activeTab === 'likes' && html`<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>`}
         </div>
         <div onClick=${() => setActiveTab('ai_settings')} className="flex-1 hover:bg-gray-100 transition-colors cursor-pointer p-4 text-center relative min-w-fit whitespace-nowrap">
            <span className=${activeTab === 'ai_settings' ? 'font-bold text-black' : 'text-gray-500 font-medium'}>AI Settings</span>
             ${activeTab === 'ai_settings' && html`<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#1d9bf0] rounded-full"></div>`}
         </div>
      </div>

      <!-- Content Area -->
      ${(activeTab === 'posts' || activeTab === 'likes') && html`
        ${activeTab === 'posts' && html`
            <${ComposeBox} 
                userProfile=${userProfile} 
                onPostSuccess=${setEntries}
                onProfileClick=${onDrawerOpen} 
            />
        `}
        <div>
            ${displayedEntries.map((entry) => {
                const responses = getResponses(entry);
                return html`
                <div key=${entry.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative">
                    ${responses.length > 0 && html`
                        <div className="absolute left-[34px] top-[50px] bottom-[20px] w-0.5 bg-gray-200 z-0"></div>
                    `}
                    <div className="flex gap-3 relative z-10">
                        <img src=${userProfile.avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-black truncate">${userProfile.name}</span>
                                    <span className="text-gray-500 text-sm truncate">${userProfile.handle}</span>
                                    <span className="text-gray-500 text-sm">·</span>
                                    <span className="text-gray-500 text-sm whitespace-nowrap">${new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>

                            <p className="text-black mt-1 whitespace-pre-wrap break-words text-[15px] sm:text-base">${entry.content}</p>
                            
                            ${entry.imageUrl && html`
                                <div className="mt-3">
                                    <img src=${entry.imageUrl} alt="Attached" className="rounded-2xl max-h-[300px] w-full object-cover border border-gray-100" />
                                </div>
                            `}

                            <!-- Action Bar -->
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

                            <!-- AI Replies -->
                            ${responses.length > 0 && html`
                                <div className="mt-3 space-y-3">
                                    ${responses.map(response => {
                                        const replyAi = getAiInfo(response.aiId);
                                        return html`
                                            <div key=${response.aiId} className="flex gap-3 pt-1">
                                                <div className="w-8 h-8 flex-shrink-0">
                                                    ${replyAi.avatarUrl 
                                                    ? html`<img src=${replyAi.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200" />`
                                                    : html`
                                                        <div className="w-full h-full bg-[#1d9bf0] p-1.5 rounded-full text-white flex items-center justify-center">
                                                            <${Bot} size=${16} />
                                                        </div>
                                                    `
                                                    }
                                                </div>
                                                <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-black text-sm">${replyAi.name}</span>
                                                    </div>
                                                    <p className="text-gray-800 text-sm whitespace-pre-wrap">${response.reply}</p>
                                                    
                                                    <!-- AI Action Bar -->
                                                    <div className="flex gap-4 mt-2 text-gray-500">
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
            `;
            })}
             <div className="h-40 text-center text-gray-500 py-10">
                ${displayedEntries.length === 0 ? 'Nothing here.' : 'No more posts.'}
            </div>
        </div>
      `}

      ${activeTab === 'ai_settings' && html`
        <div className="p-6 pb-20">
            <h3 className="text-xl font-bold mb-4">Settings</h3>
            
            <!-- API Key Setup -->
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <${Key} size=${18} className="text-[#1d9bf0]" />
                    <h4 className="font-bold text-black">API Key Setup</h4>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                    Enter your Gemini API Key to enable AI features.
                </p>
                <div className="flex gap-2">
                    <div className="flex-1 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#1d9bf0] focus-within:border-[#1d9bf0] px-3 py-1 relative bg-white">
                        <label className="text-xs text-gray-500 block">Gemini API Key</label>
                        <input 
                            type="password" 
                            value=${apiKey}
                            onChange=${(e) => setApiKey(e.target.value)}
                            className="w-full bg-transparent text-black outline-none py-1"
                            placeholder="AIza..."
                        />
                    </div>
                    <button 
                        onClick=${handleSaveApiKey}
                        className="bg-black text-white font-bold px-4 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap h-auto"
                    >
                        Save
                    </button>
                </div>
            </div>

            <!-- Cross Device Sync -->
            <div className="mb-8 p-4 bg-[#f0f9ff] rounded-xl border border-blue-100">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-[#1d9bf0] rounded text-white"><${Share} size=${14} /></div>
                    <h4 className="font-bold text-black">Cross-Device Sync (Backup/Restore)</h4>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                    Since this is a private app without a central server, data is stored on your device. 
                    To move your data (Desktop ↔ Mobile), copy the Sync Code below.
                </p>
                
                <div className="flex flex-col gap-4">
                    <!-- Export -->
                    <div>
                        <button 
                            onClick=${handleExportData}
                            className="flex items-center gap-2 text-sm font-bold text-[#1d9bf0] hover:underline mb-2"
                        >
                            <${Copy} size=${16} /> Copy Sync Code (Export)
                        </button>
                        ${syncData && html`
                            <div className="text-[10px] text-gray-400 break-all bg-white p-2 rounded border border-gray-200 max-h-[60px] overflow-hidden">
                                ${syncData.substring(0, 100)}... (Copied to clipboard)
                            </div>
                        `}
                    </div>

                    <!-- Import -->
                    <div className="border-t border-blue-100 pt-3">
                         <label className="text-xs font-bold text-gray-700 block mb-1">Paste Sync Code to Restore (Import)</label>
                         <div className="flex gap-2">
                             <input 
                                type="text"
                                value=${importText}
                                onChange=${(e) => setImportText(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm outline-none focus:border-[#1d9bf0]"
                                placeholder="Paste JSON code here..."
                             />
                             <button 
                                onClick=${handleImportData}
                                className="bg-[#1d9bf0] text-white text-xs font-bold px-3 py-1 rounded-md hover:bg-[#1a8cd8] transition-colors whitespace-nowrap"
                             >
                                <${Download} size=${14} className="inline mr-1" /> Restore
                             </button>
                         </div>
                    </div>
                </div>
            </div>

            <!-- AI Configuration Header -->
            <h3 className="text-lg font-bold mb-3 mt-8">AI Personas</h3>

            <!-- AI Selector Tabs -->
            <div className="flex gap-2 mb-6 overflow-x-auto">
                ${localAiSettings.ais.map(ai => html`
                    <button 
                        key=${ai.id}
                        onClick=${() => setEditingAiId(ai.id)}
                        className=${`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-colors whitespace-nowrap border ${editingAiId === ai.id ? 'bg-[#1d9bf0] text-white border-[#1d9bf0]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                    >
                        ${ai.name || `AI ${ai.id}`}
                    </button>
                `)}
                
                ${localAiSettings.ais.length < 2 && html`
                    <button 
                        onClick=${handleAddAi}
                        className="py-2 px-4 rounded-md font-medium text-sm transition-colors border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
                        title="Add another AI (Max 2)"
                    >
                        <${Plus} size=${16} />
                    </button>
                `}
            </div>

            <!-- Active Toggle -->
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                <div>
                    <h4 className="font-bold text-black">Active Feed Companion</h4>
                    <p className="text-xs text-gray-600">This AI will reply to your new posts.</p>
                </div>
                <button 
                    onClick=${() => toggleActiveAi(editingAiId)}
                    className=${`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${(localAiSettings.activeAiIds || []).includes(editingAiId) ? 'bg-[#1d9bf0] border-[#1d9bf0]' : 'border-gray-300'}`}
                >
                     ${(localAiSettings.activeAiIds || []).includes(editingAiId) && html`<${CheckCircle} size=${16} className="text-white" />`}
                </button>
            </div>

            <div className="flex flex-col gap-6">
                 <!-- AI Avatar Upload -->
                 <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 block">Avatar</label>
                    <div className="flex items-center gap-4">
                        <div className="relative group w-20 h-20">
                            ${currentEditingAi.avatarUrl 
                                ? html`<img src=${currentEditingAi.avatarUrl} className="w-full h-full rounded-full object-cover border border-gray-200" />`
                                : html`<div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><${Bot} size=${32} /></div>`
                            }
                            <button 
                                onClick=${() => aiAvatarInputRef.current.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                            >
                                <${Camera} size=${24} />
                            </button>
                        </div>
                        <div className="flex-1">
                            <button 
                                onClick=${() => aiAvatarInputRef.current.click()}
                                className="text-[#1d9bf0] font-bold text-sm hover:underline"
                            >
                                Upload Image
                            </button>
                            <input 
                                type="file" 
                                ref=${aiAvatarInputRef} 
                                onChange=${handleAiAvatarUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                    </div>
                 </div>

                 <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#1d9bf0] focus-within:border-[#1d9bf0] px-3 py-1 relative group">
                    <label className="text-xs text-gray-500 group-focus-within:text-[#1d9bf0] block">Name</label>
                    <input 
                        type="text"
                        name="name"
                        value=${currentEditingAi.name || ''}
                        onChange=${handleAiConfigChange}
                        className="w-full bg-transparent text-black outline-none py-1"
                        placeholder="e.g. Jarvis"
                    />
                </div>
                
                 <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#1d9bf0] focus-within:border-[#1d9bf0] px-3 py-1 relative group">
                    <label className="text-xs text-gray-500 group-focus-within:text-[#1d9bf0] block">Handle</label>
                    <input 
                        type="text"
                        name="handle"
                        value=${currentEditingAi.handle || ''}
                        onChange=${handleAiConfigChange}
                        className="w-full bg-transparent text-black outline-none py-1"
                        placeholder="e.g. @ai_friend"
                    />
                </div>

                <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#1d9bf0] focus-within:border-[#1d9bf0] p-2 relative group">
                    <label className="text-xs text-gray-500 group-focus-within:text-[#1d9bf0] block">Persona / System Prompt</label>
                    <textarea 
                        name="persona"
                        value=${currentEditingAi.persona || ''}
                        onChange=${handleAiConfigChange}
                        className="w-full bg-transparent text-black outline-none mt-1 resize-none h-[150px]"
                        placeholder="Describe how the AI should behave..."
                    ></textarea>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick=${saveAiConfig}
                        className="flex-1 bg-[#1d9bf0] text-white font-bold py-3 rounded-full hover:bg-[#1a8cd8] transition-colors flex items-center justify-center gap-2"
                    >
                        <${Save} size=${20} />
                        Save Configuration
                    </button>

                    ${localAiSettings.ais.length > 1 && html`
                        <button 
                            onClick=${handleDeleteAi}
                            className="px-4 border border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center"
                            title="Delete this AI"
                        >
                            <${Trash2} size=${20} />
                        </button>
                    `}
                </div>
            </div>
        </div>
      `}
      
      ${(activeTab !== 'posts' && activeTab !== 'likes' && activeTab !== 'ai_settings') && html`
          <div className="p-10 text-center text-gray-500">
              <p className="text-xl font-bold text-black mb-2">Nothing to see here yet</p>
              <p>When you post media or like tweets, they will show up here.</p>
          </div>
      `}

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
