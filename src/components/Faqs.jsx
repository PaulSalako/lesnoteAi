// src/components/About.jsx
import React from 'react';
import './nav.css';
import './styles/FAQ.css';

function Faqs() {
  return (
   
    <section className="faq-section py-5" id="faq">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="display-4 fw-bold mb-3">Frequently Asked Questions</h2>
      <p className="lead text-muted">Everything you need to know about LesNote AI</p>
    </div>

    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="accordion" id="faqAccordion">
          {/* Question 1 */}
          <div className="accordion-item">
            <h3 className="accordion-header">
              <button 
                className="accordion-button" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#faq1"
              >
                How does the token system work?
              </button>
            </h3>
            <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Each lesson note generation consumes one token. New users receive 20 free tokens upon registration. 
                You can purchase additional tokens in bundles of 100 (plus 10 bonus) or 500 (plus 50 bonus). 
                Tokens never expire and can be used at any time.
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="accordion-item">
            <h3 className="accordion-header">
              <button 
                className="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#faq2"
              >
                What subjects and grade levels are supported?
              </button>
            </h3>
            <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                LesNote AI supports all major subjects for secondary school levels, including Mathematics, 
                Sciences, Languages, Social Studies, and more. Our AI is trained on curriculum standards 
                and can adapt content for different grade levels.
              </div>
            </div>
          </div>

          {/* Question 3 */}
          <div className="accordion-item">
            <h3 className="accordion-header">
              <button 
                className="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#faq3"
              >
                Can I customize the generated lesson notes?
              </button>
            </h3>
            <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Yes! After generation, you can fully edit and customize your lesson notes. You can modify content, 
                add your own materials, change formatting, and save templates for future use. The platform also 
                allows you to export in various formats.
              </div>
            </div>
          </div>

          {/* Question 4 */}
          <div className="accordion-item">
            <h3 className="accordion-header">
              <button 
                className="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#faq4"
              >
                Is my data secure and private?
              </button>
            </h3>
            <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                We take data security seriously. All your lesson notes and personal information are encrypted 
                and stored securely. We never share your data with third parties, and you retain full ownership 
                of all content you generate.
              </div>
            </div>
          </div>

          {/* Question 5 */}
          <div className="accordion-item">
            <h3 className="accordion-header">
              <button 
                className="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#faq5"
              >
                What if I need help or support?
              </button>
            </h3>
            <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Our support team is available via email and chat during business hours. Premium users get 
                priority support. We also have a comprehensive help center with tutorials, guides, and 
                best practices for using LesNote AI effectively.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

  );
}

export default Faqs;