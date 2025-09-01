import React from "react";
import "../css/Welcome.css";

export default function Welcome() {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1>Welcome, Admin 👋</h1>
        <p>We’re glad to have you here. Please proceed to manage student details.</p>
        <button className="welcome-btn">Go to Dashboard</button>
      </div>
    </div>
  );
}
