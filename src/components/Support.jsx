// src/components/About.jsx
// import React from 'react';
// import './nav.css';
import './styles/Support.css';

function Support() {
  return (
    <section className="support-section py-5 bg-light" id="contact">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="display-4 fw-bold mb-3">We're Here to Help</h2>
      <p className="lead text-muted">Get the support you need, when you need it</p>
    </div>

    <div className="row g-4">
      {/* Help Center Card */}
      <div className="col-md-6 col-lg-4">
        <div className="support-card">
          <div className="support-icon">
            <i className="bi bi-book"></i>
          </div>
          <h3>Help Center</h3>
          <p>Browse our comprehensive guides, tutorials, and FAQs to get the most out of LesNote AI.</p>
          <ul className="support-features">
            <li>
              <i className="bi bi-check2-circle"></i>
              Step-by-step tutorials
            </li>
            <li>
              <i className="bi bi-check2-circle"></i>
              Best practices guides
            </li>
            <li>
              <i className="bi bi-check2-circle"></i>
              Video demonstrations
            </li>
          </ul>
          <a href="/help" className="btn btn-outline-primary rounded-pill px-4">
            Visit Help Center
          </a>
        </div>
      </div>

      {/* Email Support Card */}
      <div className="col-md-6 col-lg-4">
        <div className="support-card">
          <div className="support-icon">
            <i className="bi bi-envelope"></i>
          </div>
          <h3>Email Support</h3>
          <p>Get in touch with our support team for personalized assistance with your questions.</p>
          <ul className="support-features">
            <li>
              <i className="bi bi-check2-circle"></i>
              24/7 email support
            </li>
            <li>
              <i className="bi bi-check2-circle"></i>
              Dedicated support team
            </li>
            <li>
              <i className="bi bi-check2-circle"></i>
              Quick response time
            </li>
          </ul>
          <a href="mailto:support@lesnote.ai" className="btn btn-outline-primary rounded-pill px-4">
            Email Us
          </a>
        </div>
      </div>

      {/* Live Chat Card */}
      <div className="col-md-6 col-lg-4">
        <div className="support-card">
          <div className="support-icon">
            <i className="bi bi-chat-dots"></i>
          </div>
          <h3>Live Chat</h3>
          <p>Connect with our support team in real-time for immediate assistance during business hours.</p>
          <ul className="support-features">
            <li>
              <i className="bi bi-check2-circle"></i>
              Real-time support
            </li>
            <li>
              <i className="bi bi-check2-circle"></i>
              Screen sharing
            </li>
            <li>
              <i className="bi bi-check2-circle"></i>
              Instant responses
            </li>
          </ul>
          <button className="btn btn-outline-primary rounded-pill px-4">
            Start Chat
          </button>
        </div>
      </div>
    </div>

    {/* Contact Information */}
    {/* <div className="row mt-5">
      <div className="col-lg-8 mx-auto">
        <div className="contact-info text-center">
          <h4 className="mb-4">Additional Contact Information</h4>
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <div className="contact-item">
              <i className="bi bi-telephone"></i>
              <span>+1 (234) 567-8900</span>
            </div>
            <div className="contact-item">
              <i className="bi bi-geo-alt"></i>
              <span>123 AI Street, Tech City</span>
            </div>
            <div className="contact-item">
              <i className="bi bi-clock"></i>
              <span>Mon-Fri: 9AM-6PM EST</span>
            </div>
          </div>
        </div>
      </div>
    </div> */}
  </div>
</section>
  );
}

export default Support;