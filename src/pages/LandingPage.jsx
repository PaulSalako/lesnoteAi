// src/pages/LandingPage.jsx
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import How_it_work from '../components/How_it_work';
import Benefit from '../components/Benefit';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Faqs from '../components/Faqs';
import Support from '../components/Support';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import Typed from 'typed.js';
import './LandingPage.css';
import '../components/styles/Shared.css';


function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <About/>
      <How_it_work/>
      <Pricing/>
      <Testimonials/>
      <Support/>
      <Benefit/>
      <Faqs/>
      <Footer />
      <BackToTop />
    </div>
  );
}
export default LandingPage;