import { DiaryEntry, UserProfile } from '../types';

const STORAGE_KEY_ENTRIES = 'haru_tweet_entries';
const STORAGE_KEY_USER = 'haru_tweet_user';

export const getStoredEntries = (): DiaryEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load entries', e);
    return [];
  }
};

export const saveEntry = (entry: DiaryEntry): DiaryEntry[] => {
  const current = getStoredEntries();
  const updated = [entry, ...current];
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

export const deleteEntry = (id: string): DiaryEntry[] => {
  const current = getStoredEntries();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
  return updated;
};

export const getUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : {
      name: '사용자',
      handle: '@user',
      avatarUrl: 'https://picsum.photos/200',
      bio: '오늘의 기록, 내일의 추억.'
    };
  } catch {
    return {
      name: '사용자',
      handle: '@user',
      avatarUrl: 'https://picsum.photos/200',
      bio: '오늘의 기록, 내일의 추억.'
    };
  }
};