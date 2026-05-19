import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { Search, AlertCircle } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user, syncMe } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      // Search matches both tags & titles using general posts query
      const isTagQuery = query.startsWith('#') || query.includes(' ');
      const params = isTagQuery
        ? { search: query }
        : { search: query, tag: query };

      const res = await postsAPI.getAll(params);
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
      setError('Search lookup failed. Please try a different term.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  const handleLikeToggle = async (postId) => {
    if (!user) return alert('Please login to react');
    try {
      const res = await postsAPI.like(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    if (!user) return alert('Please login to save');
    try {
      await postsAPI.bookmark(postId);
      await syncMe();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-6 rounded-lg shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Search size={22} className="text-gray-400" />
          <span>Search Results for "{query || '...'}"</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Matched titles, content blocks, or hashtag links</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-2">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

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
            {[1, 2].map((n) => (
              <div key={n} className="bg-white dark:bg-dev-card-dark rounded-lg p-6 animate-pulse h-40"></div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg">
            <p className="text-gray-500 font-bold mb-2">No matching articles found</p>
            <p className="text-xs text-gray-450">Try checking spelling, removing hashtags, or typing simpler words.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
