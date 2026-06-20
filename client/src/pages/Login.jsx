import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SwapMark from '../components/common/SwapMark';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-chalk px-4">
      <form onSubmit={handleSubmit} className="bg-white border-2 border-slate/10 p-8 rounded-2xl shadow-sm w-full max-w-sm">
        <SwapMark className="w-12 h-6 mb-4" color="#E8A33D" />
        <h2 className="font-display text-3xl mb-1 text-slate">Welcome back</h2>
        <p className="text-sm text-slate/60 mb-6">Log in to continue swapping skills.</p>

        {error && (
          <p className="bg-vermilion/10 text-vermilion text-sm px-3 py-2 rounded mb-4">{error}</p>
        )}

        <label className="text-xs font-medium text-slate/60">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mt-1 mb-4 focus:outline-none focus:border-marigold"
          required
        />

        <label className="text-xs font-medium text-slate/60">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mt-1 mb-6 focus:outline-none focus:border-marigold"
          required
        />

        <button type="submit" className="w-full bg-slate text-chalk py-2.5 rounded-lg font-medium hover:bg-slate-light transition">
          Log In
        </button>

        <p className="text-sm text-center mt-5 text-slate/70">
          New here? <Link to="/register" className="text-marigold font-medium">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;