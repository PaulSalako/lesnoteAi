// src/components/About.jsx
// import React from 'react';
// import './nav.css';
import './styles/Pricing.css';

function Pricing() {
  return (
   
    <section className="pricing-section py-5" id="pricing">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="display-4 fw-bold mb-3">Pricing</h2>
      <p className="lead text-muted">Choose the plan that works best for you</p>
    </div>

    <div className="row justify-content-center g-4">
      {/* Free Tier */}
      {/* <div className="col-md-6 col-lg-4">
        <div className="pricing-card">
          <div className="pricing-header">
            <h3 className="pricing-title">Starter</h3>
            <div className="pricing-badge">Free</div>
          </div>
          
          <div className="pricing-body">
            <div className="token-amount">
              <span className="token-number">100</span>
              <span className="token-label">Tokens</span>
            </div>
            
            <ul className="pricing-features">
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Free on registration
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Basic templates
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Standard AI generation
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Email support
              </li>
            </ul>

            <a href="/sign-up" className="btn btn-outline-primary btn-lg w-100 rounded-pill">
              Get Started Free
            </a>
          </div>
        </div>
      </div> */}

      {/* Basic Tier */}
      <div className="col-md-6 col-lg-4">
        <div className="pricing-card popular">
          <div className="pricing-header">
            <h3 className="pricing-title mb-4">Basic</h3>
            <div className="pricing-badge mb-4">Popular</div>
          </div>
          
          <div className="pricing-body text-center">
            {/* <div className="token-amount">
              <span className="token-number">110</span>
              <span className="token-label">Tokens</span>
              <span className="bonus-text">100 + 10 Bonus</span>
            </div> */}
            
            <ul className="pricing-features">
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                All Starter features
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Free on registration
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Standard AI generation
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Chat support
              </li>
            </ul>

            <button className="btn btn-primary btn-lg w-100 rounded-pill">
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Premium Tier */}
      <div className="col-md-6 col-lg-4">
        <div className="pricing-card">
          <div className="pricing-header">
            <h3 className="pricing-title mb-4">Premium</h3>
            <div className="pricing-badge mb-4">Best Value</div>
          </div>
          
          <div className="pricing-body">
            {/* <div className="token-amount">
              <span className="token-number">550</span>
              <span className="token-label">Tokens</span>
              <span className="bonus-text">500 + 50 Bonus</span>
            </div> */}
            
            <ul className="pricing-features">
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                All Basic features
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Custom templates
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Advanced AI features
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                24/7 Priority support
              </li>
            </ul>

            <button className="btn btn-primary btn-lg w-100 rounded-pill">
            Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>
    
  );
}

export default Pricing;