import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/users/${id}/profile`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <p className="p-6 text-slate/50">Loading...</p>;

  const { user, reviews, avgRating, reviewCount } = data;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-chalk px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-slate/10 rounded-2xl p-8 text-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate/10 mx-auto mb-4 flex items-center justify-center">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-slate/40">{user.name.charAt(0)}</span>
            )}
          </div>
          <h1 className="font-display text-2xl text-slate">{user.name}</h1>
          {user.level && <p className="text-xs font-mono text-marigold mt-1">{user.level}</p>}

          {avgRating && (
            <p className="text-sm text-slate/60 mt-2">⭐ {avgRating} ({reviewCount} reviews)</p>
          )}

          <div className="flex flex-wrap gap-1.5 justify-center mt-4">
            {user.skillsToTeach.map((s) => (
              <span key={s} className="bg-marigold/10 text-marigold text-xs px-2.5 py-1 rounded-full">{s}</span>
            ))}
          </div>

          <button
            onClick={() => navigate(`/chat/${user._id}`)}
            className="mt-5 bg-slate text-chalk px-6 py-2 rounded-full text-sm hover:bg-slate-light transition"
          >
            Start Chat
          </button>
        </div>

        <h2 className="font-display text-xl text-slate mb-3">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-slate/50 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white border border-slate/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate text-sm">{r.reviewer.name}</span>
                  <span className="text-marigold text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-slate/60">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;