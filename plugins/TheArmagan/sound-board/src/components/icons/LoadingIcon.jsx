export function LoadingIcon(props = {}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`sb--icon sb--loading-icon ${props.className || ""}`}
      style={{ color: props.color }}
    >
      <path fill="currentColor" d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z" />
    </svg>
  );
}