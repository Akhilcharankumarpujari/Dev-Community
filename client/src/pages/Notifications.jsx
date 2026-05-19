import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { Heart, MessageSquare, UserCheck, Reply, Trash2, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="text-red-500 fill-red-500" size={18} />;
      case 'comment':
        return <MessageSquare className="text-blue-500" size={18} />;
      case 'follow':
        return <UserCheck className="text-emerald-500" size={18} />;
      case 'reply':
        return <Reply className="text-indigo-500" size={18} />;
      default:
        return <MessageSquare className="text-gray-500" size={18} />;
    }
  };

  const getNotificationMessage = (n) => {
    const sender = (
      <Link to={`/u/${n.sender?.username}`} className="font-bold hover:underline">
        {n.sender?.name}
      </Link>
    );

    const post = n.post ? (
      <Link to={`/posts/${n.post?.slug}`} className="font-bold text-dev-brand dark:text-blue-400 hover:underline">
        "{n.post?.title}"
      </Link>
    ) : null;

    switch (n.type) {
      case 'like':
        return <span>{sender} liked your article {post}</span>;
      case 'comment':
        return <span>{sender} commented on your article {post}</span>;
      case 'follow':
        return <span>{sender} started following you</span>;
      case 'reply':
        return <span>{sender} replied to your comment on {post}</span>;
      default:
        return <span>{sender} interacted with you</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-5 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-black">Notifications</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Keep track of your interactions and followers</p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-xs font-semibold transition-colors"
          >
            <CheckSquare size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-lg shadow-sm divide-y divide-gray-100 dark:divide-slate-800">
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`p-4 flex items-center justify-between gap-4 transition-colors ${
              !n.isRead ? 'bg-blue-50/20 dark:bg-blue-950/5' : ''
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="shrink-0">{getNotificationIcon(n.type)}</div>
              <img
                src={n.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender?.username}`}
                alt={n.sender?.username}
                className="w-8 h-8 rounded-full object-cover border border-dev-border dark:border-dev-border-dark"
              />
              <div className="text-sm">{getNotificationMessage(n)}</div>
            </div>

            <button
              onClick={() => handleDelete(n._id)}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800"
              title="Delete notification"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {loading && (
          <div className="p-8 text-center animate-pulse text-gray-400">Loading your alerts...</div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No notifications yet. Interactions from comments or likes will display here.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
