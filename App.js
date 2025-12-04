
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Sidebar } from './components/Sidebar.js';
import { Feed } from './components/Feed.js';
import { Widgets } from './components/Widgets.js';
import { Profile } from './components/Profile.js';
import { getStoredEntries, getUserProfile, getAISettings, deleteEntry, toggleEntryLike, toggleEntryBookmark } from './services/storage.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState('home'); // 'home' | 'profile' | 'bookmarks'
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

  return html`
    <div 
        className="bg-white min-h-screen text-black"
        onTouchStart=${onTouchStart}
        onTouchMove=${onTouchMove}
        onTouchEnd=${onTouchEnd}
    >
      <div className="max-w-[1265px] mx-auto flex justify-center">
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
        ${(view === 'home' || view === 'bookmarks') && html`
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
        `}

        ${view === 'profile' && html`
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
        `}

        <!-- Right Widgets -->
        <${Widgets} entries=${entries} />
      </div>
    </div>
  `;
};

export default App;
