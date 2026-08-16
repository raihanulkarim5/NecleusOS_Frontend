interface NecleusLogoProps {
  size?: number;
  showWordmark?: boolean;
}

// A small abstract nucleus mark — a glowing core with two crossing orbit
// rings — playing on the "Necleus" name while fitting the galaxy theme.
export function NecleusLogo({ size = 28, showWordmark = true }: NecleusLogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="necleus-core" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="24" rx="20" ry="9" stroke="#8B5CF6" strokeWidth="1.6" opacity="0.7" />
        <ellipse cx="24" cy="24" rx="20" ry="9" stroke="#38BDF8" strokeWidth="1.6" opacity="0.55" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="20" ry="9" stroke="#D946A8" strokeWidth="1.6" opacity="0.45" transform="rotate(120 24 24)" />
        <circle cx="24" cy="24" r="5.5" fill="url(#necleus-core)" />
      </svg>
      {showWordmark && <span className="necleus-wordmark">Necleus</span>}
    </div>
  );
}
