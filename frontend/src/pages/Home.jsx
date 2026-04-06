import { Link } from 'react-router-dom';

const features = [
  { icon: '🧠', title: 'Smart Explanations', desc: 'Step-by-step answers tailored to your level', color: 'from-blue-500 to-indigo-600' },
  { icon: '📝', title: 'AI-Powered Quizzes', desc: '10 questions, 10 minutes — test any topic instantly', color: 'from-purple-500 to-pink-500' },
  { icon: '📊', title: 'Track Progress', desc: 'Visual charts of your strengths and weak areas', color: 'from-green-500 to-teal-500' },
  { icon: '🎤', title: 'Voice Input', desc: 'Ask questions by speaking in English or Hindi', color: 'from-orange-500 to-red-500' },
  { icon: '🌐', title: 'Multi-Language', desc: 'Learn in English or Hindi seamlessly', color: 'from-cyan-500 to-blue-500' },
  { icon: '⚡', title: 'Always Available', desc: 'Learn 24/7 without waiting for a teacher', color: 'from-yellow-500 to-orange-500' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0c29] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 max-w-6xl mx-auto">
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          FutureEdu
        </span>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2 rounded-xl border border-white/20 text-sm hover:bg-white/10 transition">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 rounded-xl bg-indigo-600 text-sm font-semibold hover:bg-indigo-500 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-24">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl -z-0" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl -z-0" />

        <div className="relative z-10 animate-fade-in">
          <span className="inline-block bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            AI-Powered Learning Platform
          </span>
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight">
            Learn Smarter with
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your AI Teacher
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Ask anything, take quizzes, track your progress — all powered by AI that explains like a real teacher.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup" className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-indigo-500/30">
              Start Learning Free →
            </Link>
            <Link to="/login" className="px-8 py-3.5 border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/10 transition">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-center text-3xl font-bold mb-12 text-white/90">Everything you need to excel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, color }, i) => (
            <div
              key={title}
              className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {icon}
              </div>
              <h3 className="font-bold text-lg mb-1">{title}</h3>
              <p className="text-white/50 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-20 px-4">
        <div className="inline-block glass rounded-3xl px-12 py-10">
          <h2 className="text-3xl font-bold mb-3">Ready to start learning?</h2>
          <p className="text-white/50 mb-6">Join thousands of students learning with AI</p>
          <Link to="/signup" className="inline-block px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold hover:opacity-90 transition shadow-lg shadow-indigo-500/30">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
