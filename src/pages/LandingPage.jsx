// src/pages/LandingPage.jsx
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Typed from 'typed.js';
import './LandingPage.css';

function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      {/* About Section */}
      <section className="about-section py-5 mt-5">
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




      {/* How It Works Section */}
<section className="how-it-works-section py-5">
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





{/* Benefits Section */}
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
          <h3 className="stat-number">3000+</h3>
          <p className="stat-label">Teachers Using LesNote</p>
        </div>
      </div>
      <div className="col-md-4 text-center">
        <div className="stat-item">
          <h3 className="stat-number">50,000+</h3>
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




{/* Testimonials Section */}
<section className="testimonials-section py-5">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="display-4 fw-bold mb-3">What Teachers Say</h2>
      <p className="lead text-muted">Trusted by educators worldwide</p>
    </div>

    <div className="row">
      <div className="col-lg-8 mx-auto">
        {/* Testimonial Carousel */}
        <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {/* Testimonial 1 */}
            <div className="carousel-item active">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p className="testimonial-text">
                    LesNote AI has completely transformed how I prepare my lessons. 
                    What used to take hours now takes minutes, and the quality is consistently excellent. 
                    It's like having a professional teaching assistant available 24/7.
                  </p>
                  <div className="testimonial-author">
                    <img src="/api/placeholder/60/60" alt="Sarah Johnson" className="author-image" />
                    <div className="author-info">
                      <h5 className="author-name">Sarah Johnson</h5>
                      <p className="author-title">High School Science Teacher</p>
                    </div>
                  </div>
                  <div className="rating">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="carousel-item">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p className="testimonial-text">
                    The templates are incredibly well-designed, and the AI understands 
                    exactly what teachers need. I've recommended LesNote to all my 
                    colleagues, and they love it just as much as I do.
                  </p>
                  <div className="testimonial-author">
                    <img src="/api/placeholder/60/60" alt="Michael Chen" className="author-image" />
                    <div className="author-info">
                      <h5 className="author-name">Michael Chen</h5>
                      <p className="author-title">Math Department Head</p>
                    </div>
                  </div>
                  <div className="rating">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="carousel-item">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p className="testimonial-text">
                    As a new teacher, LesNote AI has been invaluable. It helps me create 
                    professional lesson notes quickly, giving me more time to focus on 
                    my students' needs. The support team is also fantastic!
                  </p>
                  <div className="testimonial-author">
                    <img src="/api/placeholder/60/60" alt="Emily Rodriguez" className="author-image" />
                    <div className="author-info">
                      <h5 className="author-name">Emily Rodriguez</h5>
                      <p className="author-title">Elementary School Teacher</p>
                    </div>
                  </div>
                  <div className="rating">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="0" className="active" aria-current="true"></button>
            <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="1"></button>
            <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="2"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </section>




  {/* Pricing Section */}
<section className="pricing-section py-5" id="pricing">
  <div className="container">
    <div className="text-center mb-5">
      <h2 className="display-4 fw-bold mb-3">Simple, Token-Based Pricing</h2>
      <p className="lead text-muted">Choose the plan that works best for you</p>
    </div>

    <div className="row justify-content-center g-4">
      {/* Free Tier */}
      <div className="col-md-6 col-lg-4">
        <div className="pricing-card">
          <div className="pricing-header">
            <h3 className="pricing-title">Starter</h3>
            <div className="pricing-badge">Free</div>
          </div>
          
          <div className="pricing-body">
            <div className="token-amount">
              <span className="token-number">20</span>
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
      </div>

      {/* Basic Tier */}
      <div className="col-md-6 col-lg-4">
        <div className="pricing-card popular">
          <div className="pricing-header">
            <h3 className="pricing-title">Basic</h3>
            <div className="pricing-badge">Popular</div>
          </div>
          
          <div className="pricing-body">
            <div className="token-amount">
              <span className="token-number">110</span>
              <span className="token-label">Tokens</span>
              <span className="bonus-text">100 + 10 Bonus</span>
            </div>
            
            <ul className="pricing-features">
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                All Starter features
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Premium templates
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Priority AI generation
              </li>
              <li>
                <i className="bi bi-check-circle-fill text-success"></i>
                Priority support
              </li>
            </ul>

            <button className="btn btn-primary btn-lg w-100 rounded-pill">
              Buy Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Premium Tier */}
      <div className="col-md-6 col-lg-4">
        <div className="pricing-card">
          <div className="pricing-header">
            <h3 className="pricing-title">Premium</h3>
            <div className="pricing-badge">Best Value</div>
          </div>
          
          <div className="pricing-body">
            <div className="token-amount">
              <span className="token-number">550</span>
              <span className="token-label">Tokens</span>
              <span className="bonus-text">500 + 50 Bonus</span>
            </div>
            
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
              Buy Tokens
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Additional Information */}
    <div className="row mt-5">
      <div className="col-lg-8 mx-auto">
        <div className="pricing-info text-center">
          <h4 className="mb-4">Why Choose Our Token System?</h4>
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <div className="pricing-info-item">
              <i className="bi bi-wallet2"></i>
              <span>Pay as you go</span>
            </div>
            <div className="pricing-info-item">
              <i className="bi bi-arrow-repeat"></i>
              <span>Tokens never expire</span>
            </div>
            <div className="pricing-info-item">
              <i className="bi bi-shield-check"></i>
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>



{/* FAQ Section */}
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



{/* Support Section */}
<section className="support-section py-5 bg-light" id="support">
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
    <div className="row mt-5">
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
    </div>
  </div>
</section>

{/* <Footer /> */}
    </div>
  );
}

export default LandingPage;