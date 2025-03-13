// src/components/About.jsx
import React from 'react';
// import './nav.css';
import './About.css';

function About() {
  return (
    <section className="about-section py-5 mt-5" id="about">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="about-content">
              <h2 className="display-4 fw-bold mb-4">About LesNote AI</h2>
              <div className="mb-4">
                <p className="lead text-muted">
                  LesNote is an AI platform used to generate lesson notes for 
                  Secondary school teachers, making life easier and simpler for them.
                  We're revolutionizing how teachers prepare their lessons.
                </p>
                <p className="lead text-muted">
                  LesNote AI is an innovative platform that harnesses the power of 
                  artificial intelligence to help teachers create comprehensive lesson 
                  notes in seconds. Our mission is to give teachers more time to focus 
                  on what matters most – their students.
                </p>
                <p className="lead text-muted">
                  Founded by educators for educators, we understand the challenges of 
                  lesson planning and have developed a solution that makes it 
                  efficient, engaging, and enjoyable.
                </p>
              </div>
              <a href="/sign-up" className="btn btn-primary btn-lg rounded-pill px-5 py-3">
                Start Generating
                <i className="bi bi-arrow-right ms-2"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="position-relative">
              {/* Purple gradient background */}
              <div className="position-absolute top-0 start-0 w-100 h-100 
                              bg-primary opacity-10 rounded-4 transform-rotate-2"></div>
              
              {/* Main image */}
              <img 
                src="/mockup-laptop.png"
                alt="LesNote AI Platform Preview" 
                className="img-fluid rounded-4 shadow-lg position-relative"
              />
              
              {/* Floating elements */}
              <div className="position-absolute top-0 start-0 translate-middle-y p-3 
                              bg-white rounded-3 shadow-lg floating-element-1">
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock-history text-primary fs-4 me-2"></i>
                  <span className="fw-bold">Save 3+ hours per lesson</span>
                </div>
              </div>
              
              <div className="position-absolute bottom-0 end-0 translate-middle-y p-3 
                              bg-white rounded-3 shadow-lg floating-element-2">
                <div className="d-flex align-items-center">
                  <i className="bi bi-lightning-charge text-primary fs-4 me-2"></i>
                  <span className="fw-bold">AI-Powered Notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;