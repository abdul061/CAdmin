import React, { useState } from "react";
import "../css/Login.css"; // ✅ Normal CSS
import Lottie from "lottie-react";
import Lo from "./fr.json";
import Animation from "./Animation - 1751695867757.json";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${process.env.Backend_URL}api/login`, {
        email,
        password,
      });

      if (res.data.success) {
        alert("✅ Login successful!");
        navigate("/"); // redirect after login
      } else {
        setError(res.data.message || "❌ Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Ocean background animation */}
      <div className="ocean-scene">
        <Lottie
          animationData={Animation}
          className="boat"
          background="transparent"
          speed="1.5"
          loop
          autoPlay
        />
        <div className="wave-container">
          <svg className="wave" viewBox="0 0 1440 320">
            <path
              fill="#a78bfa"
              fillOpacity={1}
              d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,144C1200,117,1320,75,1380,53.3L1440,32L1440,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      {/* Auth Card */}
      <div className="auth-wrapper">
        <div className="auth-card animate__animated animate__fadeInUp">
          <div className="auth-left">
            <Lottie
              animationData={Lo}
              background="transparent"
              speed={1}
              loop
              autoPlay
            />
          </div>

          <div className="auth-right">
            <div>
              <h3
                className="text-center mb-4"
                style={{ fontWeight: 700, color: "#7c3aed" }}
              >
                👋 Welcome to{" "}
                <span
                  style={{
                    color: "#4c1d95",
                    textDecoration: "underline dotted",
                  }}
                >
                  EduAttend
                </span>
              </h3>
              <p className="text-center mb-4">
                A Smarter Way to Track &amp; Manage Student Attendance
              </p>

              {/* ✅ Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Email</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label>Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock" />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <div className="text-danger mb-2">{error}</div>}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "⏳ Logging in..." : "Login"}
                </button>
              </form>

              <div className="text-center mt-3">
                New here? <span className="toggle-link">Sign up now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
