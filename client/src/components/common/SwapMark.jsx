function SwapMark({ className = 'w-8 h-8', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 24" className={className} fill="none">
      <path d="M2 8 H38 M32 2 L38 8 L32 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 16 H10 M16 22 L10 16 L16 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default SwapMark;