import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import SwapMark from './SwapMark';

function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [showBell, setShowBell] = useState(false);

  const handleBellClick = () => {
    setShowBell(!showBell);
    if (!showBell) markAllRead();
  };

  return (
    <nav className="bg-slate text-chalk px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2">
        <SwapMark className="w-7 h-4" color="#E8A33D" />
        <span className="font-display text-2xl">Skill<span className="text-marigold">Swap</span></span>
      </Link>

      <div className="flex items-center gap-5 text-sm">
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-marigold transition">Dashboard</Link>
            <Link to="/analytics" className="hover:text-marigold transition">Analytics</Link>

            {/* Notification bell */}
            <div className="relative">
              <button onClick={handleBellClick} className="relative hover:text-marigold transition">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-vermilion text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showBell && (
                <div className="absolute right-0 mt-3 w-72 bg-white text-slate rounded-xl shadow-lg border border-slate/10 max-h-80 overflow-y-auto z-50">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate/50">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { setShowBell(false); navigate(`/chat/${n.fromId}`); }}
                        className="p-3 border-b border-slate/5 hover:bg-chalk cursor-pointer text-sm"
                      >
                        <p className="font-medium">{n.fromName}</p>
                        <p className="text-slate/60 text-xs">{n.preview}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link to="/profile" className="flex items-center gap-1.5 hover:text-marigold transition">
              {user.profileImage ? (
                <img src={user.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-marigold/20 text-marigold text-xs flex items-center justify-center">
                  {user.name?.charAt(0)}
                </span>
              )}
              Profile
            </Link>
            <span className="font-mono bg-slate-light px-2 py-1 rounded text-marigold">
              {user.credits} credits
            </span>
            <button onClick={() => { logout(); navigate('/'); }} className="hover:text-vermilion transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-marigold transition">Login</Link>
            <Link to="/register" className="bg-marigold text-slate px-4 py-1.5 rounded-full font-medium hover:bg-chalk transition">
              Start Swapping
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;