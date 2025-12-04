
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Send, Bot, ArrowLeft, MoreHorizontal, MessageSquare, Settings } from 'lucide-react';
import { getStoredMessages, saveMessage } from '../services/storage.js';
import { getChatResponse } from '../services/gemini.js';

const html = htm.bind(React.createElement);

export const Messages = ({ aiSettings, onBackClick }) => {
  const [messages, setMessages] = useState([]);
  const [selectedAiId, setSelectedAiId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize selectedAiId on mount if desktop
  useEffect(() => {
    setMessages(getStoredMessages());
  }, []);

  useEffect(() => {
    if (selectedAiId) {
        setTimeout(scrollToBottom, 100);
    }
  }, [selectedAiId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedAiId) return;

    const userMsg = {
        id: Date.now(),
        aiId: selectedAiId,
        sender: 'user',
        text: inputText,
        timestamp: Date.now()
    };
    
    // Save user message
    const updated = saveMessage(userMsg);
    setMessages(updated); 
    setInputText('');
    setIsTyping(true);

    // Get AI response
    try {
        const ai = aiSettings.ais.find(a => a.id === selectedAiId);
        const historyForThisAi = updated.filter(m => m.aiId === selectedAiId);
        const aiResponseText = await getChatResponse(historyForThisAi, ai);
        
        const aiMsg = {
            id: Date.now() + 1,
            aiId: selectedAiId,
            sender: 'ai',
            text: aiResponseText,
            timestamp: Date.now()
        };
        const finalUpdated = saveMessage(aiMsg);
        setMessages(finalUpdated);
    } catch (e) {
        console.error(e);
    } finally {
        setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ConversationList = ({ activeId, onSelect }) => {
    return html`
      <div className="flex-col h-full overflow-y-auto w-full md:w-[380px] md:border-r border-gray-100 ${selectedAiId ? 'hidden md:flex' : 'flex'}">
         <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between h-[53px]">
            <div className="flex items-center gap-4">
                <div onClick=${onBackClick} className="cursor-pointer hover:bg-gray-200 p-2 rounded-full transition-colors md:hidden">
                    <${ArrowLeft} size=${20} className="text-black" />
                </div>
                <h1 className="text-xl font-bold text-black">Messages</h1>
            </div>
            <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer"><${Settings} size=${20} /></div>
        </div>

        <div className="flex-1">
             ${aiSettings.ais.map(ai => {
                const lastMsg = messages.filter(m => m.aiId === ai.id).pop();
                const isActive = activeId === ai.id;
                return html`
                    <div 
                        key=${ai.id}
                        onClick=${() => onSelect(ai.id)}
                        className=${`flex gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 ${isActive ? 'bg-gray-100 border-r-2 border-r-[#1d9bf0]' : 'hover:bg-gray-50'}`}
                    >
                        <div className="w-12 h-12 flex-shrink-0">
                            ${ai.avatarUrl 
                                ? html`<img src=${ai.avatarUrl} className="w-full h-full rounded-full object-cover" />`
                                : html`<div className="w-full h-full bg-[#1d9bf0] rounded-full flex items-center justify-center text-white"><${Bot} size=${24} /></div>`
                            }
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-baseline">
                                <div className="flex items-center gap-1 overflow-hidden">
                                    <span className="font-bold text-black truncate">${ai.name}</span>
                                    <span className="text-gray-500 text-sm truncate">${ai.handle}</span>
                                </div>
                                ${lastMsg && html`<span className="text-gray-500 text-xs whitespace-nowrap">${new Date(lastMsg.timestamp).toLocaleDateString()}</span>`}
                            </div>
                            <p className="text-gray-500 text-sm truncate">
                                ${lastMsg ? lastMsg.text : 'Start a conversation'}
                            </p>
                        </div>
                    </div>
                `;
            })}
        </div>
      </div>
    `;
  };

  const ChatWindow = ({ aiId }) => {
    if (!aiId) {
        return html`
            <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full text-center p-8 border-r border-gray-100 max-w-[600px]">
                <h2 className="text-3xl font-bold text-black mb-2">Select a message</h2>
                <p className="text-gray-500">Choose from your existing conversations, start a new one, or just keep swimming.</p>
                <button className="mt-6 bg-[#1d9bf0] text-white font-bold px-8 py-3 rounded-full hover:bg-[#1a8cd8] transition-colors">
                    New message
                </button>
            </div>
        `;
    }

    const currentAi = aiSettings.ais.find(ai => ai.id === aiId);
    const currentConversation = messages.filter(msg => msg.aiId === aiId);

    return html`
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-gray-100 max-w-[600px]">
        <!-- Header -->
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-2 border-b border-gray-100 flex items-center justify-between h-[53px]">
            <div className="flex items-center gap-2">
                <div onClick=${() => setSelectedAiId(null)} className="cursor-pointer hover:bg-gray-200 p-2 rounded-full transition-colors md:hidden">
                    <${ArrowLeft} size=${20} className="text-black" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-black leading-5">${currentAi.name}</h1>
                    <span className="text-xs text-gray-500">${currentAi.handle}</span>
                </div>
            </div>
            <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer"><${MoreHorizontal} size=${20} /></div>
        </div>

        <!-- Messages -->
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
             <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-6 mb-4 hover:bg-gray-50 cursor-pointer transition-colors py-4">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                    ${currentAi.avatarUrl 
                        ? html`<img src=${currentAi.avatarUrl} className="w-full h-full object-cover" />`
                        : html`<div className="w-full h-full bg-[#1d9bf0] flex items-center justify-center text-white"><${Bot} size=${32} /></div>`
                    }
                </div>
                <h2 className="font-bold text-lg text-black">${currentAi.name}</h2>
                <p className="text-gray-500 text-sm">${currentAi.handle}</p>
                <p className="text-gray-500 text-sm mt-2 max-w-[80%] text-center">${currentAi.persona.slice(0, 80)}...</p>
            </div>

            ${currentConversation.map((msg) => html`
                <div key=${msg.id} className=${`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    ${msg.sender === 'ai' && html`
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end">
                            ${currentAi.avatarUrl 
                                ? html`<img src=${currentAi.avatarUrl} className="w-full h-full object-cover" />`
                                : html`<div className="w-full h-full bg-[#1d9bf0] flex items-center justify-center text-white"><${Bot} size=${16} /></div>`
                            }
                        </div>
                    `}
                    <div className=${`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] whitespace-pre-wrap break-words ${
                        msg.sender === 'user' 
                        ? 'bg-[#1d9bf0] text-white rounded-br-none' 
                        : 'bg-[#eff3f4] text-black rounded-bl-none'
                    }`}>
                        ${msg.text}
                    </div>
                </div>
            `)}
            
            ${isTyping && html`
                <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end">
                        ${currentAi.avatarUrl 
                            ? html`<img src=${currentAi.avatarUrl} className="w-full h-full object-cover" />`
                            : html`<div className="w-full h-full bg-[#1d9bf0] flex items-center justify-center text-white"><${Bot} size=${16} /></div>`
                        }
                    </div>
                    <div className="bg-[#eff3f4] rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style=${{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style=${{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style=${{animationDelay: '300ms'}}></div>
                    </div>
                </div>
            `}
            <div ref=${messagesEndRef}></div>
        </div>

        <!-- Input -->
        <div className="p-3 border-t border-gray-100 bg-white sticky bottom-0">
            <div className="flex items-center bg-[#eff3f4] rounded-2xl px-2 py-1">
                <textarea
                    value=${inputText}
                    onChange=${(e) => setInputText(e.target.value)}
                    onKeyPress=${handleKeyPress}
                    placeholder="Start a new message"
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-3 outline-none max-h-[100px] text-black"
                    rows=${1}
                    style=${{ minHeight: '44px' }}
                />
                <button 
                    onClick=${handleSend}
                    disabled=${!inputText.trim() || isTyping}
                    className=${`p-2 rounded-full transition-colors ${!inputText.trim() ? 'text-gray-400' : 'text-[#1d9bf0] hover:bg-blue-50'}`}
                >
                    <${Send} size=${20} />
                </button>
            </div>
        </div>
      </div>
    `;
  };

  return html`
    <div className="flex w-full max-w-[1000px] h-screen">
       <${ConversationList} activeId=${selectedAiId} onSelect=${setSelectedAiId} />
       <${ChatWindow} aiId=${selectedAiId} />
    </div>
  `;
};
