import React, { useState, useRef } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { FiLogOut, FiChevronDown, FiChevronUp } from "react-icons/fi";
import logo from '../../Assets/srlogo.png'

const Navbar = () => {
  const navigate = useNavigate();
  const [showReports, setShowReports] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [activeReport, setActiveReport] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const reportsRef = useRef(null);
const location = useLocation();
const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem('goldsmithAccess');
    localStorage.removeItem('itemMasterAccess');
    localStorage.removeItem('sealMasterAccess');
    localStorage.removeItem('canCreateUser');
    window.location.href = "/";
  };

  const handleLinkClick = (path) => {
    setActiveLink(path);
    setShowReports(false);
  };

  const handleReportClick = (path) => {
    setActiveReport(path);
    handleLinkClick(path);
  };

  const toggleReports = (e) => {
    e.stopPropagation();
    setShowReports(!showReports);
  };

  
  const getNavLinkStyle = (path) => ({
  ...navLink,
  color: currentPath === path ? "#fff" : "rgba(199, 196, 196, 0.8)",
  fontWeight: currentPath === path ? 700 : 500,
 
});


  const getReportItemStyle = (path) => ({
    ...dropdownItem,
    backgroundColor:
      activeReport === path
        ? "#f1f3f5"
        : hoveredItem === path
        ? "#f8f9fa"
        : "#fff",
    fontWeight: activeReport === path ? 600 : 400,
    transform: hoveredItem === path ? "translateX(2px)" : "translateX(0)",
  });

  return (
    <div style={navContainer} >
      <div style={navLeft}>
         
 
        <div style={logoContainer}>
          <img src={logo} alt="logoImg" style={logoImg} ></img>
          <span style={logoText}>SR JWELLERY</span>
        </div>

        {["Master","Goldsmith","JobCardReport"].map(
          (label) => {
            const path = `/${label.replace(/\s+/g, "").toLowerCase()}`;
            return (
              <a
                key={label}
                href={path}
                style={getNavLinkStyle(path)}
                onClick={() => handleLinkClick(path)}
                onMouseEnter={() => setHoveredItem(path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {label}
              </a>
            );
          }
        )}

        {/* <div
          ref={reportsRef}
          style={{
            ...navLink,
            backgroundColor:
              hoveredItem === "reports"
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            color: "rgba(255, 255, 255, 0.8)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            position: "relative",
            cursor: "pointer",
          }}
          onClick={toggleReports}
          onMouseEnter={() => {
            setHoveredItem("reports");
            setShowReports(true);
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            setTimeout(() => setShowReports(false), 300);
          }}
        >
          Reports{" "}
          {showReports ? (
            <FiChevronUp size={16} />
          ) : (
            <FiChevronDown size={16} />
          )}
          {showReports && (
            <div
              style={dropdownMenu}
              onMouseEnter={() => setShowReports(true)}
              onMouseLeave={() => setShowReports(false)}
            >
              {[
               ["Jobcard Report", "/jobcardddReport"],
               ].map(([name, path]) => (
                <a
                  key={path}
                  href={path}
                  style={getReportItemStyle(path)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleReportClick(path);
                    navigate(path);
                  }}
                  onMouseEnter={() => setHoveredItem(path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {name}
                  {activeReport === path && (
                    <span style={selectedIndicator}>✓</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div> */}
      </div>

      <div style={navRight}>
     
        <button
          onClick={handleLogout}
          style={{
            ...logoutButton,
            transform:
              hoveredItem === "logout" ? "translateY(-1px)" : "translateY(0)",
            boxShadow:
              hoveredItem === "logout" ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
          }}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <FiLogOut size={18} />
          <span style={{ marginLeft: "8px" }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

const navContainer = {
  background: "linear-gradient(135deg, #2c3e50 0%, #1a2530 100%)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
  color: "#fff",
  position: "fixed",    
  top: 0,                
  left: 0,
  right: 0,
  height: "64px",
  zIndex: 1000,          
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const logoImg={
  width:"50px",
  height:"50px",
  marginRight:"12px"
}
const logoContainer = {
  marginRight: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent:"space-around"
};

const logoText = {
  fontSize: "1.25rem",
  fontWeight: "600",
  background: "linear-gradient(90deg, #fff, #a5d8ff)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const navLeft = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  height: "100%",
  position: "relative",
};

const navLink = {
  cursor: "pointer",
  fontSize: "1.15rem",
  fontWeight:"600",
  textDecoration: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  transition: "all 0.2s ease",
  height: "100%",
  display: "flex",
  alignItems: "center",
};

const navRight = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const logoutButton = {
  backgroundColor: "transparent",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "white",
  borderRadius: "6px",
  padding: "8px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  transition: "all 0.2s ease",
};

const dropdownMenu = {
  position: "absolute",
  top: "100%",
  left: "0",
  backgroundColor: "#fff",
  color: "#333",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  overflow: "hidden",
  zIndex: 999,
  minWidth: "220px",
  border: "1px solid rgba(0, 0, 0, 0.05)",
};

const dropdownItem = {
  padding: "12px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  textDecoration: "none",
  color: "#495057",
  fontSize: "1rem",
  fontWeight:"500",
  transition: "all 0.2s ease",
};

const selectedIndicator = {
  marginLeft: "8px",
  color: "#4dabf7",
  fontWeight: "bold",
};

export default Navbar;
