export function PlayIcon(props = {}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`sb--icon sb--play-icon ${props.className || ""}`}
      style={{ color: props.color }}
    >
      <path d="M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z" fill="currentColor"></path>
    </svg>
  );
}