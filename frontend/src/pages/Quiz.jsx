import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TOTAL_TIME = 10 * 60; // 10 minutes in seconds

export default function Quiz() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (timerActive && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, submitted]);

  const generate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true); setError(''); setSubmitted(false); setAnswers({});
    setTimeLeft(TOTAL_TIME); setTimerActive(false);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/quiz/generate',
        { topic, language, count: 10 },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setQuestions(data.questions);
      setTimerActive(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    let s = 0;
    setAnswers(prev => {
      questions.forEach((q, i) => { if (prev[i] === q.answer) s++; });
      return prev;
    });
    // recalculate synchronously
    questions.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    setScore(s);
    setSubmitted(true);
    await axios.post(
      'http://localhost:5000/api/quiz/submit',
      { topic, score: s, maxScore: questions.length },
      { headers: { Authorization: `Bearer ${user.token}` } }
    ).catch(() => {});
  };

  const reset = () => {
    setQuestions([]); setTopic(''); setSubmitted(false);
    setAnswers({}); setTimerActive(false); setTimeLeft(TOTAL_TIME);
    clearInterval(timerRef.current);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const timerPct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft > 120 ? 'bg-green-500' : timeLeft > 60 ? 'bg-yellow-500' : 'bg-red-500';
  const answered = Object.keys(answers).length;
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-gray-900">📝 Quiz Challenge</h1>
          <p className="text-gray-500 mt-1">10 questions · 10 minutes · Any topic</p>
        </div>

        {/* Generate Form */}
        {questions.length === 0 && (
          <div className="card p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                🧠
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Your Quiz</h2>
              <p className="text-gray-500 mt-1">Enter any topic and get 10 AI-generated questions</p>
            </div>

            <form onSubmit={generate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topic</label>
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis, Python, World War 2, Algebra..."
                  className="input-field text-base py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Language</label>
                <div className="flex gap-3">
                  {['English', 'Hindi'].map(lang => (
                    <button
                      key={lang} type="button"
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition ${
                        language === lang
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {lang === 'Hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full py-3.5 text-base">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating 10 questions...
                  </span>
                ) : 'Start Quiz ✨'}
              </button>
            </form>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: '❓', label: '10 Questions' },
                { icon: '⏱️', label: '10 Minutes' },
                { icon: '💡', label: 'With Explanations' },
              ].map(({ icon, label }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz in progress */}
        {questions.length > 0 && !submitted && (
          <div className="animate-fade-in">
            {/* Timer Bar */}
            <div className="card p-4 mb-6 sticky top-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-mono font-bold ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : timeLeft <= 120 ? 'text-yellow-600' : 'text-gray-800'}`}>
                    ⏱ {mins}:{secs}
                  </span>
                  {timeLeft <= 60 && <span className="text-xs text-red-500 font-semibold animate-pulse">Hurry up!</span>}
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {answered}/{questions.length} answered
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-1000 ${timerColor}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-5">
              {questions.map((q, i) => (
                <div key={i} className="card p-6 animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="font-semibold text-gray-800 leading-snug">{q.question}</p>
                  </div>
                  <div className="space-y-2 ml-11">
                    {q.options.map((opt, j) => {
                      const letter = ['A', 'B', 'C', 'D'][j];
                      const selected = answers[i] === letter;
                      return (
                        <button
                          key={j}
                          onClick={() => setAnswers(prev => ({ ...prev, [i]: letter }))}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                            selected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-700'
                          }`}
                        >
                          <span className={`inline-flex w-6 h-6 rounded-md items-center justify-center text-xs font-bold mr-2 ${selected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {letter}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubmit(false)}
              disabled={answered < questions.length}
              className="btn-primary w-full py-4 text-base mt-6"
            >
              {answered < questions.length
                ? `Answer all questions (${answered}/${questions.length})`
                : 'Submit Quiz 🚀'}
            </button>
          </div>
        )}

        {/* Results */}
        {submitted && (
          <div className="animate-fade-in">
            {/* Score Card */}
            <div className={`card p-8 text-center mb-6 bg-gradient-to-br ${percentage >= 80 ? 'from-green-50 to-teal-50' : percentage >= 60 ? 'from-blue-50 to-indigo-50' : 'from-red-50 to-orange-50'}`}>
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
              </div>
              <div className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {score}/{questions.length}
              </div>
              <div className="text-2xl font-bold text-gray-700 mb-1">{percentage}%</div>
              <p className="text-gray-500 text-lg">
                {percentage >= 80 ? 'Excellent work! 🎉' : percentage >= 60 ? 'Good job! Keep it up!' : 'Keep practicing — you\'ll get there!'}
              </p>

              {/* Score bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-6 mb-2">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${percentage >= 60 ? 'bg-green-500' : 'bg-red-400'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex gap-3 justify-center mt-6 flex-wrap">
                {percentage < 60 && (
                  <Link to="/chat"
                    className="btn-primary px-6 py-2.5 text-sm">
                    Ask AI about {topic} →
                  </Link>
                )}
                <button onClick={reset}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-semibold">
                  Try Another Topic
                </button>
              </div>
            </div>

            {/* Review */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Review Answers</h2>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const correct = answers[i] === q.answer;
                return (
                  <div key={i} className={`card p-5 border-l-4 ${correct ? 'border-green-500' : 'border-red-400'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${correct ? 'bg-green-500' : 'bg-red-400'}`}>
                        {correct ? '✓' : '✗'}
                      </span>
                      <p className="font-semibold text-gray-800 text-sm">{q.question}</p>
                    </div>
                    <div className="ml-10 space-y-1.5">
                      {q.options.map((opt, j) => {
                        const letter = ['A', 'B', 'C', 'D'][j];
                        const isCorrect = letter === q.answer;
                        const isWrong = answers[i] === letter && !isCorrect;
                        return (
                          <div key={j} className={`px-3 py-2 rounded-lg text-sm ${isCorrect ? 'bg-green-100 text-green-800 font-semibold' : isWrong ? 'bg-red-100 text-red-700' : 'text-gray-500'}`}>
                            <span className="font-bold mr-2">{letter}.</span>{opt}
                            {isCorrect && ' ✓'}
                          </div>
                        );
                      })}
                    </div>
                    <div className="ml-10 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                      💡 {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
