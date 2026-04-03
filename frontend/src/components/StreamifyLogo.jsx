// Streamify logo — custom SVG, two signal arcs forming an "S" with gradient
function StreamifyLogo({ size = 32 }) {
  const id = "sg"; // gradient id
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Streamify"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Outer arc — top-right curve */}
      <path
        d="M8 28 C8 14, 22 6, 32 10"
        stroke={`url(#${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner arc — bottom-left curve (mirror, forms the S) */}
      <path
        d="M32 12 C32 26, 18 34, 8 30"
        stroke={`url(#${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Center dot — signal pulse */}
      <circle cx="20" cy="20" r="3" fill={`url(#${id})`} />

      {/* Top dot */}
      <circle cx="32" cy="11" r="2" fill="#a855f7" opacity="0.9" />

      {/* Bottom dot */}
      <circle cx="8" cy="29" r="2" fill="#06b6d4" opacity="0.9" />
    </svg>
  );
}

export default StreamifyLogo;
