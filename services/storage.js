
const STORAGE_KEY_ENTRIES = 'haru_tweet_entries';
const STORAGE_KEY_USER = 'haru_tweet_user';
const STORAGE_KEY_AI = 'haru_tweet_ai_config';

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

export const getAISettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_AI);
    const parsed = data ? JSON.parse(data) : {};
    return {
      name: parsed.name || 'Gemini AI',
      handle: parsed.handle || '@gemini_companion',
      persona: parsed.persona || 'You are an empathetic AI companion acting as a close friend on a social media platform. Your tone is warm, casual, and supportive.',
      avatarUrl: parsed.avatarUrl || '' // Default empty
    };
  } catch {
    return {
      name: 'Gemini AI',
      handle: '@gemini_companion',
      persona: 'You are an empathetic AI companion acting as a close friend on a social media platform. Your tone is warm, casual, and supportive.',
      avatarUrl: ''
    };
  }
};

export const saveAISettings = (settings) => {
  localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(settings));
  return settings;
};
