import React, { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { Flame, Info } from 'lucide-react';

const Trending = () => {
  const { user, syncMe } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingPosts = async () => {
    try {
      const res = await postsAPI.getTrending();
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const handleLikeToggle = async (postId) => {
    if (!user) return alert('Please log in to react');
    try {
      const res = await postsAPI.like(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    if (!user) return alert('Please log in to save posts');
    try {
      await postsAPI.bookmark(postId);
      await syncMe();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-6 rounded-lg shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <Flame className="text-amber-500 fill-amber-500" />
            <span>Trending Articles</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Top articles published in the community over the last 30 days based on views and reactions.
          </p>
        </div>
      </div>

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
              <div key={n} className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-6 rounded-lg animate-pulse h-48"></div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg">
            <Info className="mx-auto text-gray-400 mb-2" size={30} />
            <p className="text-gray-550 dark:text-gray-400 font-semibold">No trending posts in this cycle</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
