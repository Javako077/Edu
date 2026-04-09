import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from '../api';
import { useAuth } from '../context/AuthContext';

function Bar({ label, value, max, gradient }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 font-semibold">{label}</span>
        <span className={`font-bold ${pct >= 60 ? 'text-green-600' : 'text-red-500'}`}>{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Progress() {
  const { user } = useAuth();
  const [perf, setPerf] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/performance`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(({ data }) => setPerf(data)).catch(() => {});
  }, [user.token]);

  if (!perf) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading...
      </div>
    </div>
  );

  const overallPct = perf.totalMaxScore > 0 ? Math.round((perf.totalScore / perf.totalMaxScore) * 100) : 0;
  const weakTopics = perf.topics.filter(t => t.maxScore > 0 && (t.totalScore / t.maxScore) < 0.6).sort((a, b) => (a.totalScore / a.maxScore) - (b.totalScore / b.maxScore));
  const strongTopics = perf.topics.filter(t => t.maxScore > 0 && (t.totalScore / t.maxScore) >= 0.6).sort((a, b) => (b.totalScore / b.maxScore) - (a.totalScore / a.maxScore));
  const exploredTopics = perf.topics.filter(t => t.questionsAsked > 0 && t.maxScore === 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-gray-900">📊 My Progress</h1>
          <p className="text-gray-500 mt-1">Track your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Quizzes Taken', value: perf.totalQuizzes, icon: '📝', gradient: 'from-indigo-500 to-blue-600' },
            { label: 'Total Score', value: `${perf.totalScore}/${perf.totalMaxScore}`, icon: '🏆', gradient: 'from-purple-500 to-pink-500' },
            { label: 'Accuracy', value: `${overallPct}%`, icon: '🎯', gradient: overallPct >= 60 ? 'from-green-500 to-teal-500' : 'from-red-500 to-orange-500' },
            { label: 'Topics', value: perf.topics.length, icon: '📚', gradient: 'from-orange-500 to-yellow-500' },
          ].map(({ label, value, icon, gradient }, i) => (
            <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg animate-fade-in`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-2xl font-extrabold">{value}</p>
              <p className="text-white/70 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Overall Bar */}
        <div className="card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-bold text-gray-800 mb-4 text-lg">Overall Performance</h2>
          <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden mb-2">
            <div
              className={`h-5 rounded-full bg-gradient-to-r transition-all duration-1000 ${overallPct >= 60 ? 'from-green-400 to-teal-500' : 'from-red-400 to-orange-500'}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-semibold text-gray-700">{overallPct}% overall accuracy</span>
            <span>100%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weak Areas */}
          {weakTopics.length > 0 && (
            <div className="card p-6 animate-fade-in border-l-4 border-red-400" style={{ animationDelay: '0.4s' }}>
              <h2 className="font-bold text-red-500 mb-1 flex items-center gap-2">
                <span>⚠️</span> Weak Areas
              </h2>
              <p className="text-xs text-gray-400 mb-5">Scored below 60% — needs practice</p>
              {weakTopics.map(t => (
                <div key={t.name}>
                  <Bar label={t.name} value={t.totalScore} max={t.maxScore} gradient="from-red-400 to-orange-400" />
                  <div className="flex gap-2 -mt-2 mb-4">
                    <Link to="/chat" className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 transition font-medium">Ask AI →</Link>
                    <Link to="/quiz" className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full hover:bg-orange-100 transition font-medium">Retry Quiz →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strong Topics */}
          {strongTopics.length > 0 && (
            <div className="card p-6 animate-fade-in border-l-4 border-green-500" style={{ animationDelay: '0.45s' }}>
              <h2 className="font-bold text-green-600 mb-1 flex items-center gap-2">
                <span>✅</span> Strong Topics
              </h2>
              <p className="text-xs text-gray-400 mb-5">Scored 60% or above — keep it up!</p>
              {strongTopics.map(t => (
                <Bar key={t.name} label={t.name} value={t.totalScore} max={t.maxScore} gradient="from-green-400 to-teal-500" />
              ))}
            </div>
          )}
        </div>

        {/* Explored Topics */}
        {exploredTopics.length > 0 && (
          <div className="card p-6 mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h2 className="font-bold text-gray-800 mb-1">📚 Topics Explored (No Quiz Yet)</h2>
            <p className="text-xs text-gray-400 mb-4">You asked questions — now test yourself!</p>
            <div className="flex flex-wrap gap-2">
              {exploredTopics.map(t => (
                <Link key={t.name} to="/quiz"
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-full text-sm hover:bg-indigo-100 transition font-medium">
                  {t.name} <span className="text-indigo-400">({t.questionsAsked}q)</span> →
                </Link>
              ))}
            </div>
          </div>
        )}

        {perf.topics.length === 0 && (
          <div className="card p-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No data yet</h2>
            <p className="text-gray-400 mb-6">Start learning and taking quizzes to see your progress here</p>
            <Link to="/chat" className="btn-primary px-8 py-3">Start Learning →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
