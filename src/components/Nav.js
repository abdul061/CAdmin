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

  // 🔹 For all students
  const [allStudents, setAllStudents] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  // 🔹 Format date to DD-MM-YYYY for sending to backend
  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // 🔹 Format ISO date to DD-MM-YYYY for display
  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // 🔹 Search student by Roll No & DOB
  const handleSearch = async () => {
    if (!rollNo.trim() || !dob.trim()) {
      setError("Please enter both Roll No and DOB.");
      setStudentData(null);
      return;
    }

    try {
      const formattedDob = formatDateForBackend(dob);
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}api/searchStudent`,
        { rollNo, dob: formattedDob }
      );

      setStudentData(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching student:", err);
      if (err.response && err.response.status === 404) {
        setError("No student found with this Roll No and DOB.");
      } else {
        setError("Failed to fetch data. Check backend.");
      }
      setStudentData(null);
    }
  };

  // 🔹 Fetch all students
  const fetchAllStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}api/getAllStudents`);
      setAllStudents(res.data);
    } catch (err) {
      console.error("Error fetching all students:", err);
      setAllStudents([]);
    }
  };

  // 🔹 Group students by course
  const groupByCourse = (students) => {
    return students.reduce((acc, student) => {
      if (!acc[student.course]) acc[student.course] = [];
      acc[student.course].push(student);
      return acc;
    }, {});
  };

  return (
    <div className="intern-container">
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="logo">Admin-Panel</h2>

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

        <div
          className={`sidebar-item ${active === "all" ? "active" : ""}`}
          onClick={() => {
            setActive("all");
            fetchAllStudents();
            setIsOpen(false);
          }}
        >
          All Students
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

            {error && <p style={{ color: "red" }}>{error}</p>}

            {studentData && (
              <div className="student-box">
                <h4>Student Details</h4>
                <p><b>Roll No:</b> {studentData.rollNo}</p>
                <p><b>Name:</b> {studentData.name}</p>
                <p><b>DOB:</b> {formatDisplayDate(studentData.dob)}</p>
                <p><b>Course:</b> {studentData.course}</p>
                <p><b>Duration:</b> {studentData.duration} months</p>

                <h4>Modules:</h4>
                <ol>
                  {studentData.internship?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* 🔹 Add Student Section */}
        {active === "add" && <AddStd />}

        {/* 🔹 All Students Section */}
{active === "all" && (
  <div className="all-students-container">
    <h3>All Students</h3>
    {allStudents.length === 0 ? (
      <p>No students found.</p>
    ) : (
      Object.entries(groupByCourse(allStudents)).map(([course, students]) => (
        <div key={course} className="course-block">
          <h4 style={{ color: "#4a3aff" }}>{course}</h4>
          <div className="student-list">
            {students.map((stu) => (
              <div key={stu._id} className="student-card">
                <p><b>Roll No:</b> {stu.rollNo}</p>
                <p><b>Name:</b> {stu.name}</p>
                <p><b>DOB:</b> {formatDisplayDate(stu.dob)}</p>
              </div>
            ))}
          </div>
        </div>
      ))
    )}
  </div>
)}

      </div>
    </div>
  );
}
