
import React, { useState, useEffect } from "react";
import "./masterjewelstock.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Masterjewelstock = () => {
  const [formData, setFormData] = useState({
    jewelName: "",
    weight: "",
    stoneWeight: "",
    touch: "",
    finalWeight: "",
    purityValue: "",
  });

  const [entries, setEntries] = useState([]);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [totalPurity, setTotalPurity] = useState(0);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${BACKEND_SERVER_URL}/api/jewel-stock`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      const data = await response.json();
      setEntries(data);
      calculateTotalPurity(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching entries.");
    }
  };

  const calculateTotalPurity = (entries) => {
    const total = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.purityValue || 0),
      0
    );
    setTotalPurity(total.toFixed(3));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    const weight = parseFloat(updatedData.weight) || 0;
    const stoneWeight = parseFloat(updatedData.stoneWeight) || 0;
    const finalWeight = weight - stoneWeight;
    updatedData.finalWeight = finalWeight.toFixed(3);

    const touch = parseFloat(updatedData.touch);
    updatedData.purityValue =
      finalWeight && touch ? ((finalWeight * touch) / 100).toFixed(3) : "";

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_SERVER_URL}/api/jewel-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save entry");

      const newEntry = await response.json();
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      calculateTotalPurity(updatedEntries);
      resetForm();
      setShowFormPopup(false);
      toast.success("Stock added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error saving entry.");
    }
  };

  const resetForm = () => {
    setFormData({
      jewelName: "",
      weight: "",
      stoneWeight: "",
      touch: "",
      finalWeight: "",
      purityValue: "",
    });
  };

  return (
    <div className="master-jewel-stock">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Jewel Stock</h2>
      <button className="add-btn" onClick={() => setShowFormPopup(true)}>
        Add Jewel Stock
      </button>

      {showFormPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Enter Jewel Stock Details</h3>
            <button
              className="close-btn"
              onClick={() => setShowFormPopup(false)}
            >
              ×
            </button>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Jewel Name:</label>
                <input
                  type="text"
                  name="jewelName"
                  value={formData.jewelName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Weight (grams):</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stone Weight (grams):</label>
                <input
                  type="number"
                  name="stoneWeight"
                  value={formData.stoneWeight}
                  onChange={handleChange}
                  step="any"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Final Weight (grams):</label>
                <input
                  type="number"
                  name="finalWeight"
                  value={formData.finalWeight}
                  readOnly
                  className="read-only"
                />
              </div>
              <div className="form-group">
                <label>Touch (%):</label>
                <input
                  type="number"
                  name="touch"
                  value={formData.touch}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="form-group">
                <label>Purity Value (grams):</label>
                <input
                  type="number"
                  name="purityValue"
                  value={formData.purityValue}
                  readOnly
                  className="read-only"
                />
              </div>
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
        <h3>Jewel Stock Entries</h3>
        {entries.length === 0 ? (
          <p>No entries yet. Please add some jewel stock entries.</p>
        ) : (
          <>
            <table className="entries-table">
              <thead>
                <tr>
                  <th>SI. No.</th>
                  <th>Jewel Name</th>
                  <th>Weight (g)</th>
                  <th>Stone Wt. (g)</th>
                  <th>Final Wt. (g)</th>
                  <th>Touch (%)</th>
                  <th>Purity (g)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>{index + 1}</td>
                    <td>{entry.jewelName}</td>
                    <td>{entry.weight}</td>
                    <td>{entry.stoneWeight}</td>
                    <td>{entry.finalWeight}</td>
                    <td>{entry.touch}</td>
                    <td>{entry.purityValue}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Total Purity:
                  </td>
                  <td style={{ fontWeight: "bold" }}>{totalPurity}</td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Masterjewelstock;
