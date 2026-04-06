import { useSettings } from '../context/SettingsContext';

const ACCENTS = [
  { key: 'indigo',  label: 'Indigo',  bg: 'bg-indigo-500' },
  { key: 'violet',  label: 'Violet',  bg: 'bg-violet-500' },
  { key: 'blue',    label: 'Blue',    bg: 'bg-blue-500'   },
  { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-500'},
  { key: 'rose',    label: 'Rose',    bg: 'bg-rose-500'   },
  { key: 'amber',   label: 'Amber',   bg: 'bg-amber-500'  },
];

const FONTS = [
  { key: 'small',  label: 'Small',  size: 'text-xs' },
  { key: 'medium', label: 'Medium', size: 'text-sm' },
  { key: 'large',  label: 'Large',  size: 'text-base' },
];

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${value ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700 p-6 mb-4 animate-fade-in">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 dark:text-white text-base">{title}</h3>
        {desc && <p className="text-gray-400 text-xs mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ icon, label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
          {desc && <p className="text-xs text-gray-400">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { settings, update, reset } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">⚙️ Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your learning experience</p>
        </div>

        {/* Appearance */}
        <Section title="🎨 Appearance" desc="Personalize how FutureEdu looks">
          <Row icon="🌙" label="Dark Mode" desc="Switch to a darker interface">
            <Toggle value={settings.darkMode} onChange={v => update('darkMode', v)} />
          </Row>

          <Row icon="📐" label="Compact Mode" desc="Reduce spacing for more content">
            <Toggle value={settings.compactMode} onChange={v => update('compactMode', v)} />
          </Row>

          {/* Accent Color */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">🎨</span>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Accent Color</p>
                <p className="text-xs text-gray-400">Theme color for buttons & highlights</p>
              </div>
            </div>
            <div className="flex gap-2">
              {ACCENTS.map(a => (
                <button
                  key={a.key}
                  onClick={() => update('accentColor', a.key)}
                  title={a.label}
                  className={`w-7 h-7 rounded-full ${a.bg} transition-transform hover:scale-110 ${settings.accentColor === a.key ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">🔤</span>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Font Size</p>
                <p className="text-xs text-gray-400">Adjust text size across the app</p>
              </div>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 gap-1">
              {FONTS.map(f => (
                <button
                  key={f.key}
                  onClick={() => update('fontSize', f.key)}
                  className={`px-3 py-1.5 rounded-lg ${f.size} font-semibold transition ${settings.fontSize === f.key ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="🔔 Notifications" desc="Control alerts and reminders">
          <Row icon="🔔" label="Push Notifications" desc="Get reminders to keep learning">
            <Toggle value={settings.notifications} onChange={v => update('notifications', v)} />
          </Row>
        </Section>

        {/* About */}
        <Section title="ℹ️ About">
          <div className="space-y-3 text-sm">
            {[
              { label: 'App Name',   value: 'FutureEdu AI Teacher' },
              { label: 'Version',    value: '2.0.0' },
              { label: 'AI Model',   value: 'Gemini 2.5 Flash' },
              { label: 'Built with', value: 'React + Node.js + MongoDB' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Reset */}
        <div className="card dark:bg-gray-800 p-6 animate-fade-in">
          <h3 className="font-bold text-gray-800 dark:text-white mb-1">⚠️ Reset Settings</h3>
          <p className="text-gray-400 text-xs mb-4">Restore all settings to their default values</p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition text-sm font-semibold"
          >
            Reset to Defaults
          </button>
        </div>

      </div>
    </div>
  );
}
