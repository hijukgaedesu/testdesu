
import React from 'react';
import htm from 'htm';
import { Home, Bell, Mail, Bookmark, User, MoreHorizontal, PenTool, X as XIcon } from 'lucide-react';

const html = htm.bind(React.createElement);

export const Sidebar = ({ onComposeClick, currentView, onChangeView, userProfile, isMobileOpen, onCloseMobile }) => {
  // Mobile Drawer Classes
  const mobileContainerClass = isMobileOpen 
    ? "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0" 
    : "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out -translate-x-full";

  const overlayClass = isMobileOpen
    ? "fixed inset-0 bg-black/40 z-40 sm:hidden block"
    : "hidden";

  // Navigation Items Configuration
  // Removed: Explore(Search), Grok, Lists, Communities, Premium
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'messages', icon: Mail, label: 'Messages' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'more', icon: MoreHorizontal, label: 'More' },
  ];

  return html`
    <${React.Fragment}>
      <!-- Mobile Overlay -->
      <div className=${overlayClass} onClick=${onCloseMobile}></div>

      <!-- Sidebar Container (Mobile + Desktop) -->
      <div className=${`flex flex-col border-r border-gray-100 h-screen bg-white text-black sm:sticky sm:top-0 sm:min-w-[68px] xl:min-w-[275px] sm:pr-2 xl:pr-6 sm:translate-x-0 ${mobileContainerClass}`}>
        
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

        <div className="py-1 flex-1 flex flex-col xl:w-full items-end xl:items-start">
          <!-- Logo Area -->
          <div 
            onClick=${() => { onChangeView('home'); onCloseMobile(); }}
            className="hidden sm:block p-3 mb-2 rounded-full hover:bg-gray-200 w-fit cursor-pointer transition-colors"
          >
            <!-- X Logo (Blackboard Bold X path) -->
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-black fill-current">
              <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
            </svg>
          </div>

          <!-- Navigation Items -->
          <nav className="flex flex-col gap-1 w-full px-2 sm:px-0">
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

          <!-- Tweet Button -->
          <button 
            onClick=${() => { onComposeClick(); onCloseMobile(); }}
            className="mt-6 sm:mr-0 mr-4 ml-4 sm:ml-0 bg-[#1d9bf0] text-white font-bold rounded-full w-[50px] h-[50px] xl:w-[90%] xl:h-[52px] flex items-center justify-center hover:bg-[#1a8cd8] transition-colors shadow-lg self-end sm:self-auto xl:self-start"
          >
            <span className="hidden xl:inline text-lg">Post</span>
            <span className="xl:hidden sm:block hidden"><${PenTool} size=${24} /></span>
            <span className="sm:hidden block text-md px-4">Post</span>
          </button>
        </div>

        <!-- Desktop Bottom Profile -->
        <div className="hidden sm:flex mb-4 items-center gap-3 p-3 rounded-full hover:bg-gray-200 cursor-pointer w-fit xl:w-full transition-colors mt-auto">
          <img src=${userProfile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          <div className="hidden xl:block">
            <p className="font-bold text-sm text-black">${userProfile.name}</p>
            <p className="text-gray-500 text-sm">${userProfile.handle}</p>
          </div>
          <${MoreHorizontal} className="hidden xl:block ml-auto text-black" size=${18} />
        </div>
      </div>
    </${React.Fragment}>
  `;
};

const SidebarItem = ({ icon, text, active, onClick }) => html`
  <div onClick=${onClick} className="flex items-center group cursor-pointer w-full sm:w-fit xl:w-full">
    <div className=${`flex items-center gap-5 p-3 rounded-full transition-colors ${active ? 'font-bold' : 'font-normal'} group-hover:bg-gray-200 w-auto`}>
      ${icon}
      <span className="hidden xl:block text-xl mr-4">${text}</span>
    </div>
  </div>
`;
