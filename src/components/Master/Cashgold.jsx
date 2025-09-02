
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Cashgold.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BACKEND_SERVER_URL } from "../../Config/Config";

function Cashgold() {
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [entries, setEntries] = useState([]);
  const [goldRate, setGoldRate] = useState(0);
  const [formData, setFormData] = useState({
    date: "",
    type: "Select",
    cashAmount: "",
    goldValue: "",
    touch: "",
    purity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };

    if (name === "goldValue" || name === "touch") {
      const goldValue = parseFloat(
        name === "goldValue" ? value : formData.goldValue
      );
      const touch = parseFloat(name === "touch" ? value : formData.touch);

      if (!isNaN(goldValue) && !isNaN(touch)) {
        updatedForm.purity = ((goldValue * touch) / 100).toFixed(3);
      } else {
        updatedForm.purity = "";
      }
    }

    setFormData(updatedForm);
  };


  useEffect(() => {
    if (formData.type === "Cash") {
      const cashAmount = parseFloat(formData.cashAmount);
      const rate = parseFloat(goldRate);
      if (!isNaN(cashAmount) && cashAmount > 0 && !isNaN(rate) && rate > 0) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          purity: (cashAmount / rate).toFixed(3),
        }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          purity: "",
        }));
      }
    }
  }, [formData.cashAmount, goldRate, formData.type]); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    let calculatedPurity = 0;
    if (formData.type === "Cash") {
    
      calculatedPurity = formData.purity;
    } else if (formData.type === "Gold") {
      calculatedPurity = formData.purity;
    }

    const payload = {
      date: formData.date,
      type: formData.type,
      cashAmount:
        formData.type === "Cash" ? parseFloat(formData.cashAmount) : null,
      goldValue:
        formData.type === "Gold" ? parseFloat(formData.goldValue) : null,
      touch: formData.type === "Gold" ? parseFloat(formData.touch) : null,
      purity: parseFloat(calculatedPurity), 
      goldRate: formData.type === "Cash" ? parseFloat(goldRate) : null,
    };

    try {
      await axios.post(`${BACKEND_SERVER_URL}/api/entries`, payload);
      toast.success("Value added successfully!");
      fetchEntries();
      setFormData({
        date: "",
        type: "Select", 
        cashAmount: "",
        goldValue: "",
        touch: "",
        purity: "",
      });
      setGoldRate(0);
      setShowFormPopup(false);
    } catch (error) {
      toast.error("Failed to add entry. Please try again.");
      console.error("Error submitting entry:", error);
    }
  };

  const calculateTotalPurity = () => {
    return entries
      .reduce((total, entry) => {
        return total + parseFloat(entry.purity || 0);
      }, 0)
      .toFixed(3);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/entries`);
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  return (
    <div className="cashgold-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Cash/Gold</h2>
      <button className="add-btn" onClick={() => setShowFormPopup(true)}>
        Add Cash or Gold
      </button>

      {showFormPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Enter Cash or Gold Details</h3>
            <button
              className="close-btn"
              onClick={() => setShowFormPopup(false)}
            >
              ×
            </button>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Select">Select</option>
                  <option value="Cash">Cash</option>
                  <option value="Gold">Gold</option>
                </select>
              </div>

              {formData.type === "Cash" && (
                <>
                  <div className="form-group">
                    <label>Cash Amount:</label>
                    <input
                      type="number"
                      name="cashAmount"
                      value={formData.cashAmount}
                      onChange={handleChange}
                      required
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gold Rate (per gram):</label>
                    <input
                      type="number"
                      value={goldRate}
                      onChange={(e) => setGoldRate(e.target.value)}
                      required
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Purity (g):</label>
                    <input
                      type="number"
                      name="purity"
                      value={formData.purity}
                      readOnly
                      className="read-only"
                    />
                  </div>
                </>
              )}

              {formData.type === "Gold" && (
                <>
                  <div className="form-group">
                    <label>Gold Value (g):</label>
                    <input
                      type="number"
                      name="goldValue"
                      value={formData.goldValue}
                      onChange={handleChange}
                      required
                      step="0.001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Touch (%):</label>
                    <input
                      type="number"
                      name="touch"
                      value={formData.touch}
                      onChange={handleChange}
                      required
                      step="0.01"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Purity (g):</label>
                    <input
                      type="number"
                      name="purity"
                      value={formData.purity}
                      readOnly
                      className="read-only"
                    />
                  </div>
                </>
              )}

              <div className="button-group">
                <button type="submit" className="submit-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="entries-section">
        <h3>Entries</h3>
        {entries.length === 0 ? (
          <p>No entries yet. </p>
        ) : (
          <>
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount/Value</th>
                  <th>Touch/Rate</th>
                  <th>Purity (g)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>{index + 1}</td>
                    <td>{new Date(entry.date).toLocaleDateString("en-IN")}</td>
                    <td>{entry.type}</td>
                    <td>
                      {entry.type === "Cash"
                        ? `₹${parseFloat(entry.cashAmount).toFixed(2)}`
                        : `${parseFloat(entry.goldValue).toFixed(3)}g`}
                    </td>
                    <td>
                      {entry.type === "Cash"
                        ? `₹${parseFloat(entry.goldRate).toFixed(2)}/g`
                        : `${entry.touch}%`}
                    </td>
                    <td>{parseFloat(entry.purity).toFixed(3)}</td>
                  </tr>
                ))}

                <tr className="totals-row">
                  <td colSpan="5">
                    <strong>Total Purity</strong>
                  </td>
                  <td>
                    <strong>{calculateTotalPurity()}g</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default Cashgold;