
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Sidebar } from './components/Sidebar.js';
import { Feed } from './components/Feed.js';
import { Widgets } from './components/Widgets.js';
import { Profile } from './components/Profile.js';
import { Messages } from './components/Messages.js';
import { getStoredEntries, getUserProfile, getAISettings, deleteEntry, toggleEntryLike, toggleEntryBookmark, toggleAiLike, toggleAiBookmark, deleteAiReply } from './services/storage.js';

const html = htm.bind(React.createElement);

const PlaceholderView = ({ title }) => html`
  <div className="flex-1 min-w-0 border-r border-gray-100 max-w-[600px] w-full flex flex-col h-screen">
    <div className="sticky top-0 z-20 bg-white px-4 py-3 border-b border-gray-100">
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
  
  // State for filtering by tag
  const [currentTag, setCurrentTag] = useState(null);
  
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

  const handleComposeClick = () => {
    if (view !== 'home') setView('home');
    setCurrentTag(null); // Clear filter
    // Wait for view change then focus
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
    }, 100);
  };

  const handleProfileClick = () => {
    setView('profile');
    setCurrentTag(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeView = (newView) => {
      setView(newView);
      setCurrentTag(null); // Reset tag filter when changing main views
  };

  const handleTagClick = (tag) => {
      setCurrentTag(tag);
      setView('home'); // Go to home view to show list
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
  
  const handleToggleAiLike = (id) => {
      const updated = toggleAiLike(id);
      setEntries(updated);
  };
  
  const handleToggleAiBookmark = (id) => {
      const updated = toggleAiBookmark(id);
      setEntries(updated);
  };
  
  const handleDeleteAiReply = (id) => {
      const updated = deleteAiReply(id);
      setEntries(updated);
  };

  // Filter entries
  let displayEntries = entries;
  if (view === 'bookmarks') {
      // Show entry if the User Post is bookmarked OR the AI Reply is bookmarked
      displayEntries = entries.filter(e => e.isBookmarked || e.aiIsBookmarked);
  } else if (currentTag) {
      displayEntries = entries.filter(e => e.aiAnalysisTags && e.aiAnalysisTags.includes(currentTag));
  }

  let viewTitle = 'Home';
  if (view === 'bookmarks') viewTitle = 'Bookmarks';
  else if (currentTag) viewTitle = `Results for ${currentTag}`;

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
          onToggleAiLike=${handleToggleAiLike}
          onToggleAiBookmark=${handleToggleAiBookmark}
          onDeleteAiReply=${handleDeleteAiReply}
          onTagClick=${handleTagClick}
          isBookmarkView=${view === 'bookmarks'}
        />
    `;
  } else if (view === 'profile' || view === 'settings') {
    const defaultTab = view === 'settings' ? 'ai_settings' : 'posts';
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
          onToggleAiLike=${handleToggleAiLike}
          onToggleAiBookmark=${handleToggleAiBookmark}
          onDeleteAiReply=${handleDeleteAiReply}
          defaultTab=${defaultTab}
        />
    `;
  } else if (view === 'messages') {
    mainContent = html`
        <${Messages} 
           aiSettings=${aiSettings}
           userProfile=${userProfile}
           onBackClick=${() => setView('home')}
        />
    `;
  } else {
    // Catch-all for new UI items
    const titleMap = {
      'notifications': 'Notifications',
      'more': 'More'
    };
    mainContent = html`<${PlaceholderView} title=${titleMap[view] || 'Page'} />`;
  }

  return html`
    <div className="bg-white min-h-screen text-black">
      <div className="max-w-[1265px] mx-auto flex">
        <!-- Left Sidebar -->
        <${Sidebar} 
          onComposeClick=${handleComposeClick} 
          currentView=${view} 
          onChangeView=${handleChangeView}
          userProfile=${userProfile}
          isMobileOpen=${isMobileOpen}
          onCloseMobile=${() => setIsMobileOpen(false)}
        />

        <!-- Main Content Area -->
        ${mainContent}

        <!-- Right Widgets -->
        ${view !== 'messages' && html`<${Widgets} entries=${entries} onTagClick=${handleTagClick} />`}
      </div>

      <!-- Mobile Menu Button (Star) -->
      <button 
        onClick=${() => setIsMobileOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center text-2xl z-30 sm:hidden active:scale-95 transition-transform"
        aria-label="Open Menu"
      >
        ⭐
      </button>
    </div>
  `;
};

export default App;
