
// Removed unused imports to prevent export errors
// import { DiaryEntry, UserProfile } from '../types';

const STORAGE_KEY_ENTRIES = 'haru_tweet_entries';
const STORAGE_KEY_USER = 'haru_tweet_user';
const STORAGE_KEY_AI = 'haru_tweet_ai_config_v2'; 
const STORAGE_KEY_MESSAGES = 'haru_tweet_messages';

export const getStoredEntries = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load entries', e);
    return [];
  }
};

export const saveEntry = (entry) => {
  const current = getStoredEntries();
  const updated = [entry, ...current];
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

export const deleteEntry = (id) => {
  const current = getStoredEntries();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

export const toggleEntryLike = (id) => {
  const current = getStoredEntries();
  const updated = current.map(entry => {
    if (entry.id === id) {
      return { ...entry, isLiked: !entry.isLiked };
    }
    return entry;
  });
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

export const toggleEntryBookmark = (id) => {
  const current = getStoredEntries();
  const updated = current.map(entry => {
    if (entry.id === id) {
      return { ...entry, isBookmarked: !entry.isBookmarked };
    }
    return entry;
  });
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

// AI Interactions - Updated for Multi-AI support
export const toggleAiLike = (entryId, aiId) => {
  const current = getStoredEntries();
  const updated = current.map(entry => {
    if (entry.id === entryId) {
      // Check for multi-response structure
      if (entry.aiResponses) {
          const newResponses = entry.aiResponses.map(r => {
              if (r.aiId === aiId) return { ...r, isLiked: !r.isLiked };
              return r;
          });
          return { ...entry, aiResponses: newResponses };
      }
      // Legacy fallback
      if (!aiId || entry.aiId === aiId) {
          return { ...entry, aiIsLiked: !entry.aiIsLiked };
      }
    }
    return entry;
  });
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

export const toggleAiBookmark = (entryId, aiId) => {
  const current = getStoredEntries();
  const updated = current.map(entry => {
    if (entry.id === entryId) {
       // Check for multi-response structure
       if (entry.aiResponses) {
          const newResponses = entry.aiResponses.map(r => {
              if (r.aiId === aiId) return { ...r, isBookmarked: !r.isBookmarked };
              return r;
          });
          return { ...entry, aiResponses: newResponses };
      }
      // Legacy fallback
      if (!aiId || entry.aiId === aiId) {
          return { ...entry, aiIsBookmarked: !entry.aiIsBookmarked };
      }
    }
    return entry;
  });
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

export const deleteAiReply = (entryId, aiId) => {
  const current = getStoredEntries();
  const updated = current.map(entry => {
    if (entry.id === entryId) {
      if (entry.aiResponses) {
          const newResponses = entry.aiResponses.filter(r => r.aiId !== aiId);
          // If no responses left, we could optionally clear legacy fields too, but maintaining structure is safer
          return { ...entry, aiResponses: newResponses };
      }
      // Legacy fallback
      if (!aiId || entry.aiId === aiId) {
          const { aiResponse, aiId, aiIsLiked, aiIsBookmarked, ...rest } = entry;
          return rest;
      }
    }
    return entry;
  });
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};


// Chat Messages Storage
export const getStoredMessages = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveMessage = (message) => {
  const current = getStoredMessages();
  const updated = [...current, message];
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));
  return updated;
};

export const deleteMessage = (id) => {
  const current = getStoredMessages();
  const updated = current.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));
  return updated;
};

export const getUserProfile = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : {
      name: 'User',
      handle: '@user',
      avatarUrl: 'https://picsum.photos/200',
      bio: 'Just another day in paradise.'
    };
  } catch {
    return {
      name: 'User',
      handle: '@user',
      avatarUrl: 'https://picsum.photos/200',
      bio: 'Just another day in paradise.'
    };
  }
};

// Updated to support 2 AIs
const DEFAULT_AIS = [
  {
    id: 1,
    name: 'Gemini',
    handle: '@gemini_official',
    persona: 'You are a helpful and intelligent AI assistant provided by Google. You are polite, concise, and informative.',
    avatarUrl: '' // Default bot icon
  },
  {
    id: 2,
    name: 'Bestie',
    handle: '@your_bestie',
    persona: 'You are an empathetic, cheerful, and casual close friend. You use emojis often, speak informally, and always cheer the user up.',
    avatarUrl: ''
  }
];

export const getAISettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_AI);
    if (!data) {
        return { ais: DEFAULT_AIS, activeAiIds: [1] };
    }
    const parsed = JSON.parse(data);
    
    // Migration: ensure activeAiIds exists (migrating from single activeAiId)
    if (!parsed.activeAiIds) {
        parsed.activeAiIds = parsed.activeAiId ? [parsed.activeAiId] : [1];
    }
    
    // Backward compatibility check for ais array
    if (!parsed.ais) {
        return { ais: DEFAULT_AIS, activeAiIds: [1] };
    }
    return parsed;
  } catch {
    return { ais: DEFAULT_AIS, activeAiIds: [1] };
  }
};

export const saveAISettings = (settings) => {
  localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(settings));
  return settings;
};
