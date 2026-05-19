import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [work, setWork] = useState('');
  const [skills, setSkills] = useState('');
  const [avatar, setAvatar] = useState('');

  // Social Links
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setWork(user.work || '');
      setSkills(user.skills?.join(', ') || '');
      setAvatar(user.avatar || '');
      setGithub(user.socialLinks?.github || '');
      setTwitter(user.socialLinks?.twitter || '');
      setLinkedin(user.socialLinks?.linkedin || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const profileData = {
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      work: work.trim(),
      avatar: avatar.trim(),
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      socialLinks: {
        github: github.trim(),
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
      },
    };

    try {
      await updateProfile(profileData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-xl shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black">Profile Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your public profile bio, handles, locations and specialties.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-emerald-700 dark:text-emerald-450 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information Card Group */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-gray-450 uppercase tracking-wider border-b pb-2 dark:border-slate-800">
              General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Bio</label>
              <textarea
                placeholder="A short description of yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Work</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineer at Acme Corp"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  className="w-full px-3.5 py-2 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Website URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Skills / Specialties</label>
              <input
                type="text"
                placeholder="e.g. React, Node, CSS, TypeScript (comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3.5 py-2 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
              />
            </div>
          </div>

          {/* Social Profiles Group */}
          <div className="space-y-4 pt-4 border-t border-dev-border dark:border-slate-800">
            <h3 className="font-bold text-sm text-gray-450 uppercase tracking-wider">
              Social Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-400">GitHub Profile URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-3 py-1.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-dev-brand text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-400">Twitter Profile URL</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-dev-brand text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-gray-400">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-1.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-dev-brand text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dev-brand hover:bg-dev-brand-hover text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Save size={18} />
            <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
