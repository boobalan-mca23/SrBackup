// import React, { useState } from "react";
// // import logo from "../../Assets/logo.png";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Home.css";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { BACKEND_SERVER_URL } from "../../Config/Config";

// function Register() {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post(`${BACKEND_SERVER_URL}/api/auth/register`, {
//         username,
//         password,
//       });

//       setSuccess("Registration successful! Please log in.");
//       setTimeout(() => navigate("/"), 2000);
//     } catch (err) {
//       setError("Registration failed. Try again.");
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="home-container">
//       {/* <div className="left-side">
//         <img src={logo} alt="Logo" className="large-logo" />{" "}
//       </div> */}
//       <div className="right-side">
//         <div className="login-box">
//           <div className="login-header">
//             <i className="fas fa-user-circle"></i>
//             <h2>Register</h2>
//           </div>
//           <form onSubmit={handleRegister}>
//             <div className="input-group">
//               <label>Username</label>
//               <input
//                 type="text"
//                 placeholder="Enter your username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="input-group">
//               <label>Password</label>
//               <div className="password-input-container">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <span
//                   className="password-toggle-icon"
//                   onClick={togglePasswordVisibility}
//                 >
//                   {showPassword ? <FaEye /> : <FaEyeSlash />}
//                 </span>
//               </div>
//             </div>
//             {error && <div className="error-message">{error}</div>}
//             {success && <div className="success-message">{success}</div>}
//             <button type="submit" className="submit-btn">
//               Register
//             </button>
//           </form>
//           <div className="login-footer">
//             <a href="/">Already have an account? Login</a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Register;
