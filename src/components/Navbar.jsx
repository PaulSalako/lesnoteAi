import { Link } from "react-router-dom";
import ThemeButton from "../ui/ThemeButton";
import "./nav.css";

function Navbar() {
  return (
    <nav>
      <div className="nav-container">
        <h3>LesNote</h3>
        <ul>
          <li>About</li>
          <li>FAQs</li>
          <li>Blogs</li>
          <li>Contact us</li>
          <li>How it works</li>
        </ul>

        <div className="nav-right">
          <ThemeButton />

          <Link to="/sign-up">Try for free</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
