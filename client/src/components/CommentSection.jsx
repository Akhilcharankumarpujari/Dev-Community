import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, Reply, Trash2, ShieldAlert } from 'lucide-react';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const res = await commentsAPI.getByPost(postId);
      setComments(res.data.comments);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await commentsAPI.add(postId, { content: newComment });
      setComments([res.data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await commentsAPI.add(postId, {
        content: replyText,
        parentCommentId: parentId,
      });
      // Add the reply to our list
      setComments([...comments, res.data.comment]);
      setReplyText('');
      setReplyToId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reply to comment');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return;
    try {
      const res = await commentsAPI.like(commentId);
      setComments(
        comments.map((c) => (c._id === commentId ? { ...c, likes: res.data.likes } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentsAPI.delete(commentId);
      setComments(
        comments.map((c) =>
          c._id === commentId
            ? { ...c, content: '[This comment has been deleted]', isDeleted: true }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Build hierarchal nested comments structure
  const rootComments = comments.filter((c) => !c.parentComment);

  const renderComment = (comment, isReply = false) => {
    const replies = comments.filter((c) => c.parentComment === comment._id);
    const hasLiked = user && comment.likes?.includes(user._id);

    return (
      <div
        key={comment._id}
        className={`flex gap-3 text-sm ${
          isReply ? 'ml-8 mt-4 border-l-2 border-dev-border dark:border-slate-800 pl-4' : 'mt-6'
        }`}
      >
        <img
          src={comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.username}`}
          alt={comment.author?.username}
          className="w-8 h-8 rounded-full object-cover border border-dev-border dark:border-dev-border-dark shrink-0"
        />

        <div className="flex-1 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-slate-800 dark:text-gray-200">
                {comment.author?.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                @{comment.author?.username}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>

            {user && (user._id === comment.author?._id || user.role === 'admin') && !comment.isDeleted && (
              <button
                onClick={() => handleDelete(comment._id)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                title="Delete comment"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          <div className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Action buttons */}
          {!comment.isDeleted && (
            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400">
              <button
                onClick={() => handleLike(comment._id)}
                className={`flex items-center gap-1 hover:text-red-500 ${
                  hasLiked ? 'text-red-500 font-semibold' : ''
                }`}
              >
                <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
                <span>{comment.likes?.length || 0} likes</span>
              </button>

              {user && !isReply && (
                <button
                  onClick={() => setReplyToId(replyToId === comment._id ? null : comment._id)}
                  className="flex items-center gap-1 hover:text-dev-brand dark:hover:text-blue-400"
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {replyToId === comment._id && (
            <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="mt-4">
              <textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3 py-2 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-dev-brand/50 focus:border-dev-brand"
                rows={2}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  className="px-3 py-1 text-xs text-gray-650 hover:bg-gray-100 dark:hover:bg-slate-850 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-1 bg-dev-brand text-white text-xs font-semibold rounded hover:bg-dev-brand-hover disabled:opacity-50"
                >
                  Submit Reply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="comments" className="mt-8 pt-8 border-t border-dev-border dark:border-slate-800">
      <h3 className="text-xl font-bold mb-6">Discussion ({comments.filter(c => !c.isDeleted).length})</h3>

      {/* Warning notifications */}
      {error && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 rounded-lg text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Main Comment input Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="flex gap-3 items-start">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover border border-dev-border dark:border-dev-border-dark shrink-0"
          />
          <div className="flex-1 space-y-3">
            <textarea
              placeholder="Add to the discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-3 border border-dev-border dark:border-dev-border-dark rounded-md bg-white dark:bg-dev-card-dark focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-dev-brand text-white font-semibold rounded hover:bg-dev-brand-hover transition-colors disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="p-5 text-center bg-gray-50 dark:bg-slate-850 rounded-lg border border-dev-border dark:border-dev-border-dark">
          <p className="text-gray-600 dark:text-gray-400 mb-3">Please sign in to join the conversation.</p>
          <a
            href="/enter"
            className="px-4 py-2 bg-dev-brand hover:bg-dev-brand-hover text-white text-sm font-semibold rounded shadow inline-block"
          >
            Log In / Sign Up
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {rootComments.map((rootComment) => (
          <div key={rootComment._id}>
            {renderComment(rootComment)}
            {/* Find replies for this root comment */}
            {comments
              .filter((c) => c.parentComment === rootComment._id)
              .map((reply) => renderComment(reply, true))}
          </div>
        ))}
        {rootComments.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">No comments yet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
