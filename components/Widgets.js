
import React from 'react';
import htm from 'htm';
import { Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Mood } from '../types.js';

const html = htm.bind(React.createElement);

const moodToScore = (mood) => {
  switch (mood) {
    case Mood.Excited: return 5;
    case Mood.Happy: return 4;
    case Mood.Neutral: return 3;
    case Mood.Sad: return 2;
    case Mood.Angry: return 1;
    default: return 3;
  }
};

export const Widgets = ({ entries }) => {
  // Prepare data for the chart
  const data = entries.slice(0, 10).reverse().map(e => ({
    date: new Date(e.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    score: moodToScore(e.mood),
    mood: e.mood
  }));

  return html`
    <div className="hidden lg:flex flex-col w-[350px] pl-8 min-h-screen py-2 border-l border-gray-100 text-black">
      <!-- Search Bar -->
      <div className="sticky top-0 bg-white pt-1 pb-3 z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <${Search} className="text-gray-500 group-focus-within:text-[#1d9bf0]" size=${20} />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#eff3f4] text-black rounded-full py-3 pl-12 pr-4 outline-none focus:bg-white focus:ring-1 focus:ring-[#1d9bf0] border border-transparent focus:border-[#1d9bf0] transition-all placeholder-gray-500"
          />
        </div>
      </div>

      <!-- Mood Trend Chart -->
      <div className="bg-[#f7f9f9] rounded-2xl mt-4 p-4">
        <h2 className="text-xl font-bold mb-4 px-2 text-black">Mood Trend</h2>
        ${data.length > 1 ? html`
          <div className="h-[200px] w-full">
            <${ResponsiveContainer} width="100%" height="100%">
              <${LineChart} data=${data}>
                <${XAxis} 
                  dataKey="date" 
                  tick=${{ fill: '#536471', fontSize: 10 }} 
                  axisLine=${false}
                  tickLine=${false}
                />
                <${YAxis} hide domain=${[0, 6]} />
                <${Tooltip} 
                  contentStyle=${{ backgroundColor: '#ffffff', border: '1px solid #cfd9de', borderRadius: '8px', boxShadow: '0px 2px 10px rgba(0,0,0,0.1)' }}
                  itemStyle=${{ color: '#0f1419' }}
                  formatter=${(value) => ['', '']}
                  labelStyle=${{ color: '#536471', marginBottom: '0.5rem' }}
                />
                <${Line} 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#1d9bf0" 
                  strokeWidth=${2} 
                  dot=${{ fill: '#1d9bf0', r: 4 }} 
                  activeDot=${{ r: 6 }}
                />
              </${LineChart}>
            </${ResponsiveContainer}>
          </div>
        ` : html`
          <p className="text-gray-500 p-4 text-center">Not enough data.</p>
        `}
      </div>

      <!-- Recent Tags -->
      <div className="bg-[#f7f9f9] rounded-2xl mt-4 py-3">
        <h2 className="text-xl font-bold mb-3 px-4 text-black">Trends for you</h2>
        <div className="flex flex-col">
          ${['#DailyLog', '#Gemini', '#Life', '#Dev', '#Happy'].map((tag, idx) => html`
            <div key=${idx} className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors">
              <p className="text-gray-500 text-xs text-right mb-1">Trending in US</p>
              <p className="font-bold text-black">${tag}</p>
              <p className="text-gray-500 text-xs mt-1">1,234 posts</p>
            </div>
          `)}
        </div>
        <div className="p-4 text-[#1d9bf0] text-sm cursor-pointer hover:underline">
          Show more
        </div>
      </div>
    </div>
  `;
};
