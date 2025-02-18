import "./BenefitAi.css";
import {
  FaChalkboardTeacher,
  FaFileAlt,
  FaUniversity,
  FaGraduationCap,
} from "react-icons/fa";

const BenefitAI = () => {
  const audiences = [
    { icon: <FaChalkboardTeacher />, title: "Teachers" },
    { icon: <FaFileAlt />, title: "Curriculum Developers" },
    { icon: <FaUniversity />, title: "Educational Centers" },
    { icon: <FaGraduationCap />, title: "Student Teachers" },
  ];

  return (
    <section className="target-audience">
      <h2>Who can Benefit from Lestnote Ai?</h2>
      <p className="b-p">
        Our platform helps to support teachers in creating effective lesson
        plans
      </p>
      <div className="audience-grid">
        {audiences.map((audience, index) => (
          <div key={index} className="audience-card">
            <h3>
              {audience.icon} {audience.title}
            </h3>
            <p>
              Teachers in Junior and Senior secondary schools looking to quickly
              create lesson notes faster and still be productive.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitAI;
