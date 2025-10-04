import React, { useState, useRef } from "react";
import "../css/As.css";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

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
    if (
      student.rollNo &&
      student.name &&
      student.dob &&
      student.course &&
      student.internship.length > 0 &&
      student.duration
    ) {
      try {
        const studentData = {
          ...student,
          dob: formatDOB(student.dob),
        };

        await axios.post(`${process.env.REACT_APP_BACKEND_URL}api/addstudent`, studentData);

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

  const qrLink = generatedQR
    ? `https://coderzacademy.com/#/internship/${generatedQR.rollNo}-${generatedQR.dob}`
    : "";

  const handleCopy = () => {
    if (!qrLink) return;
    navigator.clipboard.writeText(qrLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!generatedQR) return;
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
            <input
              type="text"
              name="rollNo"
              placeholder="Roll Number"
              value={student.rollNo}
              onChange={handleChange}
            />
            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={student.name}
              onChange={handleChange}
            />
            <input
              type="date"
              name="dob"
              value={student.dob}
              onChange={handleChange}
            />

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
                    <input
                      type="checkbox"
                      value={detail}
                      checked={student.internship.includes(detail)}
                      onChange={handleCheckboxChange}
                    />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}

            <input
              type="text"
              name="duration"
              placeholder="Duration (e.g., 3 Months)"
              value={student.duration}
              onChange={handleChange}
            />

            <button onClick={handleSubmit} className="submit-btn">Add Student</button>
          </div>
        </div>
      </div>

      {generatedQR && (
        <div
          className="qr-section"
          ref={qrRef}
          style={{
            textAlign: "center",
            marginTop: "40px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#f9f9f9",
            maxWidth: "350px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Generated QR Code for {generatedQR.name}</h3>
          <QRCodeCanvas
            value={qrLink}
            size={220}
            style={{ margin: "10px 0", borderRadius: "12px" }}
          />
          <div className="copy-box" style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              readOnly
              value={qrLink}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }}
            />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={handleCopy} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#4a3aff", color: "#fff", border: "none" }}>
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button onClick={handleDownload} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#00b894", color: "#fff", border: "none" }}>
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
