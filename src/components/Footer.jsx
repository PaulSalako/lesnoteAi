import "./Footer.css";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-header">
          <h3>LesNote</h3>
          <span>Learn better , Faster , and smarteer using LesNote!</span>
        </div>
        <ul>
          <b>Quick Links</b>
          <li>Home</li>
          <li>Blog</li>
          <li>How It Workks</li>
        </ul>
        <ul>
          <b>Legal</b>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>
        <ul>
          <b>Contact Us</b>
          <li>Email:</li>
          <div></div>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
