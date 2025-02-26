// src/components/About.jsx
import React from 'react';
// import './nav.css';
import './styles/Testimonials.css';

function Testimonials() {
  return (
    <section className="testimonials-section py-5" id="testimonials">
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
                    <img src="/src/components/UserImg/Paul_pass.jpg" alt="Paul Salako" className="author-image" />
                    <div className="author-info">
                      <h5 className="author-name">Paul Salako</h5>
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
  );
}

export default Testimonials;