import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import BenefitAI from "../components/BenefitAI";
import "./LandingPage.css";
import TestimonialSlider from "../components/TestimonialSlider";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <div>
      <Navbar />
      <header>
        <h1>
          Create Lesson notes in minutes. <br /> Get productive and work faster
        </h1>
        <p className="h-p">Free to use. Easy to try. Just ask Lesnote</p>
        <div className="header-opts">
          <Link to="/sign-up">
            Start Now{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5"
              width="20px"
            >
              <path
                fill-rule="evenodd"
                d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          </Link>

          <span>Download the app</span>
        </div>
      </header>

      <section className="about">
        <div className="about-content">
          <h1>About Lesnote AI</h1>
          <p>
            Lesnote is an AI platform used to generate lesson notes for
            Secondary school teachers, making life easier and simpler for them.
            We're revolutionizing how teachers prepare their lessons.
          </p>
          <p>
            LesNote AI is an innovative platform that harnesses the power of
            artificial intelligence to help teachers create comprehensive lesson
            notes in seconds. Our mission is to give teachers more time to focus
            on what matters most – their students.
          </p>
          <p>
            Founded by educators for educators, we understand the challenges of
            lesson planning and have developed a solution that makes it
            efficient, engaging, and enjoyable.
          </p>
          <Link to="/sign-up" className="about-btn">
            Start Generating
          </Link>
        </div>
        <div className="about-image">
          <img src="/mockup-laptop.png" alt="Lesnote AI Platform" />
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <h3>1</h3>
            <h4>Enter your topic</h4>
            <p>Simply input your lesson topic and grade level.</p>
          </div>
          <div className="step-card">
            <h3>2</h3>
            <h4>Choose template</h4>
            <p>Select from our range of professional templates.</p>
          </div>
          <div className="step-card">
            <h3>3</h3>
            <h4>AI Generation</h4>
            <p>
              Our AI processes your input and generates comprehensive lesson
              notes instantly.
            </p>
          </div>
          <div className="step-card">
            <h3>4</h3>
            <h4>Customize and Download</h4>
            <p>
              Edit your generated notes and export them in your preferred
              format.
            </p>
          </div>
        </div>
      </section>
      <BenefitAI />
      <TestimonialSlider />
      <Footer />
    </div>
  );
}

export default LandingPage;
