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

  // --- EDIT STATES ---
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: "", course: "", duration: "" });

  const coursesWithDetails = {
    "Certification in Computer Application With Programming": ["MS Office", "C", "C++", "Python", "Java", "Projects"],
    "Certification in Computer Application With Tally Prime": ["MS Office", "Tally Prime"],
    "Certification in Advance Python Programming": ["C", "C++", "Python","Projects"],
    "Certification in Advance JAVA Programming": ["C", "C++", "JAVA","Projects"],
    "Certification in FULLSTACK": ["HTML", "CSS", "JavaScript","React" , "Node.JS", "Express.JS", "JAVA" ,"SPRING BOOT", "Python","   Django","Flask", "MongoDB", "GIT"],
    "Certification in FRONTEND": ["HTML", "CSS", "JavaScript","React" ],
    "Certification in BACKEND": ["Node.JS", "Express.JS", "MongoDB","GIT" ],
    "Certification in Tally Prime": ["Tally Prime", "MS Excel" , "Projects"],
    "Certification in Data Analytics": ["Python","Power BI", "MS Excel","MySql", "R Language","Projects"],
    "Certification in MS Office": ["MS Word", "MS Excel", "MS Powerpoint"],
    "Certification in MS Excel": ["MS Excel"]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "course") {
      setStudent((prev) => ({
        ...prev,
        course: value,
        internship: value ? coursesWithDetails[value] : [],
      }));
    } else {
      setStudent((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setStudent((prev) => {
      if (checked) {
        return { ...prev, internship: [...prev.internship, value] };
      } else {
        return { ...prev, internship: prev.internship.filter((item) => item !== value) };
      }
    });
  };

  // Convert DOB (yyyy-mm-dd) to JS Date (safe for MongoDB)
  const formatDOBForDB = (date) => {
    if (!date) return null;
    // date is expected as "yyyy-mm-dd" from <input type="date">
    return new Date(date + "T00:00:00.000Z");
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
          dob: formatDOBForDB(student.dob), // Date object
        };

        await axios.post(`${process.env.REACT_APP_BACKEND_URL}api/addstudent`, studentData);

        // Keep dob as Date so toISOString works for QR link
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

  // QR link uses YYYY-MM-DD from the Date object
  const qrLink = generatedQR
    ? `https://coderzacademy.tech/#/internship/${generatedQR.rollNo}-${generatedQR.dob.toISOString().split("T")[0]}`
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

  // ----- EDIT HANDLERS -----
  const handleEditClick = () => {
    if (!generatedQR) return;
    setEditData({
      name: generatedQR.name || "",
      course: generatedQR.course || "",
      duration: generatedQR.duration || "",
    });
    setEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editData.name || !editData.course || !editData.duration) {
      alert("Please fill name, course, and duration.");
      return;
    }

    try {
      const payload = {
        rollNo: generatedQR.rollNo,
        dob: generatedQR.dob.toISOString().split("T")[0], // yyyy-mm-dd
        name: editData.name,
        course: editData.course,
        duration: editData.duration,
        internship: coursesWithDetails[editData.course] || generatedQR.internship || [],
      };

      // Update request — change endpoint if your backend uses different route
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}api/updatestudent`, payload);

      // Update UI
      setGeneratedQR((prev) => ({
        ...prev,
        name: payload.name,
        course: payload.course,
        duration: payload.duration,
        internship: payload.internship,
      }));

      setEditMode(false);
      alert("Student updated successfully!");
    } catch (err) {
      console.error("Error updating student:", err.response?.data || err.message);
      alert("Failed to update student. Try again.");
    }
  };
  const durationOptions = [
  { label: "10 Days", value: "10 Days" },
  { label: "15 Days", value: "15 Days" },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1} Month${i + 1 > 1 ? "s" : ""}`,
    value: `${i + 1} Month${i + 1 > 1 ? "s" : ""}`,
  })),
];

  const handleCancelEdit = () => {
    setEditMode(false);
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
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Generated QR Code for {generatedQR.name}</h3>
          <QRCodeCanvas value={qrLink} size={220} style={{ margin: "10px 0", borderRadius: "12px" }} />
          <div className="copy-box" style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" readOnly value={qrLink} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={handleCopy} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#4a3aff", color: "#fff", border: "none" }}>
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button onClick={handleDownload} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#00b894", color: "#fff", border: "none" }}>
                Download QR
              </button>
              {/* EDIT BUTTON */}
              <button onClick={handleEditClick} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#ffb142", color: "#000", border: "none" }}>
                Edit
              </button>
            </div>
          </div>

          {/* EDIT FORM (inline) */}
          {editMode && (
            <div style={{ marginTop: "18px", padding: "12px", borderTop: "1px solid #eee" }}>
              <h4>Edit Student</h4>

              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                placeholder="Student Name"
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
              />

              <select
                name="course"
                value={editData.course}
                onChange={handleEditChange}
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
              >
                <option value="">Select Course</option>
                {Object.keys(coursesWithDetails).map((course, idx) => (
                  <option key={idx} value={course}>{course}</option>
                ))}
              </select>

              <select
                name="duration"
                value={editData.duration}
                onChange={handleEditChange}
                style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
              >
                <option value="">Select Duration</option>
                {durationOptions.map((d, i) => (
                  <option key={i} value={d.value}>{d.label}</option>
                ))}
              </select>


              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button onClick={handleEditSubmit} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#4a3aff", color: "#fff", border: "none" }}>
                  Save
                </button>
                <button onClick={handleCancelEdit} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#dfe6e9", color: "#000", border: "none" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
