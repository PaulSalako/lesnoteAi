// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import './styles/Navbar.css';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
      
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white fixed-top ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        {/* Logo with Image */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img 
            src="/lesnotelogo1.png" 
            alt="LesNote Logo" 
            height="40" 
            className="me-2"
          />
          <span className="fs-3 fw-bold text-primary">LesNoteAI</span>
        </a>

        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a 
                className="nav-link"
                onClick={() => scrollToSection('about')}
                role="button"
              >
                About
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link"
                onClick={() => scrollToSection('how-it-works')}
                role="button"
              >
                How It Works
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link"
                onClick={() => scrollToSection('pricing')}
                role="button"
              >
                Pricing
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link"
                onClick={() => scrollToSection('testimonials')}
                role="button"
              >
                Testimonials
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link"
                onClick={() => scrollToSection('contact')}
                role="button"
              >
                Contact
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link"
                onClick={() => scrollToSection('faq')}
                role="button"
              >
                FAQs
              </a>
            </li>
            <li className="nav-item ms-lg-2">
              <a href="/login" className="btn btn-success rounded-pill px-4">Login</a>
            </li>
            <li className="nav-item ms-lg-2">
              <a className="btn btn-primary rounded-pill px-4" href="/sign-up">
                Get Started
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;