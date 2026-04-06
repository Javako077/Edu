import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', preferredLanguage: 'English' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/profile', { headers })
      .then(({ data }) => {
        setProfile(data);
        setForm({ name: data.name, bio: data.bio || '', preferredLanguage: data.preferredLanguage || 'English' });
      })
      .catch(() => setError('Failed to load profile'));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', form, { headers });
      setProfile(data);
      updateUser(data.name);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save profile');
    } finally { setSaving(false); }
  };

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-gray-900">👤 My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account details</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-2xl px-5 py-4 mb-6 text-sm flex items-center gap-2 animate-fade-in">
            ✅ Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 mb-6 text-sm animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Avatar Hero Card */}
        <div className="card p-8 mb-6 animate-fade-in bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur text-white font-extrabold text-3xl flex items-center justify-center flex-shrink-0 shadow-xl border-2 border-white/30">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">{profile?.name}</h2>
              <p className="text-white/70 mt-1">{profile?.email}</p>
              <p className="text-white/50 text-xs mt-1">Member since {joinDate}</p>
              {profile?.bio && (
                <p className="text-white/80 text-sm mt-2 italic">"{profile.bio}"</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center flex-1">
              <p className="text-xs text-white/50">Language</p>
              <p className="font-semibold text-sm mt-0.5">{profile?.preferredLanguage || 'English'}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center flex-1">
              <p className="text-xs text-white/50">Status</p>
              <p className="font-semibold text-sm mt-0.5 text-green-300">● Active</p>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Account Details</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-100 transition font-semibold"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3} placeholder="Tell us about yourself..."
                  className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Language</label>
                <div className="flex gap-3">
                  {['English', 'Hindi'].map(lang => (
                    <button key={lang} type="button" onClick={() => setForm({ ...form, preferredLanguage: lang })}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition ${
                        form.preferredLanguage === lang
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {lang === 'Hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditing(false); setError(''); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition font-semibold text-sm">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              {[
                { label: 'Full Name', value: profile?.name, icon: '👤' },
                { label: 'Email', value: profile?.email, icon: '📧' },
                { label: 'Bio', value: profile?.bio || '—', icon: '📝' },
                { label: 'Preferred Language', value: profile?.preferredLanguage || 'English', icon: '🌐' },
                { label: 'Member Since', value: joinDate, icon: '📅' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">{icon}</span>
                    <span className="text-gray-500 text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-gray-800 text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
