// src/components/About.jsx
import React from 'react';
import './nav.css';

function Benefit() {
  return (
    <section className="benefits-section py-5">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="display-4 fw-bold mb-3">Why Choose LesNote AI?</h2>
      <p className="lead text-muted">Experience the future of lesson planning with our AI-powered platform</p>
    </div>

    <div className="row g-4">
      {/* Benefit 1 */}
      <div className="col-md-6 col-lg-4">
        <div className="benefit-card">
          <div className="benefit-icon">
            <i className="bi bi-clock-history"></i>
          </div>
          <h3>Time-Saving</h3>
          <p>Generate comprehensive lesson notes in minutes instead of hours. Focus more on teaching, less on planning.</p>
        </div>
      </div>

      {/* Benefit 2 */}
      <div className="col-md-6 col-lg-4">
        <div className="benefit-card">
          <div className="benefit-icon">
            <i className="bi bi-stars"></i>
          </div>
          <h3>High Quality Content</h3>
          <p>AI-generated content aligned with educational standards and best practices in teaching.</p>
        </div>
      </div>

      {/* Benefit 3 */}
      <div className="col-md-6 col-lg-4">
        <div className="benefit-card">
          <div className="benefit-icon">
            <i className="bi bi-palette"></i>
          </div>
          <h3>Customizable Templates</h3>
          <p>Choose from a variety of professional templates or customize them to match your teaching style.</p>
        </div>
      </div>

      {/* Benefit 4 */}
      <div className="col-md-6 col-lg-4">
        <div className="benefit-card">
          <div className="benefit-icon">
            <i className="bi bi-lightning-charge"></i>
          </div>
          <h3>Easy to Use</h3>
          <p>Simple, intuitive interface that makes lesson planning effortless for any teacher.</p>
        </div>
      </div>

      {/* Benefit 5 */}
      <div className="col-md-6 col-lg-4">
        <div className="benefit-card">
          <div className="benefit-icon">
            <i className="bi bi-diagram-3"></i>
          </div>
          <h3>Smart Organization</h3>
          <p>Keep all your lesson notes organized and easily accessible in one place.</p>
        </div>
      </div>

      {/* Benefit 6 */}
      <div className="col-md-6 col-lg-4">
        <div className="benefit-card">
          <div className="benefit-icon">
            <i className="bi bi-cloud-arrow-down"></i>
          </div>
          <h3>Easy Export</h3>
          <p>Export your lesson notes in multiple formats for easy sharing and printing.</p>
        </div>
      </div>
    </div>

    {/* Stats Section */}
    <div className="row mt-5 g-4 stats-container">
      <div className="col-md-4 text-center">
        <div className="stat-item">
          <h3 className="stat-number">2000+</h3>
          <p className="stat-label">Teachers Using LesNote</p>
        </div>
      </div>
      <div className="col-md-4 text-center">
        <div className="stat-item">
          <h3 className="stat-number">20,000+</h3>
          <p className="stat-label">Lessons Generated</p>
        </div>
      </div>
      <div className="col-md-4 text-center">
        <div className="stat-item">
          <h3 className="stat-number">98%</h3>
          <p className="stat-label">Satisfaction Rate</p>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}

export default Benefit;