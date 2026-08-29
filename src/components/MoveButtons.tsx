export function MoveButtons({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <span className="move-buttons">
      <button disabled={!canMoveUp} onClick={onMoveUp} aria-label="Move up">↑</button>
      <button disabled={!canMoveDown} onClick={onMoveDown} aria-label="Move down">↓</button>
    </span>
  );
}
