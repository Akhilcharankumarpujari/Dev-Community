import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { MapPin, Link as LinkIcon, Calendar, Briefcase, Award, Users, Settings } from 'lucide-react';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser, syncMe } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState('');

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersAPI.getProfile(username);
      setProfile(res.data.user);
      setPosts(res.data.posts);

      // Check if following
      if (currentUser && res.data.user.followers) {
        setIsFollowing(res.data.user.followers.some(f => f._id === currentUser._id));
      }
    } catch (err) {
      console.error(err);
      setError('User profile not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('Please log in to follow users');
      return;
    }
    try {
      const res = await usersAPI.follow(profile._id);
      setIsFollowing(res.data.isFollowing);
      // Refresh user details to sync followers count
      const updatedProfile = await usersAPI.getProfile(username);
      setProfile(updatedProfile.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeToggle = async (postId) => {
    if (!currentUser) return alert('Please log in to react');
    try {
      const res = await postsAPI.like(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    if (!currentUser) return alert('Please log in to save posts');
    try {
      await postsAPI.bookmark(postId);
      await syncMe();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 bg-white dark:bg-dev-card-dark rounded-xl border border-dev-border dark:border-dev-border-dark"></div>
        <div className="h-96 bg-white dark:bg-dev-card-dark rounded-xl border border-dev-border dark:border-dev-border-dark"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-red-500 font-bold text-lg">{error || 'Failed to load profile'}</p>
        <Link to="/" className="text-dev-brand hover:underline mt-4 inline-block">Back Home</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === profile.username;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Panel Card */}
      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-xl shadow-sm relative overflow-hidden">
        {/* Decorative Top Banner */}
        <div className="h-24 bg-slate-900 dark:bg-slate-800"></div>

        {/* Profile Details Grid */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-dev-card-dark shadow bg-white"
            />
            <div className="mb-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 w-full md:w-auto">
            {isOwnProfile ? (
              <Link
                to="/settings"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold rounded-md transition-colors w-full md:w-auto justify-center"
              >
                <Settings size={16} />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors w-full md:w-auto ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                    : 'bg-dev-brand text-white hover:bg-dev-brand-hover'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Detailed Stats Block */}
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-dev-border dark:border-slate-800 pt-6 text-sm text-gray-600 dark:text-gray-300">
          <div className="space-y-3">
            {profile.bio && <p className="text-slate-700 dark:text-gray-250 italic leading-relaxed">"{profile.bio}"</p>}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>Joined on {new Date(profile.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>

          <div className="space-y-2">
            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.work && (
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-gray-400" />
                <span>{profile.work}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-gray-400" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-dev-brand dark:text-blue-400 hover:underline">
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <span>
                <strong>{profile.followers?.length || 0}</strong> followers · <strong>{profile.following?.length || 0}</strong> following
              </span>
            </div>
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex items-start gap-2">
                <Award size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout containing Published Articles */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Info column */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-sm mb-3">Social Connections</h3>
            <div className="space-y-2.5 text-sm">
              {profile.socialLinks?.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-dev-brand">
                  <span>GitHub:</span>
                  <span className="font-semibold">{profile.socialLinks.github.split('/').pop()}</span>
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-dev-brand">
                  <span>Twitter:</span>
                  <span className="font-semibold">@{profile.socialLinks.twitter.split('/').pop()}</span>
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-dev-brand">
                  <span>LinkedIn:</span>
                  <span className="font-semibold">Profile</span>
                </a>
              )}
              {(!profile.socialLinks?.github && !profile.socialLinks?.twitter && !profile.socialLinks?.linkedin) && (
                <p className="text-xs text-gray-400">No social connections linked</p>
              )}
            </div>
          </div>
        </div>

        {/* Right side posts feed */}
        <div className="md:col-span-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Articles by {profile.name}</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <ArticleCard
                key={post._id}
                post={post}
                onLikeToggle={handleLikeToggle}
                onBookmarkToggle={handleBookmarkToggle}
                showCover={false}
              />
            ))}
            {posts.length === 0 && (
              <p className="text-gray-500 py-6 text-center bg-white dark:bg-dev-card-dark rounded-lg border border-dev-border dark:border-dev-border-dark">
                No articles published by this user yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
