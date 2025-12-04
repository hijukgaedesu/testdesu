import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { Widgets } from './components/Widgets';
import { DiaryEntry } from './types';
import { getStoredEntries } from './services/storage';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    // Load initial data
    const loadedEntries = getStoredEntries();
    setEntries(loadedEntries);
  }, []);

  const handleComposeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-[1265px] mx-auto flex justify-center">
        {/* Left Sidebar */}
        <Sidebar onComposeClick={handleComposeClick} />

        {/* Main Feed */}
        <Feed entries={entries} setEntries={setEntries} />

        {/* Right Widgets */}
        <Widgets entries={entries} />
      </div>
    </div>
  );
};

export default App;