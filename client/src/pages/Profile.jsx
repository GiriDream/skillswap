import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ImageViewerModal from '../components/common/ImageViewerModal';

function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [skillsToTeach, setSkillsToTeach] = useState((user?.skillsToTeach || []).join(', '));
  const [skillsToLearn, setSkillsToLearn] = useState((user?.skillsToLearn || []).join(', '));
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('skillsToTeach', skillsToTeach);
    formData.append('skillsToLearn', skillsToLearn);
    if (imageFile) formData.append('profileImage', imageFile);

    try {
      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(data);
      setSuccess(true);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-chalk px-4 py-10">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white border border-slate/10 rounded-2xl p-8">
        <h2 className="font-display text-3xl text-slate mb-6">Edit Profile</h2>

        {/* Profile image */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => preview && setShowViewer(true)}
            className={`w-24 h-24 rounded-full overflow-hidden bg-slate/10 mb-3 flex items-center justify-center ${preview ? 'cursor-pointer' : ''}`}
          >
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-slate/40">{user?.name?.charAt(0)}</span>
            )}
          </div>
          {preview && (
            <p className="text-xs text-slate/40 mb-2">Tap photo to view full size</p>
          )}
          <label className="text-sm text-marigold font-medium cursor-pointer">
            Change photo
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {success && (
          <p className="bg-leaf/10 text-leaf text-sm px-3 py-2 rounded mb-4 text-center">Profile updated!</p>
        )}

        <label className="text-xs font-medium text-slate/60">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mt-1 mb-4 focus:outline-none focus:border-marigold"
        />

        <label className="text-xs font-medium text-slate/60">Skills you teach (comma separated)</label>
        <input
          value={skillsToTeach}
          onChange={(e) => setSkillsToTeach(e.target.value)}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mt-1 mb-4 focus:outline-none focus:border-marigold"
        />

        <label className="text-xs font-medium text-slate/60">Skills you want to learn</label>
        <input
          value={skillsToLearn}
          onChange={(e) => setSkillsToLearn(e.target.value)}
          className="w-full border border-slate/20 rounded-lg px-3 py-2 mt-1 mb-6 focus:outline-none focus:border-marigold"
        />

        <button type="submit" disabled={saving} className="w-full bg-slate text-chalk py-2.5 rounded-lg font-medium hover:bg-slate-light transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {showViewer && (
        <ImageViewerModal src={preview} onClose={() => setShowViewer(false)} />
      )}
    </div>
  );
}

export default Profile;