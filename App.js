
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Sidebar } from './components/Sidebar.js';
import { Feed } from './components/Feed.js';
import { Widgets } from './components/Widgets.js';
import { Profile } from './components/Profile.js';
import { getStoredEntries, getUserProfile } from './services/storage.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState('home'); // 'home' | 'profile'
  const [userProfile, setUserProfile] = useState(getUserProfile());

  useEffect(() => {
    // Load initial data
    const loadedEntries = getStoredEntries();
    setEntries(loadedEntries);
    
    // Listen for storage events (in case updated from other tabs/modals)
    const handleStorageChange = () => {
        setUserProfile(getUserProfile());
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener('profileUpdated', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

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

  return html`
    <div className="bg-white min-h-screen text-black">
      <div className="max-w-[1265px] mx-auto flex justify-center">
        <!-- Left Sidebar -->
        <${Sidebar} 
          onComposeClick=${handleComposeClick} 
          currentView=${view} 
          onChangeView=${setView}
          userProfile=${userProfile}
        />

        <!-- Main Content Area -->
        ${view === 'home' 
          ? html`<${Feed} 
              entries=${entries} 
              setEntries=${setEntries} 
              userProfile=${userProfile}
              onProfileClick=${handleProfileClick}
            />` 
          : html`<${Profile} 
              userProfile=${userProfile} 
              entries=${entries}
              setEntries=${setEntries}
            />`
        }

        <!-- Right Widgets -->
        <${Widgets} entries=${entries} />
      </div>
    </div>
  `;
};

export default App;
