import React, { useState, useRef } from "react";
import "../css/As.css";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";   // ✅ import axios

export default function AddStudent() {
  
  const [student, setStudent] = useState({
    rollNo: "",
    name: "",
    dob: "",
    course: "",
    internship: "",
    duration: "",
    email: "",
    phone: "",
    address: "",
    mentor: "",
    remarks: "",
  });

  const [generatedQR, setGeneratedQR] = useState(null);
  const qrRef = useRef(null);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      student.rollNo &&
      student.name &&
      student.dob &&
      student.course &&
      student.internship &&
      student.duration &&
      student.email &&
      student.phone &&
      student.address &&
      student.mentor &&
      student.remarks
    ) {
      try {
        // ✅ Send student data to backend
        console.log("Posting to:", `${process.env.REACT_APP_BACKEND_URL}/api/addstudent`);

        console.log(student)
        const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}api/addstudent`, student);
        console.log("Response:", res.data);

        setGeneratedQR(student); // store student to generate QR
        alert("Student added successfully!");

        setStudent({
          rollNo: "",
          name: "",
          dob: "",
          course: "",
          internship: "",
          duration: "",
          email: "",
          phone: "",
          address: "",
          mentor: "",
          remarks: "",
        });
      } catch (err) {
        console.error("Error saving student:", err);
        alert("Failed to add student. Try again!");
        console.log("Posting to:", `${process.env.REACT_APP_BACKEND_URL}/api/addstudent`);
      }
    } else {
      alert("Please fill all fields!");
    }
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

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

        {/* ✅ Two column form */}
        <div className="form-grid">
          <div className="form-column">
            <input type="text" name="rollNo" placeholder="Roll Number" value={student.rollNo} onChange={handleChange} />
            <input type="text" name="name" placeholder="Student Name" value={student.name} onChange={handleChange} />
            <input type="date" name="dob" value={student.dob} onChange={handleChange} />
            <input type="text" name="course" placeholder="Course" value={student.course} onChange={handleChange} />
            <input type="text" name="internship" placeholder="Course Details" value={student.internship} onChange={handleChange} />
            <input type="text" name="duration" placeholder="Duration (e.g., 3 Months)" value={student.duration} onChange={handleChange} />
          </div>

          <div className="form-column">
            <input type="email" name="email" placeholder="Email" value={student.email} onChange={handleChange} />
            <input type="text" name="phone" placeholder="Phone Number" value={student.phone} onChange={handleChange} />
            <input type="text" name="address" placeholder="Address" value={student.address} onChange={handleChange} />
            <input type="text" name="mentor" placeholder="Mentor Name" value={student.mentor} onChange={handleChange} />
            <input type="text" name="remarks" placeholder="Remarks" value={student.remarks} onChange={handleChange} />
            <button onClick={handleSubmit} className="submit-btn">Add Student</button>
          </div>
        </div>
      </div>

      {/* ✅ Show QR only after adding student */}
      {generatedQR && (
        <div className="qr-section" ref={qrRef} style={{ textAlign: "center", marginTop: "30px" }}>
          <h3>Generated QR Code for {generatedQR.name}:</h3>
          <QRCodeCanvas value={`https://coderzacademy.com/student/${generatedQR.rollNo}`} size={200} />
          <br /><br />
          <button onClick={handleDownload}>Download QR</button>
        </div>
      )}
    </div>
  );
}
