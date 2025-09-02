import React from "react";
import { useNavigate } from "react-router-dom";
import srlogo from '../../Assets/srlogo.png'
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="luxury-container">
      <div className="logo-frame">
        <div className="logo-inner">
          <img src={srlogo} alt="Logo" className="brand-logo" />
        </div>
      </div>

      <div className="content-wrapper">
        <h1 className="brand-name">SR Jewelry</h1>
        <p className="brand-tagline">
          Timeless elegance, crafted to perfection
        </p>
        <button
          className="discover-btn"
          onClick={() => {
            console.log("Clicked Login");
            navigate("/goldsmith");
          }}
        >
          LOGIN
        </button>
      </div>
    </div>
  );
}

export default Home;







