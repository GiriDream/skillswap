import api from '../../services/api';

const steps = ['Pending', 'Accepted', 'Live', 'Completed'];

function SwapRequestCard({ swap, isTutor, onUpdate }) {
  const currentStep = steps.indexOf(swap.status);

  const handleRespond = async (action) => {
    const { data } = await api.put(`/swap/${swap._id}/respond`, { action });
    onUpdate(data);
  };

  const handleStart = async () => {
    const { data } = await api.put(`/swap/${swap._id}/start`);
    onUpdate(data);
  };

  return (
    <div className="bg-white border-2 border-marigold/30 rounded-xl p-4 my-2 max-w-xs">
      <p className="font-display text-lg text-slate mb-0.5">Swap Request: {swap.skill}</p>
      <p className="text-xs text-slate/50 mb-3 font-mono">{swap.hours} hour(s)</p>

      {/* Status Pipeline */}
      <div className="flex items-center mb-3">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-3 h-3 rounded-full ${i <= currentStep ? 'bg-marigold' : 'bg-slate/15'}`} />
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-marigold' : 'bg-slate/15'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs font-mono font-medium text-slate/70 mb-3">{swap.status}</p>

      {swap.status === 'Pending' && isTutor && (
        <div className="flex gap-2">
          <button onClick={() => handleRespond('Accepted')} className="flex-1 bg-leaf text-white text-xs py-1.5 rounded-lg hover:opacity-90 transition">
            Accept
          </button>
          <button onClick={() => handleRespond('Declined')} className="flex-1 bg-vermilion text-white text-xs py-1.5 rounded-lg hover:opacity-90 transition">
            Decline
          </button>
        </div>
      )}

      {swap.status === 'Accepted' && (
        <button onClick={handleStart} className="w-full bg-slate text-chalk text-xs py-2 rounded-lg hover:bg-slate-light transition">
          Start Session
        </button>
      )}
    </div>
  );
}

export default SwapRequestCard;