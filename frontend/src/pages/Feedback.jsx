import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const TYPES = [
  { key: 'compliment', label: 'Compliment', icon: '🌟', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { key: 'suggestion', label: 'Suggestion', icon: '💡', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { key: 'bug',        label: 'Bug Report', icon: '🐛', color: 'border-red-400 bg-red-50 text-red-700' },
  { key: 'other',      label: 'Other',      icon: '💬', color: 'border-gray-400 bg-gray-50 text-gray-700' },
];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s} type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={(hovered || value) >= s ? 'text-yellow-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({ type: 'suggestion', rating: 0, message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    axios.get(`${API}/api/feedback/mine`, { headers })
      .then(({ data }) => setHistory(data)).catch(() => {});
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return setError('Please write a message');
    if (!form.rating) return setError('Please select a rating');
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/api/feedback`, form, { headers });
      setSubmitted(true);
      setForm({ type: 'suggestion', rating: 0, message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    } catch { setError('Failed to submit. Please try again.'); }
    finally { setLoading(false); }
  };

  const ratingLabel = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][form.rating] || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">💬 Feedback</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Help us improve FutureEdu — your voice matters!</p>
        </div>

        {/* Success Banner */}
        {submitted && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 animate-fade-in">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Thank you for your feedback!</p>
              <p className="text-sm text-green-600">We read every submission and use it to improve.</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="card dark:bg-gray-800 p-8 mb-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                What kind of feedback?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TYPES.map(t => (
                  <button
                    key={t.key} type="button"
                    onClick={() => setForm(p => ({ ...p, type: t.key }))}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm font-semibold ${
                      form.type === t.key ? t.color + ' scale-[1.03] shadow-md' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex items-center gap-4">
                <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
                {form.rating > 0 && (
                  <span className="text-sm font-semibold text-yellow-600 animate-fade-in">{ratingLabel}</span>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Your message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                rows={5}
                placeholder={
                  form.type === 'bug' ? 'Describe the issue — what happened and when...' :
                  form.type === 'suggestion' ? 'What feature or improvement would you like to see?' :
                  form.type === 'compliment' ? 'What did you love about FutureEdu?' :
                  'Share your thoughts...'
                }
                className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/500</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : 'Submit Feedback 🚀'}
            </button>
          </form>
        </div>

        {/* Previous Feedback */}
        {history.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Previous Feedback</h2>
            <div className="space-y-3">
              {history.map(fb => {
                const t = TYPES.find(x => x.key === fb.type) || TYPES[3];
                return (
                  <div key={fb._id} className="card dark:bg-gray-800 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${t.color}`}>
                          {t.icon} {t.label}
                        </span>
                        <span className="text-yellow-400 text-sm">
                          {'★'.repeat(fb.rating)}
                          <span className="text-gray-200">{'★'.repeat(5 - fb.rating)}</span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{fb.message}</p>
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
