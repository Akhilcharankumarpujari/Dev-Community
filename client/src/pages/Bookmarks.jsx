import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Bookmark, Info } from 'lucide-react';

const Bookmarks = () => {
  const { user, syncMe } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Sync user profile first to ensure fresh savedPosts array
      await syncMe();
      const res = await postsAPI.getAll();
      
      // Filter posts that are in the user's saved list
      const savedIds = user.savedPosts?.map(p => typeof p === 'object' ? p._id : p) || [];
      const matched = res.data.posts.filter(p => savedIds.includes(p._id));
      setBookmarkedPosts(matched);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user?.savedPosts?.length]);

  const handleLikeToggle = async (postId) => {
    try {
      const res = await postsAPI.like(postId);
      setBookmarkedPosts(bookmarkedPosts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    try {
      await postsAPI.bookmark(postId);
      // Remove immediately from view
      setBookmarkedPosts(bookmarkedPosts.filter(p => p._id !== postId));
      await syncMe();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-6 rounded-lg shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Bookmark className="text-dev-brand dark:text-blue-400" />
            <span>Reading List ({bookmarkedPosts.length})</span>
          </h1>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">
            Your saved articles for offline or future reading.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {bookmarkedPosts.map((post) => (
          <ArticleCard
            key={post._id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onBookmarkToggle={handleBookmarkToggle}
          />
        ))}

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-44 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg"></div>
          </div>
        )}

        {!loading && bookmarkedPosts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg">
            <Info className="mx-auto text-gray-400 mb-2" size={28} />
            <p className="text-gray-500 font-bold">Your reading list is empty</p>
            <p className="text-xs text-gray-450 mt-1">Bookmark posts to read them later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
