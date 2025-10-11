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
    "Certification in Computer Application With Programming": ["MS Office", "C", "C++", "Python", "Java", "Projects"],
    "Certification in Computer Application With Tally Prime": ["MS Office", "Tally Prime"],
    "Certification in Advance Python Programming": ["C", "C++", "Python","Projects"],
    "Certification inTally Prime": ["Tally Prime", "MS Excel" , "Projects"],
    "Certification in MS Office": ["MS Word", "MS Excel", "MS Powerpoint"]
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

  // Convert DOB to YYYY-MM-DD (safe for MongoDB Date)
  const formatDOBForDB = (date) => {
    if (!date) return null;
    const [year, month, day] = date.split("-");
    return new Date(`${year}-${month}-${day}`);
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
          dob: formatDOBForDB(student.dob), // Convert to Date object
        };

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
        console.error("Error saving student:", err.response?.data || err.message);
        if (err.response?.data?.error) {
          alert(err.response.data.error);
        } else {
          alert("Failed to add student. Try again!");
        }
      }
    } else {
      alert("Please fill all fields!");
    }
  };

  const qrLink = generatedQR
    ? `https://coderzacademy.com/#/internship/${generatedQR.rollNo}-${generatedQR.dob.toISOString().split("T")[0]}`
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

            {/* Month select for duration */}
            <select name="duration" value={student.duration} onChange={handleChange}>
              <option value="">Select Duration (Months)</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1} Month{i + 1 > 1 ? "s" : ""}</option>
              ))}
            </select>

            <button onClick={handleSubmit} className="submit-btn">Add Student</button>
          </div>
        </div>
      </div>

      {generatedQR && (
        <div className="qr-section" ref={qrRef} style={{ textAlign: "center", marginTop: "40px", padding: "20px", border: "1px solid #ddd", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", backgroundColor: "#f9f9f9", maxWidth: "350px", marginLeft: "auto", marginRight: "auto" }}>
          <h3 style={{ marginBottom: "10px" }}>Generated QR Code for {generatedQR.name}</h3>
          <QRCodeCanvas value={qrLink} size={220} style={{ margin: "10px 0", borderRadius: "12px" }} />
          <div className="copy-box" style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" readOnly value={qrLink} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={handleCopy} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#4a3aff", color: "#fff", border: "none" }}>{copied ? "Copied!" : "Copy Link"}</button>
              <button onClick={handleDownload} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#00b894", color: "#fff", border: "none" }}>Download QR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
