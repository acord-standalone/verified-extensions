export function PauseIcon(props = {}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`sb--icon sb--pause-icon ${props.className || ""}`}
      style={{ color: props.color }}
    >
      <path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z" fill="currentColor"></path>
    </svg>
  );
}