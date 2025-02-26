// src/components/How_it_work.jsx
import React from 'react';
import './nav.css';
import './styles/How_it_work.css';

function How_it_work() {
  return (
    
<section className="how-it-works-section py-5" id="how-it-works">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="display-4 fw-bold text-white mb-4">How It Works</h2>
      <p className="lead text-white-50">Generate comprehensive lesson notes in four simple steps</p>
    </div>

    <div className="row g-4">
      {/* Step 1 */}
      <div className="col-md-6 col-lg-3">
        <div className="step-card h-100">
          <div className="step-number">1</div>
          <div className="icon-wrapper mb-4">
            <i className="bi bi-pencil-square"></i>
          </div>
          <h4 className="step-title">Enter your topic</h4>
          <p className="step-description">
            Simply input your lesson topic and grade level. Our AI understands educational context.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="col-md-6 col-lg-3">
        <div className="step-card h-100">
          <div className="step-number">2</div>
          <div className="icon-wrapper mb-4">
            <i className="bi bi-grid-3x3-gap"></i>
          </div>
          <h4 className="step-title">Choose template</h4>
          <p className="step-description">
            Select from our range of professional templates designed for educators.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="col-md-6 col-lg-3">
        <div className="step-card h-100">
          <div className="step-number">3</div>
          <div className="icon-wrapper mb-4">
            <i className="bi bi-cpu"></i>
          </div>
          <h4 className="step-title">AI Generation</h4>
          <p className="step-description">
            Our AI processes your input and generates comprehensive lesson notes instantly.
          </p>
        </div>
      </div>

      {/* Step 4 */}
      <div className="col-md-6 col-lg-3">
        <div className="step-card h-100">
          <div className="step-number">4</div>
          <div className="icon-wrapper mb-4">
            <i className="bi bi-download"></i>
          </div>
          <h4 className="step-title">Customize & Download</h4>
          <p className="step-description">
            Edit your generated notes and export them in your preferred format.
          </p>
        </div>
      </div>
    </div>

    {/* Action Button */}
    <div className="text-center mt-5">
      <a href="/sign-up" className="btn btn-light btn-lg rounded-pill px-5 py-3">
        Try it Now
        <i className="bi bi-arrow-right ms-2"></i>
      </a>
    </div>
  </div>
</section>
  );
}

export default How_it_work;