import { Vector2, float } from "@babylonjs/core";

export const getLineXYatPercent = (
  startPt: Vector2,
  endPt: Vector2,
  percent: float,
) => {
  const dx = endPt.x - startPt.x;
  const dy = endPt.y - startPt.y;
  const X = startPt.x + dx * percent;
  const Y = startPt.y + dy * percent;
  return new Vector2(X, Y);
};
