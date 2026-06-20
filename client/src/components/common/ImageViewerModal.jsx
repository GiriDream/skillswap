function ImageViewerModal({ src, onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate/90 flex items-center justify-center z-50 cursor-zoom-out"
    >
      <img
        src={src}
        alt="Profile full view"
        className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-chalk bg-slate-light w-10 h-10 rounded-full text-xl"
      >
        ✕
      </button>
    </div>
  );
}

export default ImageViewerModal;