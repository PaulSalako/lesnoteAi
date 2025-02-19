// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer py-5">
      <div className="container">
        <div className="row gy-4">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand mb-4">
              <h3 className="text-white mb-3">LesNote</h3>
              <p className="text-light">Learn better, Faster, and smarter using LesNote!</p>
            </div>
            <div className="social-links">
              <a href="#" className="me-3"><i className="bi bi-facebook"></i></a>
              <a href="#" className="me-3"><i className="bi bi-twitter"></i></a>
              <a href="#" className="me-3"><i className="bi bi-linkedin"></i></a>
              <a href="#"><i className="bi bi-instagram"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="text-white mb-3">Quick Links</h5>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-lg-2 col-md-6">
            <h5 className="text-white mb-3">Legal</h5>
            <ul className="footer-links">
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/support">Support</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-lg-4 col-md-6">
            <h5 className="text-white mb-3">Contact Us</h5>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-envelope me-2"></i>
                support@lesnote.com
              </li>
              <li>
                <i className="bi bi-telephone me-2"></i>
                +1 (234) 567-8900
              </li>
              <li>
                <i className="bi bi-geo-alt me-2"></i>
                123 AI Street, Tech City
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom text-center mt-5 pt-4 border-top border-light">
          <p className="mb-0 text-light">
            © {new Date().getFullYear()} LesNote. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;