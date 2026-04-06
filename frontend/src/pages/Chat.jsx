import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/ai/history', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(({ data }) => setMessages(data)).catch(() => {});
  }, [user.token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice not supported in this browser');
    const r = new SR();
    r.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e) => setInput(e.results[0][0].transcript);
    recognitionRef.current = r;
    r.start();
  };

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/ai/chat',
        { question, language },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not reach AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow">
            🎓
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">AI Teacher</p>
            <p className="text-xs text-green-500 font-medium">● Online</p>
          </div>
        </div>
        {/* Language Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 text-sm">
          {['English', 'Hindi'].map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-lg transition font-semibold ${language === lang ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              {lang === 'Hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-5xl mb-5 shadow-xl shadow-indigo-500/30">
              🎓
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your AI Teacher</h2>
            <p className="text-gray-500 max-w-sm">Ask me anything — I'll explain it step by step like a real teacher.</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {['What is photosynthesis?', 'Explain Python loops', 'How does gravity work?'].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:border-indigo-400 hover:text-indigo-600 transition shadow-sm">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 animate-fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 mb-1">
                🎓
              </div>
            )}
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
            }`}>
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
              🎓
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-4 flex-shrink-0">
        <form onSubmit={send} className="flex gap-3 max-w-3xl mx-auto">
          <button type="button" onClick={startVoice}
            className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-lg transition flex-shrink-0 ${
              listening ? 'border-red-400 bg-red-50 animate-pulse' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
            }`}>
            🎤
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={language === 'Hindi' ? 'अपना सवाल पूछें...' : 'Ask your AI teacher anything...'}
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="btn-primary px-5 h-11 flex-shrink-0 flex items-center gap-2">
            <span>Send</span>
            <span>↑</span>
          </button>
        </form>
      </div>
    </div>
  );
}
