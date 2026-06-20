import { useState } from 'react';
import api from '../../services/api';

function CompletionModal({ swap, targetId, onClose, onConfirmed }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleConfirm = async () => {
    const { data } = await api.put(`/swap/${swap._id}/confirm`);
    await api.post('/review', { swapId: swap._id, revieweeId: targetId, rating, comment });
    onConfirmed(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-display text-2xl text-slate mb-1">Session done?</h3>
        <p className="text-sm text-slate/60 mb-4">Confirm completion and rate your swap partner.</p>

        <div className="flex gap-1 justify-center mb-4 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setRating(n)}
              className={`cursor-pointer ${n <= rating ? 'text-marigold' : 'text-slate/20'}`}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a short comment (optional)"
          className="w-full border border-slate/20 rounded-lg p-2 text-sm mb-4"
          rows={3}
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-slate/20 text-slate py-2 rounded-lg text-sm">
            Cancel
          </button>
          <button onClick={handleConfirm} className="flex-1 bg-leaf text-white py-2 rounded-lg text-sm">
            Confirm Completion
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionModal;