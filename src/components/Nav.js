import React, { useState } from "react";
import "../css/Nav.css";
import AddStd from "../pages/AddStudent";
import Greet from "../pages/Welcome";
import axios from "axios";

export default function Nav() {
  const [active, setActive] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 For search
  const [rollNo, setRollNo] = useState("");
  const [dob, setDob] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  // 🔹 Search student by Roll No & DOB
  const handleSearch = async () => {
    if (!rollNo.trim() || !dob.trim()) {
      setError("Please enter both Roll No and DOB.");
      setStudentData(null);
      return;
    }
    try {
      const res = await axios.get(`${process.env.Backend_URL}/api/searchstudent`, {
        params: { rollNo, dob }, // send both as query string
      });

      setStudentData(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching student:", err);
      if (err.response && err.response.status === 404) {
        setError("No student found with this Roll No and DOB.");
      } else {
        setError("Failed to fetch data. Check backend.");
      }
    }
  };

  return (
    <div className="intern-container">
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="logo">E-Certificate</h2>

        <div
          className={`sidebar-item ${active === "" ? "active" : ""}`}
          onClick={() => {
            setActive("");
            setIsOpen(false);
          }}
        >
          Home
        </div>

        <div
          className={`sidebar-item ${active === "search" ? "active" : ""}`}
          onClick={() => {
            setActive("search");
            setIsOpen(false);
          }}
        >
          Search
        </div>

        <div
          className={`sidebar-item ${active === "add" ? "active" : ""}`}
          onClick={() => {
            setActive("add");
            setIsOpen(false);
          }}
        >
          Add
        </div>

        {/* Logout */}
        <div className="sidebar-item logout" onClick={handleLogout}>
          Logout
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* Main Content */}
      <div className="main-content">
        {active === "" && <Greet />}

        {/* 🔹 Search Student Section */}
        {active === "search" && (
          <div className="form-container">
            <h3>Search Student</h3>
            <input
              type="text"
              placeholder="Enter Roll No"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {/* Error Message */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Student Info in Separate Box */}
            {studentData && (
              <div className="student-box">
                <h4>Student Details</h4>
                <p><b>Roll No:</b> {studentData.rollNo}</p>
                <p><b>Name:</b> {studentData.name}</p>
                <p><b>DOB:</b> {studentData.dob}</p>
                <p><b>Course:</b> {studentData.course}</p>
                <p><b>Internship:</b> {studentData.internship}</p>
                <p><b>Duration:</b> {studentData.duration}</p>
                <p><b>Email:</b> {studentData.email}</p>
                <p><b>Phone:</b> {studentData.phone}</p>
                <p><b>Address:</b> {studentData.address}</p>
                <p><b>Mentor:</b> {studentData.mentor}</p>
                <p><b>Remarks:</b> {studentData.remarks}</p>
              </div>
            )}
          </div>
        )}

        {active === "add" && <AddStd />}
      </div>
    </div>
  );
}
