import React, { useState, useEffect } from 'react';
import { usersAPI, postsAPI } from '../services/api';
import { Shield, Users, BookOpen, Trash2, Award, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const usersRes = await usersAPI.getAll();
      const postsRes = await postsAPI.getAll();
      setUsers(usersRes.data.users || []);
      setPosts(postsRes.data.posts || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard administration metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete user? This removes all their articles and comments permanently.')) return;
    try {
      await usersAPI.delete(userId);
      setUsers(users.filter(u => u._id !== userId));
      // Refresh posts since they are deleted cascaded on server
      const postsRes = await postsAPI.getAll();
      setPosts(postsRes.data.posts);
    } catch (err) {
      alert('Could not delete user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete article? This action cannot be undone.')) return;
    try {
      await postsAPI.delete(postId);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      alert('Could not delete article');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading admin metrics dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <Shield className="text-blue-400" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Oversee community users, remove abusive articles, and examine system metrics.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-slate-800 text-dev-brand dark:text-blue-400 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block uppercase">Total Users</span>
            <span className="text-2xl font-bold text-slate-850 dark:text-white">{users.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block uppercase">Total Articles</span>
            <span className="text-2xl font-bold text-slate-850 dark:text-white">{posts.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-5 rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-450 rounded-full">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block uppercase">Interactions</span>
            <span className="text-2xl font-bold text-slate-850 dark:text-white">
              {posts.reduce((sum, p) => sum + (p.likes?.length || 0) + (p.commentsCount || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Lists Table panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users list card */}
        <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-slate-800">User Management</h3>
          <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
            {users.map(u => (
              <div key={u._id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <img src={u.avatarUrl || u.avatar} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username} ({u.role})</p>
                  </div>
                </div>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Posts list card */}
        <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-slate-800">Article Censorship</h3>
          <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
            {posts.map(p => (
              <div key={p._id} className="py-3 flex items-center justify-between text-sm gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 truncate">by @{p.author?.username || 'deleted_user'}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(p._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded shrink-0 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
