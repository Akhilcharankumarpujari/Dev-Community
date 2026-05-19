import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { Flame, Compass, Calendar, AlertCircle } from 'lucide-react';

const HomeFeed = () => {
  const { user, syncMe } = useAuth();
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [activeTab, setActiveTab] = useState('latest'); // 'latest' or 'trending'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch feed posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'latest') {
        res = await postsAPI.getAll({ type: 'latest' });
      } else {
        res = await postsAPI.getAll({ type: 'top' });
      }
      setPosts(res.data.posts);
    } catch (err) {
      setError('Could not load articles. Is the API server online?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending list for right sidebar
  const fetchTrending = async () => {
    try {
      const res = await postsAPI.getTrending();
      setTrending(res.data.posts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const handleLikeToggle = async (postId) => {
    if (!user) {
      alert('Please log in to react to posts');
      return;
    }
    try {
      const res = await postsAPI.like(postId);
      // Update local state
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    if (!user) {
      alert('Please log in to save posts');
      return;
    }
    try {
      await postsAPI.bookmark(postId);
      await syncMe(); // Update savedPosts array in Auth Context
    } catch (err) {
      console.error(err);
    }
  };

  const popularTags = ['javascript', 'webdev', 'react', 'node', 'beginners', 'css', 'ai', 'opensource', 'productivity'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar (Only visible on medium desktops or larger) */}
      <div className="lg:col-span-3 hidden lg:block space-y-4">
        {/* Popular Tags Widget */}
        <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-sm flex items-center gap-1.5">
            <Compass size={16} />
            <span>Popular Tags</span>
          </h3>
          <div className="flex flex-col gap-1.5">
            {popularTags.map(tag => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1.5 text-sm text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md hover:text-dev-brand dark:hover:text-blue-400 font-medium transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed Column */}
      <div className="lg:col-span-6 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-dev-border dark:border-dev-border-dark pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === 'latest'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-slate-850'
              }`}
            >
              <Calendar size={15} />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === 'trending'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-slate-850'
              }`}
            >
              <Flame size={15} />
              <span>Trending</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-755 dark:text-red-400 flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Article Cards Grid */}
        <div className="space-y-4">
          {posts.map((post) => (
            <ArticleCard
              key={post._id}
              post={post}
              onLikeToggle={handleLikeToggle}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg p-5 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-28 bg-gray-200 dark:bg-slate-800 rounded"></div>
                      <div className="h-2 w-20 bg-gray-100 dark:bg-slate-850 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2 pl-12">
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-100 dark:bg-slate-850 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg">
              <p className="text-gray-550 dark:text-gray-400 font-semibold mb-2">No articles found</p>
              <p className="text-sm text-gray-405 dark:text-gray-500">Be the first to publish an article on the platform!</p>
              <Link to="/new" className="mt-4 inline-block px-4 py-2 bg-dev-brand text-white text-sm font-semibold rounded hover:bg-dev-brand-hover">
                Write Article
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Widgets */}
      <div className="lg:col-span-3 space-y-4">
        {/* Community info box */}
        <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg p-4 shadow-sm">
          <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm border-b pb-2 dark:border-slate-800">
            Active Discussions
          </h4>
          <div className="divide-y divide-gray-100 dark:divide-slate-850 text-xs">
            {trending.slice(0, 4).map((p) => (
              <Link
                key={p._id}
                to={`/posts/${p.slug}`}
                className="block py-2.5 hover:text-dev-brand dark:hover:text-blue-400 group"
              >
                <p className="font-semibold group-hover:underline text-slate-800 dark:text-gray-250 leading-snug">
                  {p.title}
                </p>
                <span className="text-gray-400 dark:text-gray-500 mt-1 block">
                  {p.commentsCount || 0} comments
                </span>
              </Link>
            ))}
            {trending.length === 0 && (
              <p className="text-gray-400 py-3 text-center">No discussions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;
