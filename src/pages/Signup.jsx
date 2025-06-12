import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../utils/firebase.js'; // Make sure this path is correct

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
        return setError('Password should be at least 6 characters long.');
    }

    setLoading(true);

    try {
      await signup(email, password);
      navigate('/account'); // Redirect to account page on successful signup
    } catch (err) {
      setError('Failed to create an account. The email might already be in use.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="bg-dark-secondary rounded-xl p-8 border border-dark-border">
        <h2 className="text-3xl font-bold text-center text-dark-text-primary mb-6">Create an Account</h2>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-tertiary border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-text-secondary mb-2">
              Password (min. 6 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-tertiary border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-dark-text-secondary mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-dark-tertiary border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark-text-primary text-dark-primary py-3 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-dark-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

// This is the line that fixes the error.
export default Signup;