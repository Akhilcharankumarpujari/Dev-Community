import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { BookOpen, Eye, Edit2, AlertCircle, Save, Check } from 'lucide-react';

const CreateEditArticle = () => {
  const { id } = useParams(); // exists only if editing
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('general');
  const [published, setPublished] = useState(false);

  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      const fetchPostData = async () => {
        try {
          const res = await postsAPI.getAll({ author: user?._id });
          const postToEdit = res.data.posts.find(p => p._id === id);
          if (postToEdit) {
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setCoverImage(postToEdit.coverImage || '');
            setTags(postToEdit.tags?.join(', ') || '');
            setCategory(postToEdit.category || 'general');
            setPublished(postToEdit.published || false);
          } else {
            // Alternatively try matching slug
            const single = await postsAPI.getBySlug(id);
            if (single.data.post) {
              const p = single.data.post;
              setTitle(p.title);
              setContent(p.content);
              setCoverImage(p.coverImage || '');
              setTags(p.tags?.join(', ') || '');
              setCategory(p.category || 'general');
              setPublished(p.published || false);
            }
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch post data for editing');
        }
      };
      if (user) {
        fetchPostData();
      }
    }
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill out the title and content blocks.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const postData = {
      title: title.trim(),
      content: content.trim(),
      coverImage: coverImage.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      category,
      published,
    };

    try {
      let res;
      if (id) {
        res = await postsAPI.update(id, postData);
        setSuccess('Article updated successfully!');
      } else {
        res = await postsAPI.create(postData);
        setSuccess('Article created successfully!');
      }

      setTimeout(() => {
        navigate(`/posts/${res.data.post.slug}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save the article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Upper toolbar controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {id ? 'Edit Article' : 'Create a New Article'}
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
            Share your expertise, findings, or developer tips with the community.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-dev-border dark:border-slate-800 rounded-lg p-1 bg-white dark:bg-dev-card-dark">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              !previewMode
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-gray-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Edit2 size={14} />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              previewMode
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-gray-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-2.5">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-205 dark:border-emerald-900/50 rounded-lg text-emerald-700 dark:text-emerald-450 flex items-start gap-2.5">
          <Check size={18} className="shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Main editor form panels */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`lg:col-span-8 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-xl p-6 shadow-sm space-y-5 ${previewMode ? 'hidden' : 'block'}`}>
          {/* Cover photo */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-750 dark:text-gray-305">Cover Image URL</label>
            <input
              type="url"
              placeholder="e.g. https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-750 dark:text-gray-305">Post Title</label>
            <input
              type="text"
              placeholder="New post title here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent font-bold text-xl focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-755 dark:text-gray-300">Tags</label>
            <input
              type="text"
              placeholder="e.g. javascript, react, beginners (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm"
            />
          </div>

          {/* Content Block */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-755 dark:text-gray-300">Article Content (Markdown)</label>
            <textarea
              placeholder="Write your article content here in Markdown format..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent font-mono text-sm focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand"
              rows={16}
              required
            />
          </div>
        </div>

        {/* Live Preview Panel (Displays rendered markdown side) */}
        <div className={`lg:col-span-8 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-xl p-6 shadow-sm min-h-[500px] ${previewMode ? 'block' : 'hidden'}`}>
          {coverImage && (
            <div className="w-full aspect-[21/9] overflow-hidden rounded-lg mb-6">
              <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black mb-4">{title || 'Untitled Post'}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-gray-50 dark:bg-slate-850 border border-dev-border dark:border-dev-border-dark text-sm rounded-md text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
          <div className="pt-6 border-t border-dev-border dark:border-slate-800">
            {content ? <MarkdownRenderer content={content} /> : <p className="text-gray-400 italic">No content written yet.</p>}
          </div>
        </div>

        {/* Right side settings panel */}
        <div className="lg:col-span-4 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-xl p-5 shadow-sm space-y-5">
          <h3 className="font-bold text-sm border-b pb-2 dark:border-slate-800">Publishing Settings</h3>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-dev-border dark:border-dev-border-dark bg-white dark:bg-dev-card-dark rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-dev-brand"
            >
              <option value="general">General Discussion</option>
              <option value="tutorials">Tutorial / Guide</option>
              <option value="showcase">Project Showcase</option>
              <option value="news">Tech News</option>
              <option value="careers">Career Advice</option>
            </select>
          </div>

          {/* Publish / Draft Toggle */}
          <div className="flex items-center justify-between p-3 border border-dev-border dark:border-slate-800 rounded-lg">
            <div>
              <span className="text-sm font-semibold block text-slate-800 dark:text-white">Publish Article</span>
              <span className="text-xs text-gray-400">Make it visible immediately.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-250 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-dev-brand"></div>
            </label>
          </div>

          {/* Publish Actions buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-dev-brand hover:bg-dev-brand-hover text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : id ? 'Update Post' : 'Save Changes'}</span>
            </button>
            <Link
              to="/"
              className="px-4 py-2.5 border border-dev-border dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-sm text-center font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditArticle;
