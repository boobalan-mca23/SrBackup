import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Mastergoldsmith from "./Mastergoldsmith";
import Masteradditems from "./Masteradditems";
import MasterSeal from "./MasterSeal";
import AllUser from "../Allusers/AllUsers";
import { FiLogOut, FiArrowLeft } from "react-icons/fi";

const Master = () => {
  const [activeTab, setActiveTab] = useState("goldsmith");
  const navigate = useNavigate();

  const userRole           = localStorage.getItem("userRole");
  const goldsmithAccess    =  localStorage.getItem('goldsmithAccess');
  const itemMasterAccess   =      localStorage.getItem('itemMasterAccess');
  const sealMasterAccess   =    localStorage.getItem('sealMasterAccess');
  const canCreateUser      =  localStorage.getItem('canCreateUser');
  console.log('canCreateUser:', canCreateUser);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");  
    localStorage.removeItem('goldsmithAccess');
    localStorage.removeItem('itemMasterAccess');
    localStorage.removeItem('sealMasterAccess');
    localStorage.removeItem('canCreateUser');

    navigate("/");
  };

  const handleBack = () => {
    navigate("/goldsmith");
  };

  const getNavButtonStyle = (tab) => ({
    ...navButton,
    color: activeTab === tab ? "#fff" : "rgba(255, 255, 255, 0.8)",
    fontWeight: activeTab === tab ? 600 : 500,
    "::after": {
      ...(activeTab === tab
        ? {
            content: '""',
            position: "absolute",
            bottom: "0",
            left: "16px",
            right: "16px",
            height: "3px",
            backgroundColor: "#4dabf7",
            borderRadius: "3px 3px 0 0",
          }
        : {}),
    },
    ":hover": {
      color: "#fff",
      "::after": {
        ...(activeTab !== tab
          ? {
              content: '""',
              position: "absolute",
              bottom: "0",
              left: "16px",
              right: "16px",
              height: "3px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "3px 3px 0 0",
            }
          : {}),
      },
    },
  });

  return (
    <div style={containerStyle}>
      <div style={navContainer}>
        <div style={navLeft}>
          <button onClick={handleBack} 
           style={getNavButtonStyle("home")}
          >
           Home
          </button>
          
          {goldsmithAccess.toLocaleLowerCase() === "true" &&<button
            onClick={() => handleTabChange("goldsmith")}
            style={getNavButtonStyle("goldsmith")}
          >
            Goldsmith
          </button>}

          {itemMasterAccess.toLocaleLowerCase() === "true" &&<button
            onClick={() => handleTabChange("items")}
            style={getNavButtonStyle("items")}
          >
            Item Master
          </button>}
          {sealMasterAccess.toLocaleLowerCase() === "true" &&<button
            onClick={() => handleTabChange("seal")}
            style={getNavButtonStyle("seal")}
          >
            seal Master
          </button>}
          {(userRole === "admin" || canCreateUser.toLocaleLowerCase() === "true") ? (
                  <button
                    onClick={() => handleTabChange("allusers")}
                    style={getNavButtonStyle("allusers")}
                  >
                    All Users
                  </button>
                ):""}  

        </div>

        <button onClick={handleLogout} style={logoutButton}>
          <FiLogOut size={18} />
          <span style={{ marginLeft: "8px" }}>Logout</span>
        </button>
      </div>

      <div style={contentContainer}>
        {activeTab === "goldsmith" &&<Mastergoldsmith />}
        {activeTab === "items" &&<Masteradditems />}
        {activeTab === "seal" && <MasterSeal/>}
        {activeTab === "allusers" && <AllUser />}
      </div>

    </div>
  );
};


const containerStyle = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const navContainer = {
  backgroundColor: "#2c3e50",
  background: "linear-gradient(135deg, #2c3e50 0%, #1a2530 100%)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
  color: "#fff",
  height: "64px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};

const navLeft = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  height: "100%",
};

const backButton = {
  fontSize:"20px",
  backgroundColor: "transparent",
  border: "none",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px",
  borderRadius: "6px",
  marginRight: "12px",
  transition: "all 0.3s ease",
  ":hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "scale(1.1)",
  },
};

const navButton = {
  cursor: "pointer",
  fontSize: "1.05rem", 
  fontWeight: 600, 
  padding: "10px 18px",
  transition: "all 0.3s ease",
  height: "100%",
  display: "flex",
  alignItems: "center",
  backgroundColor: "transparent",
  border: "none",
  position: "relative",
  margin: "0 4px",
};


const logoutButton = {
  backgroundColor: "transparent",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "white",
  borderRadius: "6px",
  padding: "10px 18px", 
  fontSize: "1rem", 
  fontWeight: 600, 
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease",
  ":hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
};


const contentContainer = {
  flex: 1,
  padding: "24px",
  backgroundColor: "#f8f9fa",
};

export default Master;
