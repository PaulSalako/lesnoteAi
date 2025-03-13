// src/pages/LandingPage.jsx
import React, { useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Hero from '../Hero/Hero';
import About from '../AboutUs/About';
import How_it_work from '../How_it_work/How_it_work';
import Benefit from '../Benefits/Benefit';
import Testimonials from '../Testimonials/Testimonials';
import Pricing from '../Pricing/Pricing';
import Faqs from '../FAQ/Faqs';
import Support from '../Support/Support';
import Footer from '../Footer/Footer';
import BackToTop from '../BackToTop/BackToTop';
import './LandingPage.css';



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