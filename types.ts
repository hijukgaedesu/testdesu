export enum Mood {
  Happy = 'Happy',
  Neutral = 'Neutral',
  Sad = 'Sad',
  Angry = 'Angry',
  Excited = 'Excited'
}

export interface DiaryEntry {
  id: string;
  content: string;
  createdAt: number; // timestamp
  mood: Mood;
  aiResponse?: string;
  aiAnalysisTags?: string[];
}

export interface UserProfile {
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
}

// Stats for charts
export interface MoodStat {
  date: string;
  score: number; // 1-5 scale for visualization
}