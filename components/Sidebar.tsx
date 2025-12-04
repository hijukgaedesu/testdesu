import React from 'react';
import { Home, User, PenTool, MoreHorizontal, Settings } from 'lucide-react';

interface SidebarProps {
  onComposeClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onComposeClick }) => {
  return (
    <div className="hidden sm:flex flex-col items-end min-w-[68px] xl:min-w-[275px] pr-2 xl:pr-6 border-r border-gray-800 h-screen sticky top-0 bg-black text-white z-50">
      <div className="py-1 xl:w-full">
        {/* Logo Area */}
        <div className="p-3 mb-2 rounded-full hover:bg-gray-900 w-fit cursor-pointer transition-colors">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-white fill-current">
            <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
          </svg>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2 w-full">
          <SidebarItem icon={<Home size={26} />} text="홈" active />
          <SidebarItem icon={<User size={26} />} text="프로필" />
          <SidebarItem icon={<Settings size={26} />} text="설정" />
          <SidebarItem icon={<MoreHorizontal size={26} />} text="더보기" />
        </nav>

        {/* Tweet Button */}
        <button 
          onClick={onComposeClick}
          className="mt-6 bg-white text-black font-bold rounded-full w-[50px] h-[50px] xl:w-full xl:h-[52px] flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
        >
          <span className="hidden xl:inline text-lg">기록하기</span>
          <PenTool className="xl:hidden" size={24} />
        </button>
      </div>

      <div className="mt-auto mb-4 flex items-center gap-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer w-full transition-colors">
        <img src="https://picsum.photos/200" alt="Avatar" className="w-10 h-10 rounded-full" />
        <div className="hidden xl:block">
          <p className="font-bold text-sm">내 일기장</p>
          <p className="text-gray-500 text-sm">@my_diary</p>
        </div>
        <MoreHorizontal className="hidden xl:block ml-auto text-gray-500" size={18} />
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active }) => (
  <div className="flex items-center group cursor-pointer w-fit xl:w-full">
    <div className={`flex items-center gap-4 p-3 rounded-full transition-colors ${active ? 'font-bold' : 'font-normal'} group-hover:bg-gray-900`}>
      {icon}
      <span className="hidden xl:block text-xl">{text}</span>
    </div>
  </div>
);