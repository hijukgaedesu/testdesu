import React from 'react';
import { Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DiaryEntry, Mood } from '../types';

interface WidgetsProps {
  entries: DiaryEntry[];
}

const moodToScore = (mood: Mood): number => {
  switch (mood) {
    case Mood.Excited: return 5;
    case Mood.Happy: return 4;
    case Mood.Neutral: return 3;
    case Mood.Sad: return 2;
    case Mood.Angry: return 1;
    default: return 3;
  }
};

export const Widgets: React.FC<WidgetsProps> = ({ entries }) => {
  // Prepare data for the chart (last 7 entries reversed to show chronological order)
  const data = entries.slice(0, 10).reverse().map(e => ({
    date: new Date(e.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
    score: moodToScore(e.mood),
    mood: e.mood
  }));

  return (
    <div className="hidden lg:flex flex-col w-[350px] pl-8 min-h-screen py-2 border-l border-gray-800 text-white">
      {/* Search Bar */}
      <div className="sticky top-0 bg-black pt-1 pb-3 z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="text-gray-500 group-focus-within:text-blue-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="일기 검색"
            className="w-full bg-[#202327] text-white rounded-full py-3 pl-12 pr-4 outline-none focus:bg-black focus:ring-1 focus:ring-blue-400 border border-transparent focus:border-blue-400 transition-all placeholder-gray-500"
          />
        </div>
      </div>

      {/* Mood Trend Chart */}
      <div className="bg-[#16181c] rounded-2xl mt-4 p-4">
        <h2 className="text-xl font-bold mb-4 px-2">기분 흐름</h2>
        {data.length > 1 ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#71767b', fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 6]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => ['', '']}
                  labelStyle={{ color: '#71767b', marginBottom: '0.5rem' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#1d9bf0" 
                  strokeWidth={2} 
                  dot={{ fill: '#1d9bf0', r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 p-4 text-center">데이터가 충분하지 않습니다.</p>
        )}
      </div>

      {/* Recent Tags */}
      <div className="bg-[#16181c] rounded-2xl mt-4 py-3">
        <h2 className="text-xl font-bold mb-3 px-4">자주 쓴 태그</h2>
        <div className="flex flex-col">
          {['#오늘의기록', '#Gemini', '#일상', '#개발', '#행복'].map((tag, idx) => (
            <div key={idx} className="px-4 py-3 hover:bg-[#1d1f23] cursor-pointer transition-colors">
              <p className="text-gray-500 text-xs text-right mb-1">대한민국 트렌드</p>
              <p className="font-bold text-white">{tag}</p>
              <p className="text-gray-500 text-xs mt-1">1,234 posts</p>
            </div>
          ))}
        </div>
        <div className="p-4 text-blue-400 text-sm cursor-pointer hover:underline">
          더 보기
        </div>
      </div>
    </div>
  );
};