import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SwapMark from '../components/common/SwapMark';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    skillsToTeach: '', skillsToLearn: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        ...formData,
        skillsToTeach: formData.skillsToTeach.split(',').map(s => s.trim()),
        skillsToLearn: formData.skillsToLearn.split(',').map(s => s.trim())
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-chalk px-4 py-10">
      <form onSubmit={handleSubmit} className="bg-white border-2 border-slate/10 p-8 rounded-2xl shadow-sm w-full max-w-sm">
        <SwapMark className="w-12 h-6 mb-4" color="#E8A33D" />
        <h2 className="font-display text-3xl mb-1 text-slate">Join the swap</h2>
        <p className="text-sm text-slate/60 mb-6">5 free credits to start — no card needed.</p>

        {error && (
          <p className="bg-vermilion/10 text-vermilion text-sm px-3 py-2 rounded mb-4">{error}</p>
        )}

        <input name="name" placeholder="Full name" onChange={handleChange}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-marigold" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-marigold" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-marigold" required />
        <input name="skillsToTeach" placeholder="Skills you teach (comma separated)" onChange={handleChange}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-marigold" />
        <input name="skillsToLearn" placeholder="Skills you want to learn" onChange={handleChange}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-marigold" />

        <button type="submit" className="w-full bg-marigold text-slate py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
          Create Account
        </button>

        <p className="text-sm text-center mt-5 text-slate/70">
          Already swapping? <Link to="/login" className="text-marigold font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;