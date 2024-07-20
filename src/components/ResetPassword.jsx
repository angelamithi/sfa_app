// ResetPassword.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './resetPassword.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    try {
      const response = await fetch("/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Password reset successfully");
        setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
      } else {
        console.error("Password reset failed:", data.message);
      }
    } catch (error) {
      console.error("Error during password reset:", error);
    }
  };

  return (
    <div className="Reset-Password">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <label>New Password:</label>
        <input type="password" value={newPassword} onChange={handleNewPasswordChange} required />
        <label>Confirm Password:</label>
        <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
        <button type="submit">Reset Password</button>
      </form>
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default ResetPassword;
