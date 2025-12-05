
import React from 'react';
import htm from 'htm';
import { Home, Bell, Mail, Bookmark, User, MoreHorizontal, X as XIcon, Settings } from 'lucide-react';

const html = htm.bind(React.createElement);

export const Sidebar = ({ onComposeClick, currentView, onChangeView, userProfile, isMobileOpen, onCloseMobile }) => {
  // Mobile Drawer Classes
  const mobileContainerClass = isMobileOpen 
    ? "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out translate-x-0" 
    : "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out -translate-x-full";

  const overlayClass = isMobileOpen
    ? "fixed inset-0 z-40 sm:hidden block"
    : "hidden";

  // Navigation Items Configuration
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'messages', icon: Mail, label: 'Messages' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return html`
    <${React.Fragment}>
      <!-- Mobile Overlay -->
      <div className=${overlayClass} onClick=${onCloseMobile}></div>

      <!-- Sidebar Container (Mobile + Tablet + Desktop) -->
      <!-- Adjusted sm:min-w to 250px to fit text on tablet screens -->
      <div className=${`flex flex-col border-r border-gray-100 h-screen bg-white text-black sm:sticky sm:top-0 sm:min-w-[250px] lg:min-w-[275px] sm:pr-0 lg:pr-6 sm:translate-x-0 ${mobileContainerClass}`}>
        
        <!-- Mobile Header (Profile Info) -->
        <div className="sm:hidden p-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <img src=${userProfile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                <button onClick=${onCloseMobile} className="p-1 rounded-full hover:bg-gray-200">
                    <${XIcon} size=${20} />
                </button>
            </div>
            <div>
                <p className="font-bold text-black text-lg">${userProfile.name}</p>
                <p className="text-gray-500 text-sm">${userProfile.handle}</p>
            </div>
            <div className="flex gap-4 text-sm mt-1">
                <span className="font-bold text-black">
                    ${userProfile.following || 10} <span className="text-gray-500 font-normal">Following</span>
                </span>
                <span className="font-bold text-black">
                    ${userProfile.followers || 42} <span className="text-gray-500 font-normal">Followers</span>
                </span>
            </div>
        </div>

        <div className="py-1 flex-1 flex flex-col lg:w-full items-start">
          <!-- Logo Area -->
          <div 
            onClick=${() => { onChangeView('home'); onCloseMobile(); }}
            className="hidden sm:flex p-3 mb-2 rounded-full hover:bg-gray-200 w-fit cursor-pointer transition-colors justify-center items-center"
          >
            <!-- Star Emoji -->
            <div className="w-8 h-8 flex items-center justify-center text-2xl">⭐</div>
          </div>

          <!-- Navigation Items -->
          <nav className="flex flex-col gap-1 w-full px-2 sm:px-0 items-start">
            ${navItems.map(item => html`
              <${SidebarItem} 
                key=${item.id}
                icon=${html`<${item.icon} size=${26} />`} 
                text=${item.label} 
                active=${currentView === item.id} 
                onClick=${() => { onChangeView(item.id); onCloseMobile(); }}
              />
            `)}
          </nav>
          
          <!-- Tweet/Post Button Removed as requested -->

        </div>

        <!-- Desktop/Tablet Bottom Profile -->
        <div 
            onClick=${() => onChangeView('profile')}
            className="hidden sm:flex mb-4 items-center gap-3 p-3 rounded-full hover:bg-gray-200 cursor-pointer w-full transition-colors mt-auto"
        >
          <img src=${userProfile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          <div className="block">
            <p className="font-bold text-sm text-black">${userProfile.name}</p>
            <p className="text-gray-500 text-sm">${userProfile.handle}</p>
          </div>
          <${MoreHorizontal} className="block ml-auto text-black" size=${18} />
        </div>
      </div>
    </${React.Fragment}>
  `;
};

const SidebarItem = ({ icon, text, active, onClick }) => html`
  <div onClick=${onClick} className="flex items-center group cursor-pointer w-full">
    <div className=${`flex items-center gap-5 p-3 rounded-full transition-colors ${active ? 'font-bold' : 'font-normal'} group-hover:bg-gray-200 w-auto pr-6`}>
      ${icon}
      <!-- Text is now always visible (block) -->
      <span className="block text-xl mr-4">${text}</span>
    </div>
  </div>
`;
