import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ArticleCard = ({ post, onLikeToggle, onBookmarkToggle, showCover = true }) => {
  const { user } = useAuth();

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const isLiked = user && post.likes?.includes(user._id);
  const isBookmarked = user && user.savedPosts?.some(
    (saved) => (typeof saved === 'object' ? saved._id : saved) === post._id
  );

  return (
    <article className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Cover Image */}
      {showCover && post.coverImage && (
        <Link to={`/posts/${post.slug}`} className="block aspect-[21/9] w-full overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-350"
            onError={(e) => {
              e.target.style.display = 'none'; // Fallback if image link fails
            }}
          />
        </Link>
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* Author info & Metadata */}
        <div className="flex items-center gap-3">
          <Link to={`/u/${post.author?.username}`}>
            <img
              src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`}
              alt={post.author?.name}
              className="w-9 h-9 rounded-full object-cover border border-dev-border dark:border-dev-border-dark"
            />
          </Link>
          <div>
            <Link
              to={`/u/${post.author?.username}`}
              className="font-medium text-slate-800 dark:text-gray-200 hover:text-dev-brand dark:hover:text-blue-400 text-sm"
            >
              {post.author?.name}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formattedDate} ({post.readingTime || 1} min read)
            </p>
          </div>
        </div>

        {/* Title & tags */}
        <div className="pl-0 md:pl-12 flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight hover:text-dev-brand dark:hover:text-blue-400">
            <Link to={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags?.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-450 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-dev-border dark:hover:border-dev-border-dark rounded-md"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Interactions */}
          <div className="flex items-center justify-between mt-5 text-sm">
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              {/* Like / Heart */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (onLikeToggle) onLikeToggle(post._id);
                }}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
                  isLiked ? 'text-red-500 font-semibold' : ''
                }`}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{post.likes?.length || 0} <span className="hidden sm:inline">reactions</span></span>
              </button>

              {/* Comments count */}
              <Link
                to={`/posts/${post.slug}#comments`}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MessageSquare size={18} />
                <span>{post.commentsCount || 0} <span className="hidden sm:inline">comments</span></span>
              </Link>
            </div>

            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                if (onBookmarkToggle) onBookmarkToggle(post._id);
              }}
              className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
                isBookmarked ? 'text-dev-brand dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
