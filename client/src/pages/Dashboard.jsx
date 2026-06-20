import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/map/MapView';
import SwapMark from '../components/common/SwapMark';

const avatarColors = ['#E8A33D', '#6B8F71', '#C84B31', '#3A4648'];
const colorFor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate/10 rounded-xl p-5 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate/10 mb-3" />
      <div className="h-4 w-2/3 bg-slate/10 rounded mb-2" />
      <div className="h-3 w-1/2 bg-slate/10 rounded mb-4" />
      <div className="h-8 w-full bg-slate/10 rounded-lg" />
    </div>
  );
}

function Dashboard() {
  const { coords, error: geoError } = useGeolocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [radius, setRadius] = useState(15);
  const [skillQuery, setSkillQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [view, setView] = useState('list');

  useEffect(() => {
    if (coords) {
      api.put('/users/location', coords)
        .then(() => setLocationSaved(true))
        .catch((err) => console.error(err));
    }
  }, [coords]);

  const fetchMatches = () => {
    if (!locationSaved) return;
    setLoading(true);
    const skillParam = skillQuery.trim() ? `&skill=${encodeURIComponent(skillQuery.trim())}` : '';
    api.get(`/match/nearby?radius=${radius}${skillParam}`)
      .then((res) => setMatches(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, [radius, locationSaved]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-chalk">
      {/* Welcome banner */}
      <div className="bg-slate text-chalk px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl text-white overflow-hidden"
              style={{ backgroundColor: colorFor(user?.name || 'S') }}
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl">Hey {user?.name} 👋</h1>
              <p className="text-chalk/60 text-sm">Here's who's nearby and ready to swap skills.</p>
            </div>
          </div>
          <div className="bg-slate-light px-4 py-2 rounded-xl text-center">
            <p className="text-xs text-chalk/50">Your credits</p>
            <p className="font-mono text-xl text-marigold">{user?.credits ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {geoError && (
          <p className="bg-vermilion/10 text-vermilion px-4 py-3 rounded-lg mb-4 text-sm">
            Location error: {geoError}. Please allow location access in your browser.
          </p>
        )}

        {!locationSaved && !geoError && (
          <div className="flex items-center gap-2 text-slate/50 text-sm mb-4">
            <div className="w-4 h-4 border-2 border-slate/30 border-t-marigold rounded-full animate-spin" />
            Detecting your location...
          </div>
        )}

        {locationSaved && (
          <>
            {/* Search bar */}
            <div className="flex gap-2 mb-4">
              <input
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMatches()}
                placeholder="Search a specific skill (e.g. React, Cooking, Tamil)"
                className="flex-1 border border-slate/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-marigold"
              />
              <button
                onClick={fetchMatches}
                className="bg-slate text-chalk px-5 py-2 rounded-full text-sm hover:bg-slate-light transition"
              >
                Search
              </button>
              {skillQuery && (
                <button
                  onClick={() => { setSkillQuery(''); setTimeout(fetchMatches, 0); }}
                  className="text-slate/50 text-sm px-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Controls bar */}
            <div className="bg-white border border-slate/10 rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-1">
                <label className="flex justify-between text-sm font-medium text-slate mb-2">
                  <span>Search radius</span>
                  <span className="font-mono text-marigold">{radius} km</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-marigold"
                />
              </div>

              <div className="flex bg-chalk rounded-full p-1 self-start md:self-center">
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-1.5 rounded-full text-sm transition ${view === 'list' ? 'bg-slate text-chalk' : 'text-slate/60'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-4 py-1.5 rounded-full text-sm transition ${view === 'map' ? 'bg-slate text-chalk' : 'text-slate/60'}`}
                >
                  Map
                </button>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-slate/20 rounded-xl">
                <SwapMark className="w-14 h-7 mx-auto mb-3" color="#20292B30" />
                <p className="text-slate font-display text-lg">Nothing on the board nearby</p>
                <p className="text-slate/50 text-sm mt-1">Try widening your search radius or clearing the skill filter.</p>
              </div>
            ) : view === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matches.map((m) => (
                  <div
                    key={m._id}
                    className="bg-white border border-slate/10 rounded-xl p-5 hover:border-marigold hover:shadow-md transition"
                  >
                    <div
                      onClick={() => navigate(`/user/${m._id}`)}
                      className="flex items-center gap-3 mb-3 cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-display text-white overflow-hidden"
                        style={{ backgroundColor: colorFor(m.name) }}
                      >
                        {m.profileImage ? (
                          <img src={m.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          m.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-slate leading-tight hover:text-marigold transition">{m.name}</h3>
                        <p className="text-xs font-mono text-leaf">{m.credits} credits</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {m.skillsToTeach.map((skill) => (
                        <span key={skill} className="bg-marigold/10 text-marigold text-xs px-2.5 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate(`/chat/${m._id}`)}
                      className="w-full bg-slate text-chalk py-2 rounded-lg text-sm hover:bg-slate-light transition"
                    >
                      Start Chat
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-slate/10">
                <MapView userCoords={coords} matches={matches} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;