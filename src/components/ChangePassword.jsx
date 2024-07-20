import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { retrieve } from "./Encryption";
// import './ChangePassword.css'



const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  

  const handleCurrentPasswordChange = (e) => {
    console.log(e.target.value);
    setCurrentPassword(e.target.value);
  };


  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
                    Authorization: "Bearer " + retrieve().access_token,
    
    },
        body: JSON.stringify({ newPassword: newPassword, currentPassword: currentPassword, confirmPassword: confirmPassword }),
      };

      const response = await fetch("https://hrs-iymg.onrender.com/change_password", requestOptions);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Password reset request failed:", errorData.message);

        return;
      }

      console.log("Password reset successfully");
      console.log(newPassword)
      navigate("/login"); // Redirect to login page or a success page
    } 
    catch (error) {
        setError("Error during password reset: " + error.message);
        console.error('Error during password reset:', error);
  };
}
    

    

  return (
    <div className="Reset-Passowrd"> 
      <nav className="main-nav">
          <div className="nav-logo">
            <a href="#">HRS.io</a>
          </div>
          <ul className="nav-list-login">
            <Link className="link" to={"/"}>Home</Link>
          </ul>
        </nav>
        <div className="Reset-password-Content">
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit} className="Reset-Passowrd-Form">
                
                <div className="Email-Card">
                <label>Current Password:</label>
                <input type="password" value={currentPassword} onChange={handleCurrentPasswordChange} required />
                </div>
                <div className="New-Password-Card">
                <label>New Password:</label>
                <input type="password" value={newPassword} onChange={handleNewPasswordChange} required />
                </div>
                <div className="Confirm-Password-Card">
                <label>Confirm Password:</label>
                <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
                </div>
                <button className="Reset-Password" type="submit">Reset Password</button>
                {error && <div className="error-message">{error}</div>}
            </form>
         </div>
    </div>
    
  );
};

export default ChangePassword;