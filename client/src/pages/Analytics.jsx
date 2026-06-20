import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';

const badgeColors = {
  'Bronze Tutor': '#C8763D',
  'Silver Guru': '#A8A8A8',
  'Gold Guru': '#E8A33D'
};

function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/users/stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="p-6 text-slate/50">Loading stats...</p>;

  const chartData = [
    { name: 'Taught', sessions: stats.taughtCount },
    { name: 'Learnt', sessions: stats.learntCount }
  ];

  const progress = stats.nextBadge
    ? Math.min(100, (stats.totalTeachingHours / stats.nextBadge.hours) * 100)
    : 100;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-chalk p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl text-slate mb-6">Your SkillSwap Journey</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate/10 rounded-xl p-4">
            <p className="text-xs text-slate/50">Credits</p>
            <p className="font-mono text-2xl text-marigold">{stats.credits}</p>
          </div>
          <div className="bg-white border border-slate/10 rounded-xl p-4">
            <p className="text-xs text-slate/50">Hours Taught</p>
            <p className="font-mono text-2xl text-leaf">{stats.totalTeachingHours}</p>
          </div>
          <div className="bg-white border border-slate/10 rounded-xl p-4">
            <p className="text-xs text-slate/50">Sessions Taught</p>
            <p className="font-mono text-2xl text-slate">{stats.taughtCount}</p>
          </div>
          <div className="bg-white border border-slate/10 rounded-xl p-4">
            <p className="text-xs text-slate/50">Sessions Learnt</p>
            <p className="font-mono text-2xl text-slate">{stats.learntCount}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white border border-slate/10 rounded-xl p-5 mb-8">
          <h2 className="font-display text-xl text-slate mb-3">Badges Earned</h2>
          {stats.badges.length === 0 ? (
            <p className="text-sm text-slate/50">No badges yet — teach 5 hours to earn "Bronze Tutor".</p>
          ) : (
            <div className="flex gap-2 flex-wrap mb-4">
              {stats.badges.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: badgeColors[b] || '#3A4648' }}
                >
                  🏅 {b}
                </span>
              ))}
            </div>
          )}

          {stats.nextBadge && (
            <>
              <p className="text-xs text-slate/50 mb-1">
                {stats.totalTeachingHours}/{stats.nextBadge.hours} hrs to "{stats.nextBadge.name}"
              </p>
              <div className="w-full bg-slate/10 rounded-full h-2">
                <div className="bg-marigold h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white border border-slate/10 rounded-xl p-5">
          <h2 className="font-display text-xl text-slate mb-4">Sessions Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#20292B10" />
              <XAxis dataKey="name" stroke="#20292B80" />
              <YAxis stroke="#20292B80" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sessions" fill="#E8A33D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;