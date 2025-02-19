// src/components/Navbar.jsx
import React from 'react';
import './nav.css';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top">
      <div className="container">
        {/* Logo Container */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img 
            src="/lesnotelogo1.png" 
            alt="LesNote AI Logo" 
            className="me-2"
            height="40"
          />
          <span className="fs-3 fw-bold text-primary">LesNoteAI</span>
        </a>

        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#features">Features</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#about">About</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#pricing">Pricing</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/login">Login</a>
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