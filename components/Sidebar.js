import React from 'react';
import htm from 'htm';
import { Home, User, PenTool, MoreHorizontal, Settings } from 'lucide-react';

const html = htm.bind(React.createElement);

export const Sidebar = ({ onComposeClick, currentView, onChangeView, userProfile }) => {
  return html`
    <div className="hidden sm:flex flex-col items-end min-w-[68px] xl:min-w-[275px] pr-2 xl:pr-6 border-r border-gray-100 h-screen sticky top-0 bg-white text-black z-50">
      <div className="py-1 xl:w-full">
        <!-- Logo Area -->
        <div 
          onClick=${() => onChangeView('home')}
          className="p-3 mb-2 rounded-full hover:bg-gray-200 w-fit cursor-pointer transition-colors"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-black fill-current">
            <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
          </svg>
        </div>

        <!-- Navigation Items -->
        <nav className="flex flex-col gap-2 w-full">
          <${SidebarItem} 
            icon=${html`<${Home} size=${26} />`} 
            text="홈" 
            active=${currentView === 'home'} 
            onClick=${() => onChangeView('home')}
          />
          <${SidebarItem} 
            icon=${html`<${User} size=${26} />`} 
            text="프로필" 
            active=${currentView === 'profile'}
            onClick=${() => onChangeView('profile')}
          />
          <${SidebarItem} icon=${html`<${Settings} size=${26} />`} text="설정" />
          <${SidebarItem} icon=${html`<${MoreHorizontal} size=${26} />`} text="더보기" />
        </nav>

        <!-- Tweet Button -->
        <button 
          onClick=${onComposeClick}
          className="mt-6 bg-[#1d9bf0] text-white font-bold rounded-full w-[50px] h-[50px] xl:w-full xl:h-[52px] flex items-center justify-center hover:bg-[#1a8cd8] transition-colors shadow-lg"
        >
          <span className="hidden xl:inline text-lg">기록하기</span>
          <${PenTool} className="xl:hidden" size=${24} />
        </button>
      </div>

      <div className="mt-auto mb-4 flex items-center gap-3 p-3 rounded-full hover:bg-gray-200 cursor-pointer w-full transition-colors">
        <img src=${userProfile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
        <div className="hidden xl:block">
          <p className="font-bold text-sm text-black">${userProfile.name}</p>
          <p className="text-gray-500 text-sm">${userProfile.handle}</p>
        </div>
        <${MoreHorizontal} className="hidden xl:block ml-auto text-black" size=${18} />
      </div>
    </div>
  `;
};

const SidebarItem = ({ icon, text, active, onClick }) => html`
  <div onClick=${onClick} className="flex items-center group cursor-pointer w-fit xl:w-full">
    <div className=${`flex items-center gap-4 p-3 rounded-full transition-colors ${active ? 'font-bold' : 'font-normal'} group-hover:bg-gray-200`}>
      ${icon}
      <span className="hidden xl:block text-xl">${text}</span>
    </div>
  </div>
`;