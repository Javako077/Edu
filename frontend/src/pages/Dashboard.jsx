import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [perf, setPerf] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${user.token}` };
    axios.get('http://localhost:5000/api/ai/history', { headers }).then(({ data }) => setHistory(data)).catch(() => {});
    axios.get('http://localhost:5000/api/performance', { headers }).then(({ data }) => setPerf(data)).catch(() => {});
  }, [user.token]);

  const totalQuestions = history.filter(m => m.role === 'user').length;
  const overallPct = perf?.totalMaxScore > 0 ? Math.round((perf.totalScore / perf.totalMaxScore) * 100) : null;
  const weakTopics = perf?.topics.filter(t => t.maxScore > 0 && (t.totalScore / t.maxScore) < 0.6) || [];

  const stats = [
    { label: 'Questions Asked', value: totalQuestions, icon: '💬', gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Quizzes Taken', value: perf?.totalQuizzes ?? 0, icon: '📝', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Quiz Accuracy', value: overallPct !== null ? `${overallPct}%` : '—', icon: '🎯', gradient: overallPct >= 60 ? 'from-green-500 to-teal-500' : 'from-red-500 to-orange-500' },
    { label: 'Topics Studied', value: perf?.topics.length ?? 0, icon: '📚', gradient: 'from-orange-500 to-yellow-500' },
  ];

  const actions = [
    { to: '/chat', icon: '🎓', label: 'Ask AI Teacher', desc: 'Get step-by-step explanations', gradient: 'from-indigo-600 to-blue-600' },
    { to: '/quiz', icon: '📝', label: 'Take a Quiz', desc: '10 questions · 10 minutes', gradient: 'from-purple-600 to-pink-600' },
    { to: '/progress', icon: '📊', label: 'View Progress', desc: 'Strengths & weak areas', gradient: 'from-green-600 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Good day, {user.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your learning overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon, gradient }, i) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg animate-fade-in`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-3xl font-extrabold">{value}</p>
            <p className="text-white/70 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {actions.map(({ to, icon, label, desc, gradient }, i) => (
          <Link
            key={to} to={to}
            className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-6 hover:scale-[1.02] transition-transform shadow-lg animate-fade-in`}
            style={{ animationDelay: `${0.3 + i * 0.08}s` }}
          >
            <div className="text-3xl mb-3">{icon}</div>
            <p className="font-bold text-lg">{label}</p>
            <p className="text-white/60 text-sm mt-1">{desc}</p>
            <span className="inline-block mt-3 text-xs bg-white/20 px-3 py-1 rounded-full">Go →</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Areas */}
        {weakTopics.length > 0 && (
          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚠️</span>
              <h2 className="font-bold text-gray-800">Needs Improvement</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map(t => (
                <Link key={t.name} to="/quiz"
                  className="bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm hover:bg-red-100 transition font-medium">
                  {t.name} · {Math.round((t.totalScore / t.maxScore) * 100)}%
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Questions */}
        {history.length > 0 && (
          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.55s' }}>
            <h2 className="font-bold text-gray-800 mb-4">Recent Questions</h2>
            <ul className="space-y-2">
              {history.filter(m => m.role === 'user').slice(-4).reverse().map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-indigo-400 mt-0.5">›</span>
                  <span className="line-clamp-1">{m.content}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
