import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { store, retrieve } from "./Encryption";
import './login.css';

const Login = ({ setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const credentials = {
      email: email,
      password: password,
      role: selectedRole,
    };

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Login failed");
        }
      })
      .then((result) => {
        store(result);
        localStorage.setItem("accessToken", JSON.stringify(result.access_token));
        localStorage.setItem("userRole", selectedRole); // Store user role
        setUserRole(selectedRole); // Update role in parent component

        switch (selectedRole) {
          case "Administrator":
            navigate("/admin_dashboard");
            break;
          case "Coordinator":
            navigate("/coordinator_dashboard");
            break;
          case "Volunteer":
            navigate("/volunteer_dashboard");
            break;
          default:
            console.error("Unknown role:", selectedRole);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError('Invalid Email or Password: Please try again.');
      });
  };

  return (
    <div className="main_container_login" style={{ marginRight:"20px" }} >
      <nav className="main-nav">
        <div className="nav-logo">
          <a href="https://smefoundersassociation.com/">SFA Website</a>
        </div>
        <ul className="nav-list-login">
          <Link className="link" to={"/"}>Home</Link>
        </ul>
      </nav>
      <div className="ui_column_login">
        <h1 style={{ textAlign: "center" , marginBottom:"30px"}}>Login Form</h1>    
        <div className="ui_centered_card " style={{ width: "400px" }}>
          <div className="loginForm_container" style={{ margin: "20px", textAlign: "center" }}>
            <form onSubmit={handleSubmit}>
              <div className="form_group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={handleEmailChange} 
                  required 
                />
              </div>
              <div className="form_group">
                <label>Password:</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={handlePasswordChange} 
                  required 
                />
              </div>
              <div className="form_group">
                <label>Role:</label>
                <select value={selectedRole} onChange={handleRoleChange} required>
                  <option value="">Select Role</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
              <button type="submit" className="login_button">Login</button>
            </form>
            {error && <p className="error_message">{error}</p>}
            <div className="forgot_password">
              <Link to="/reset_password">Forgot Password?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
