import { getState } from "../contexts/NoteContext";
import { AppContext } from "../contexts/NoteContext";
import "./ThemeBtn.css";
function ThemeButton() {
  const { theme, toggleTheme } = getState(AppContext);
  return (
    <button className="theme-btn" onClick={toggleTheme}>
      {theme === "light" ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeButton;
