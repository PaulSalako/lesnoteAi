// src/components/Footer.jsx
// import React from 'react';
import './styles/Footer.css';

function Footer() {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row">
          {/* Brand Column */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="footer-brand">
              <h3>LesNote</h3>
              <p>Learn better, Faster, and smarter using LesNote!</p>
              <div className="social-links mt-3">
                <a href="https://www.facebook.com/profile.php?id=61573763812396&mibextid=ZbWKwL" target='_blank' className="social-link">
                  <i className="bi bi-facebook"></i>
                </a>
                {/* <a href="#" className="social-link">
                  <i className="bi bi-twitter"></i>
                </a> */}
                <a href="https://www.instagram.com/lesnoteai?igsh=MmsxODdwanloZG0x" target='_blank' className="social-link">
                  <i className="bi bi-instagram"></i>
                </a>
                {/* <a href="#" className="social-link">
                  <i className="bi bi-linkedin"></i>
                </a> */}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-sm-6 col-lg-2 mb-4 mb-lg-0">
            <h5>Quick Links</h5>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-sm-6 col-lg-2 mb-4 mb-lg-0">
            <h5>Legal</h5>
            <ul className="footer-links">
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Support</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-lg-4">
            <h5>Contact Us</h5>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-envelope"></i>
                <span>lesnoteai@gmail.com</span>
              </li>
              {/* <li>
                <i className="bi bi-telephone"></i>
                <span>+1 (234) 567-8900</span>
              </li> */}
              {/* <li>
                <i className="bi bi-geo-alt"></i>
                <span>123 AI Street, Tech City</span>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <hr />
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0">
                © {new Date().getFullYear()} LesNote. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="footer-bottom-links">
                {/* <a href="/privacy">Privacy</a> */}
                {/* <a href="/terms">Terms</a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;