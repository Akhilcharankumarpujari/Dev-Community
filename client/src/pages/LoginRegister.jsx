import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

const LoginRegister = () => {
  const { login, register, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isSignUpDefault = searchParams.get('signup') === 'true';
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsSignUp(searchParams.get('signup') === 'true');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validation check
        if (!name || !username || !email || !password) {
          throw new Error('Please fill in all fields');
        }
        await register(name, username, email, password);
        setSuccess('Registration successful! Welcome to the community.');
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password');
        }
        await login(email, password);
        setSuccess('Login successful! Redirecting...');
      }

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3.5 py-1.5 rounded-lg text-xl font-black font-mono tracking-wider">
            DEV
          </Link>
          <h2 className="text-xl font-bold mt-4 text-slate-800 dark:text-white">
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </h2>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
            {isSignUp ? 'Join the DEV Community of developers' : 'Enter your credentials to manage your posts'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-2.5">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-emerald-700 dark:text-emerald-450 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  placeholder="e.g. johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-dev-border dark:border-dev-border-dark rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dev-brand hover:bg-dev-brand-hover disabled:opacity-50 text-white font-bold rounded-lg shadow transition-colors"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-dev-border dark:border-slate-800 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Already have an account?' : 'New to DEV Community?'}
            <button
              onClick={() => {
                setError('');
                setIsSignUp(!isSignUp);
              }}
              className="text-dev-brand dark:text-blue-400 font-semibold hover:underline ml-1"
            >
              {isSignUp ? 'Log in' : 'Create account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
