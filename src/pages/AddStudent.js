import React, { useState, useRef } from "react";
import "../css/As.css";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { Copy } from "lucide-react";

export default function AddStudent() {
  const [student, setStudent] = useState({
    rollNo: "",
    name: "",
    dob: "",
    course: "",
    internship: [],
    duration: "",
  });

  const [generatedQR, setGeneratedQR] = useState(null);
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const textMessage = "This is the message that can be copied!";

  const coursesWithDetails = {
    "Full Stack Development": ["HTML / CSS", "JavaScript", "React", "Node.js", "Database (SQL/MongoDB)", "Projects"],
    "Python Programming": ["Python Basics", "OOP in Python", "Django / Flask", "APIs", "Projects"],
    "Java Development": ["Core Java", "OOP & Collections", "Spring Boot", "JPA / Hibernate", "Projects"],
    "Data Science": ["Python for Data Science", "Pandas / Numpy", "Machine Learning", "Deep Learning", "Projects"],
    "React Frontend": ["HTML / CSS", "JavaScript (ES6+)", "React Basics", "React Hooks", "Redux / State Management", "Projects"],
    "C++ Programming": ["C++ Basics", "OOP Concepts", "STL", "DSA", "Projects"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "course") {
      setStudent({
        ...student,
        course: value,
        internship: value ? coursesWithDetails[value] : [],
      });
    } else {
      setStudent({
        ...student,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setStudent({
        ...student,
        internship: [...student.internship, value],
      });
    } else {
      setStudent({
        ...student,
        internship: student.internship.filter((item) => item !== value),
      });
    }
  };
const formatDOB = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
  const handleSubmit = async () => {
    if (student.rollNo && student.name && student.dob && student.course && student.internship.length > 0 && student.duration) {
      try {
        // ✅ Convert DOB to Date object before sending
      const studentData = {
        ...student,
        dob: formatDOB(student.dob),
      };
        console.log(studentData)
        const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}api/addstudent`, studentData);

        setGeneratedQR(studentData);
        alert("Student added successfully!");

        setStudent({
          rollNo: "",
          name: "",
          dob: "",
          course: "",
          internship: [],
          duration: "",
        });
      } catch (err) {
        console.error("Error saving student:", err);
        alert("Failed to add student. Try again!");
      }
    } else {
      alert("Please fill all fields!");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(textMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${generatedQR.rollNo}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1>Admin - Add Student Details</h1>

        <div className="form-grid">
          <div className="form-column">
            <input type="text" name="rollNo" placeholder="Roll Number" value={student.rollNo} onChange={handleChange} />
            <input type="text" name="name" placeholder="Student Name" value={student.name} onChange={handleChange} />
            <input type="date" name="dob" value={student.dob} onChange={handleChange} />

            <select name="course" value={student.course} onChange={handleChange}>
              <option value="">Select Course</option>
              {Object.keys(coursesWithDetails).map((course, idx) => (
                <option key={idx} value={course}>{course}</option>
              ))}
            </select>

            {student.course && (
              <div className="checklist">
                <label><b>Course Details:</b></label>
                {coursesWithDetails[student.course].map((detail, idx) => (
                  <div key={idx}>
                    <input type="checkbox" value={detail} checked={student.internship.includes(detail)} onChange={handleCheckboxChange} />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}

            <input type="text" name="duration" placeholder="Duration (e.g., 3 Months)" value={student.duration} onChange={handleChange} />
            <button onClick={handleSubmit} className="submit-btn">Add Student</button>
          </div>
        </div>
      </div>

      {generatedQR && (
        <div className="qr-section" ref={qrRef} style={{ textAlign: "center", marginTop: "30px" }}>
          <div className="copy-box">
            <textarea readOnly value={textMessage}></textarea>
            <button onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
          </div>
          <h3>Generated QR Code for {generatedQR.name}:</h3>
          <QRCodeCanvas value={`https://coderzacademy.com/student/${generatedQR.rollNo}`} size={200} />
          <br /><br />
          <button onClick={handleDownload}>Download QR</button>
        </div>
      )}
    </div>
  );
}
