// src/components/Hero.jsx
import React, { useEffect } from 'react';
import Typed from 'typed.js';
// import './nav.css';
import './styles/Hero.css';

function Hero() {
  // Add typing animation effect
  useEffect(() => {
    const typed = new Typed('#typing-text', {
      strings: [
        'Create Lesson Notes in Minutes.',
        'Save Hours of Planning Time.',
        'Generate Creative Teaching Ideas.',
        'Make Learning More Engaging.'
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      loop: true
    });

    // Cleanup on component unmount
    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <header className="hero-section">
      <div className="container">
        <div className="row min-vh-100 align-items-center">
          <div className="col-lg-6 text-center text-lg-start">
            <h1 className="welcome-text mb-3">
              Welcome to <span className="text-primary">LesNoteAI</span>
            </h1>
            
            <div className="typing-container mb-4">
              <span id="typing-text" className="display-5 fw-bold"></span>
            </div>
            
            <p className="lead mb-5">
              Free to use. Easy to try. Just ask Lesnote
            </p>
            
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <a href="/sign-up" className="btn btn-primary btn-lg rounded-pill px-5 d-flex align-items-center justify-content-center gap-2">
                Get Started
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"/>
                </svg>
              </a>
              {/* <button className="btn btn-outline-secondary btn-lg rounded-pill px-5">
                Download App
              </button> */}
            </div>
          </div>
          
          <div className="col-lg-6 d-none d-lg-block">
            <div className="hero-image-container">
              <img 
                src="/landing_page_image.png" 
                alt="AI Teaching Assistant" 
                className="img-fluid floating-animation"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="decoration-circle-1"></div>
      <div className="decoration-circle-2"></div>
      <div className="decoration-dots"></div>
    </header>
  );
}

export default Hero;