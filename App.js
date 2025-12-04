
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Sidebar } from './components/Sidebar.js';
import { Feed } from './components/Feed.js';
import { Widgets } from './components/Widgets.js';
import { Profile } from './components/Profile.js';
import { Messages } from './components/Messages.js';
import { getStoredEntries, getUserProfile, getAISettings, deleteEntry, toggleEntryLike, toggleEntryBookmark } from './services/storage.js';

const html = htm.bind(React.createElement);

const PlaceholderView = ({ title }) => html`
  <div className="flex-1 min-w-0 border-r border-gray-100 max-w-[600px] w-full flex flex-col h-screen">
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100">
      <h1 className="text-xl font-bold text-black">${title}</h1>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold text-black mb-2">Coming Soon</h2>
      <p className="text-gray-500">The ${title} feature is under development. Check back later!</p>
    </div>
  </div>
`;

const App = () => {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState('home'); 
  const [userProfile, setUserProfile] = useState(getUserProfile());
  const [aiSettings, setAiSettings] = useState(getAISettings());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Swipe detection
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  useEffect(() => {
    // Load initial data
    const loadedEntries = getStoredEntries();
    setEntries(loadedEntries);
    
    // Listen for storage events (in case updated from other tabs/modals)
    const handleStorageChange = () => {
        setUserProfile(getUserProfile());
        setAiSettings(getAISettings());
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener('profileUpdated', handleStorageChange);
    window.addEventListener('aiSettingsUpdated', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('profileUpdated', handleStorageChange);
        window.removeEventListener('aiSettingsUpdated', handleStorageChange);
    };
  }, []);

  // Swipe Handlers
  const onTouchStart = (e) => {
      touchEndRef.current = null;
      touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
      touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
      if (!touchStartRef.current || !touchEndRef.current) return;
      const distance = touchStartRef.current - touchEndRef.current;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isRightSwipe) {
          setIsMobileOpen(true);
      }
      if (isLeftSwipe) {
          setIsMobileOpen(false);
      }
  };

  const handleComposeClick = () => {
    if (view !== 'home') setView('home');
    // Wait for view change then focus
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
    }, 100);
  };

  const handleProfileClick = () => {
    setView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actions
  const handleDelete = (id) => {
      const updated = deleteEntry(id);
      setEntries(updated);
  };

  const handleToggleLike = (id) => {
      const updated = toggleEntryLike(id);
      setEntries(updated);
  };

  const handleToggleBookmark = (id) => {
      const updated = toggleEntryBookmark(id);
      setEntries(updated);
  };

  // Filter entries for Bookmarks view
  const displayEntries = view === 'bookmarks' 
    ? entries.filter(e => e.isBookmarked) 
    : entries;

  const viewTitle = view === 'bookmarks' ? 'Bookmarks' : 'Home';

  // Determine Main Content Content
  let mainContent;
  if (view === 'home' || view === 'bookmarks') {
    mainContent = html`
       <${Feed} 
          entries=${displayEntries} 
          setEntries=${setEntries} 
          userProfile=${userProfile}
          onProfileClick=${() => setIsMobileOpen(true)}
          aiSettings=${aiSettings}
          viewTitle=${viewTitle}
          onDelete=${handleDelete}
          onToggleLike=${handleToggleLike}
          onToggleBookmark=${handleToggleBookmark}
          isBookmarkView=${view === 'bookmarks'}
        />
    `;
  } else if (view === 'profile') {
    mainContent = html`
        <${Profile} 
          userProfile=${userProfile} 
          entries=${entries}
          setEntries=${setEntries}
          aiSettings=${aiSettings}
          onBackClick=${() => setView('home')}
          onDrawerOpen=${() => setIsMobileOpen(true)}
          onDelete=${handleDelete}
          onToggleLike=${handleToggleLike}
          onToggleBookmark=${handleToggleBookmark}
        />
    `;
  } else if (view === 'messages') {
    mainContent = html`
        <${Messages} 
           aiSettings=${aiSettings}
           onBackClick=${() => setView('home')}
        />
    `;
  } else {
    // Catch-all for new UI items (Explore, Notifications, Grok, etc.)
    const titleMap = {
      'explore': 'Explore',
      'notifications': 'Notifications',
      'grok': 'Grok',
      'lists': 'Lists',
      'communities': 'Communities',
      'premium': 'Premium',
      'more': 'More'
    };
    mainContent = html`<${PlaceholderView} title=${titleMap[view] || 'Page'} />`;
  }

  return html`
    <div 
        className="bg-white min-h-screen text-black"
        onTouchStart=${onTouchStart}
        onTouchMove=${onTouchMove}
        onTouchEnd=${onTouchEnd}
    >
      <div className="max-w-[1265px] mx-auto flex">
        <!-- Left Sidebar -->
        <${Sidebar} 
          onComposeClick=${handleComposeClick} 
          currentView=${view} 
          onChangeView=${setView}
          userProfile=${userProfile}
          isMobileOpen=${isMobileOpen}
          onCloseMobile=${() => setIsMobileOpen(false)}
        />

        <!-- Main Content Area -->
        ${mainContent}

        <!-- Right Widgets -->
        ${view !== 'messages' && html`<${Widgets} entries=${entries} />`}
      </div>
    </div>
  `;
};

export default App;
