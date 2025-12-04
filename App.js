import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Sidebar } from './components/Sidebar.js';
import { Feed } from './components/Feed.js';
import { Widgets } from './components/Widgets.js';
import { getStoredEntries } from './services/storage.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [entries, setEntries] = useState([]);

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

  return html`
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-[1265px] mx-auto flex justify-center">
        <!-- Left Sidebar -->
        <${Sidebar} onComposeClick=${handleComposeClick} />

        <!-- Main Feed -->
        <${Feed} entries=${entries} setEntries=${setEntries} />

        <!-- Right Widgets -->
        <${Widgets} entries=${entries} />
      </div>
    </div>
  `;
};

export default App;