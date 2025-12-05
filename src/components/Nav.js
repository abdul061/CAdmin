import React, { useState } from "react";
import "../css/Nav.css";
import AddStd from "../pages/AddStudent";
import Greet from "../pages/Welcome";
import axios from "axios";

/**
 * Nav.jsx — All Students with inline card edit
 * Click "Edit" on a card -> card becomes an inline form (name, course, modules, duration)
 * Save -> PUT to /api/updatestudent and update UI
 */

export default function Nav() {
  const [active, setActive] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Search state
  const [rollNo, setRollNo] = useState("");
  const [dob, setDob] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState("");

  // 🔹 All students
  const [allStudents, setAllStudents] = useState([]);

  // 🔹 Inline edit states
  const [editingId, setEditingId] = useState(null); // which _id is editing
  const [inlineForm, setInlineForm] = useState({
    name: "",
    course: "",
    duration: "",
    internship: [],
    dob: "",
  });

  const coursesWithDetails = {
    "Certification in Computer Application With Programming": ["MS Office", "C", "C++", "Python", "Java", "Projects"],
    "Certification in Computer Application With Tally Prime": ["MS Office", "Tally Prime"],
    "Certification in Advance Python Programming": ["C", "C++", "Python","Projects"],
    "Certification in Advance JAVA Programming": ["C", "C++", "JAVA","Projects"],
    "Certification in FULLSTACK": ["HTML", "CSS", "JavaScript","React" , "Node.JS", "MongoDB", "GIT"],
    "Certification in FRONTEND": ["HTML", "CSS", "JavaScript","React" ],
    "Certification in BACKEND": ["Node.JS", "Express.JS", "MongoDB","GIT" ],
    "Certification inTally Prime": ["Tally Prime", "MS Excel" , "Projects"],
    "Certification in MS Office": ["MS Word", "MS Excel", "MS Powerpoint"],
    "Certification in MS Excel": ["MS Excel"]
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  // 🔹 Format date for backend (DD-MM-YYYY) - converts yyyy-mm-dd -> dd-mm-yyyy
  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // 🔹 Format for display DD-MM-YYYY
  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return isoDate;
    }
  };

  // Helper: produce yyyy-mm-dd from stu.dob (works if dob is Date object or ISO string)
  const getDobYYYYMMDD = (dobValue) => {
    if (!dobValue) return "";
    try {
      const d = new Date(dobValue);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // 🔹 Search student
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
      setAllStudents(res.data || []);
    } catch (err) {
      console.error("Error fetching all students:", err);
      setAllStudents([]);
    }
  };

  // 🔹 Delete student
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}api/deletestudent/${id}`);
      alert("Student deleted successfully!");
      setAllStudents((prev) => prev.filter((stu) => stu._id !== id));
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Failed to delete student. Try again!");
    }
  };

  // 🔹 Group by course
  const groupByCourse = (students) => {
    return students.reduce((acc, student) => {
      if (!acc[student.course]) acc[student.course] = [];
      acc[student.course].push(student);
      return acc;
    }, {});
  };

  // ----- Inline edit handlers -----
  const startInlineEdit = (stu) => {
    setEditingId(stu._id);
    setInlineForm({
      name: stu.name || "",
      course: stu.course || "",
      duration: String(stu.duration || ""),
      internship: Array.isArray(stu.internship) ? [...stu.internship] : (coursesWithDetails[stu.course] || []),
      dob: getDobYYYYMMDD(stu.dob), // for backend identification if needed
    });
    // scroll card into view (optional)
    setTimeout(() => {
      const el = document.getElementById(`card-${stu._id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setInlineForm({ name: "", course: "", duration: "", internship: [], dob: "" });
  };

  const handleInlineChange = (e) => {
    const { name, value } = e.target;
    if (name === "course") {
      setInlineForm((p) => ({ ...p, course: value, internship: coursesWithDetails[value] ? [...coursesWithDetails[value]] : [] }));
    } else {
      setInlineForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleInlineCheckbox = (e) => {
    const { value, checked } = e.target;
    setInlineForm((p) => ({
      ...p,
      internship: checked ? [...p.internship, value] : p.internship.filter((i) => i !== value),
    }));
  };

  const saveInlineEdit = async () => {
    if (!inlineForm.name.trim() || !inlineForm.course || !inlineForm.duration) {
      alert("Please fill name, course and duration.");
      return;
    }

    try {
      const studentObj = allStudents.find((s) => s._id === editingId);
      if (!studentObj) {
        alert("Student not found in list.");
        cancelInlineEdit();
        return;
      }

      const payload = {
        rollNo: studentObj.rollNo,
        dob: inlineForm.dob, // yyyy-mm-dd
        name: inlineForm.name,
        course: inlineForm.course,
        duration: inlineForm.duration,
        internship: inlineForm.internship,
      };

      await axios.put(`${process.env.REACT_APP_BACKEND_URL}api/updatestudent`, payload);

      // Update UI locally
      setAllStudents((prev) =>
        prev.map((s) =>
          s._id === editingId
            ? { ...s, name: payload.name, course: payload.course, duration: payload.duration, internship: payload.internship }
            : s
        )
      );

      alert("Student updated successfully!");
      cancelInlineEdit();
    } catch (err) {
      console.error("Error saving student:", err.response?.data || err.message);
      alert("Failed to update student. Try again.");
    }
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

        <div className="sidebar-item logout" onClick={handleLogout}>
          Logout
        </div>
      </div>

      {/* Toggle Button (Mobile) */}
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* Main Content */}
      <div className="main-content">
        {active === "" && <Greet />}

        {/* 🔹 Search Student */}
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

        {/* 🔹 Add Student */}
        {active === "add" && <AddStd />}

        {/* 🔹 All Students */}
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
                    {students.map((stu) => {
                      const isEditing = editingId === stu._id;
                      return (
                        <div id={`card-${stu._id}`} key={stu._id} className="student-card" style={{ position: "relative" }}>
                          {!isEditing ? (
                            <>
                              <p><b>Roll No:</b> {stu.rollNo}</p>
                              <p><b>Name:</b> {stu.name}</p>
                              <p><b>DOB:</b> {formatDisplayDate(stu.dob)}</p>

                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button
                                  onClick={() => handleDelete(stu._id)}
                                  style={{
                                    backgroundColor: "#ff4d4d",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Delete
                                </button>

                                <button
                                  onClick={() => startInlineEdit(stu)}
                                  style={{
                                    backgroundColor: "#ffb142",
                                    color: "#000",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            </>
                          ) : (
                            /* Inline edit form */
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <input
                                name="name"
                                value={inlineForm.name}
                                onChange={handleInlineChange}
                                placeholder="Student Name"
                                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                              />

                              <select
                                name="course"
                                value={inlineForm.course}
                                onChange={handleInlineChange}
                                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                              >
                                <option value="">Select Course</option>
                                {Object.keys(coursesWithDetails).map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>

                              {inlineForm.course && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                  {coursesWithDetails[inlineForm.course].map((mod) => (
                                    <label key={mod} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                                      <input
                                        type="checkbox"
                                        value={mod}
                                        checked={inlineForm.internship.includes(mod)}
                                        onChange={handleInlineCheckbox}
                                      />
                                      <span>{mod}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              <select
                                name="duration"
                                value={inlineForm.duration}
                                onChange={handleInlineChange}
                                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                              >
                                <option value="">Select Duration</option>
                                {[...Array(12)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1} Month{i + 1 > 1 ? "s" : ""}</option>
                                ))}
                              </select>

                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  onClick={saveInlineEdit}
                                  style={{ padding: "8px 12px", background: "#4a3aff", color: "#fff", border: "none", borderRadius: 6 }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelInlineEdit}
                                  style={{ padding: "8px 12px", background: "#ddd", color: "#000", border: "none", borderRadius: 6 }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
