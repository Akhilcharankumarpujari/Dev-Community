import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CommentSection from '../components/CommentSection';
import { Heart, MessageSquare, Bookmark, Calendar, Sparkles, AlertCircle, Edit, Trash2 } from 'lucide-react';

const ArticleDetails = () => {
  const { slug } = useParams();
  const { user, syncMe } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Summary States
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const fetchPost = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await postsAPI.getBySlug(slug);
      setPost(res.data.post);
    } catch (err) {
      console.error(err);
      setError('Article not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!user) return alert('Please log in to react');
    try {
      const res = await postsAPI.like(post._id);
      setPost({ ...post, likes: res.data.likes });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!user) return alert('Please log in to bookmark');
    try {
      await postsAPI.bookmark(post._id);
      await syncMe();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const res = await postsAPI.getSummary(post._id);
      setAiSummary(res.data.summary);
    } catch (err) {
      setSummaryError('Failed to generate AI Summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await postsAPI.delete(post._id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-4">
        <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-100 dark:bg-slate-850 rounded"></div>
        <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <AlertCircle className="mx-auto text-red-500 mb-2" size={36} />
        <p className="text-red-500 font-bold text-lg">{error || 'Article not found'}</p>
        <Link to="/" className="text-dev-brand hover:underline mt-4 inline-block">Back to Home Feed</Link>
      </div>
    );
  }

  const isLiked = user && post.likes?.some(u => (typeof u === 'object' ? u._id : u) === user._id);
  const isBookmarked = user && user.savedPosts?.some(
    (saved) => (typeof saved === 'object' ? saved._id : saved) === post._id
  );
  const isAuthor = user && post.author?._id === user._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Floating Side Action Panel (Hidden on screens below md) */}
      <div className="hidden md:flex flex-col items-center gap-6 fixed left-10 lg:left-24 top-40 z-30">
        <button
          onClick={handleLike}
          className={`flex flex-col items-center gap-1 group`}
        >
          <div className={`p-3 rounded-full border border-dev-border dark:border-dev-border-dark bg-white dark:bg-dev-card-dark shadow-sm group-hover:bg-red-50 dark:group-hover:bg-red-950/20 group-hover:text-red-500 transition-colors ${
            isLiked ? 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : 'text-gray-550 dark:text-gray-400'
          }`}>
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-xs font-semibold text-gray-500">{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={handleBookmark}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full border border-dev-border dark:border-dev-border-dark bg-white dark:bg-dev-card-dark shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-slate-800 group-hover:text-blue-500 transition-colors ${
            isBookmarked ? 'text-dev-brand dark:text-blue-400 bg-blue-50 dark:bg-slate-800' : 'text-gray-555 dark:text-gray-400'
          }`}>
            <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-xs font-semibold text-gray-500">Save</span>
        </button>

        <a href="#comments" className="flex flex-col items-center gap-1 group">
          <div className="p-3 rounded-full border border-dev-border dark:border-dev-border-dark bg-white dark:bg-dev-card-dark shadow-sm group-hover:bg-gray-100 dark:group-hover:bg-slate-800 transition-colors text-gray-555 dark:text-gray-400">
            <MessageSquare size={20} />
          </div>
          <span className="text-xs font-semibold text-gray-500">{post.commentsCount || 0}</span>
        </a>
      </div>

      {/* Main Post Content Layout container */}
      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-xl overflow-hidden shadow-sm">
        {/* Cover Photo */}
        {post.coverImage && (
          <div className="w-full aspect-[21/9] overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 md:p-10 space-y-6">
          {/* Author Block & Admin Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/u/${post.author?.username}`}>
                <img
                  src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`}
                  alt={post.author?.name}
                  className="w-12 h-12 rounded-full object-cover border border-dev-border dark:border-dev-border-dark"
                />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/u/${post.author?.username}`} className="font-bold hover:text-dev-brand dark:hover:text-blue-400">
                    {post.author?.name}
                  </Link>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">@{post.author?.username}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={12} />
                  <span>Published on {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{post.readingTime || 1} min read</span>
                </div>
              </div>
            </div>

            {/* Edit / Delete triggers */}
            {(isAuthor || isAdmin) && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit/${post._id}`}
                  className="p-2 text-gray-600 hover:text-dev-brand hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  title="Edit post"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="p-2 text-red-650 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                  title="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags?.map(tag => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 text-sm bg-gray-50 dark:bg-slate-850 hover:bg-gray-100 border border-dev-border dark:border-dev-border-dark text-gray-700 dark:text-gray-300 rounded-md"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* AI-Generated Article Summaries Widget */}
          <div className="border border-indigo-150 dark:border-indigo-950/40 bg-indigo-50/30 dark:bg-indigo-955/5 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles size={16} />
                <span>AI-Generated Article Summary</span>
              </h3>
              {!aiSummary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {summaryLoading ? 'Summarizing...' : 'Generate Summary'}
                </button>
              )}
            </div>
            {summaryLoading && (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 w-full bg-indigo-100 dark:bg-slate-800 rounded"></div>
                <div className="h-3 w-5/6 bg-indigo-100 dark:bg-slate-800 rounded"></div>
              </div>
            )}
            {summaryError && <p className="text-xs text-red-500 font-semibold">{summaryError}</p>}
            {aiSummary && (
              <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                {aiSummary}
              </p>
            )}
            {!aiSummary && !summaryLoading && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Want a quick overview? Generate a machine-learned bulleted summary of this article instantly.
              </p>
            )}
          </div>

          {/* Main Article Content */}
          <div className="pt-4 border-t border-dev-border dark:border-slate-800">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Mobile Reaction Actions (Hidden on desktop) */}
          <div className="flex md:hidden items-center justify-around border-t border-b border-dev-border dark:border-slate-850 py-3 mt-8 text-gray-600 dark:text-gray-400">
            <button onClick={handleLike} className={`flex items-center gap-1.5 ${isLiked ? 'text-red-500 font-semibold' : ''}`}>
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{post.likes?.length || 0}</span>
            </button>
            <button onClick={handleBookmark} className={`flex items-center gap-1.5 ${isBookmarked ? 'text-dev-brand dark:text-blue-400 font-semibold' : ''}`}>
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>Save</span>
            </button>
            <a href="#comments" className="flex items-center gap-1.5">
              <MessageSquare size={18} />
              <span>{post.commentsCount || 0}</span>
            </a>
          </div>

          {/* Comments/Discussion Section */}
          <CommentSection postId={post._id} />
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;
