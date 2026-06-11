import { COLORS } from "../constants";

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 86, left: "50%", transform: "translateX(-50%)", background: COLORS.gold, color: COLORS.goldDark, borderRadius: 12, padding: "9px 18px", fontWeight: 700, fontSize: 14, zIndex: 60, whiteSpace: "nowrap", maxWidth: "90vw", overflow: "hidden", textOverflow: "ellipsis" }}>
      {toast}
    </div>
  );
}
