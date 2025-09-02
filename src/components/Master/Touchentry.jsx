import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Masteradditems.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const Masteradditems = () => {
  const [touchInput, setTouchInput] = useState(""); 
  const [touchList, setTouchList] = useState([]);

  useEffect(() => {
    fetchTouch();
  }, []);

  const fetchTouch = async () => {
    try {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/master-touch`);
      setTouchList(res.data);
    } catch (err) {
      console.error("Failed to fetch touch values", err);
    }
  };

  const handleAddItem = async () => {
    if (!touchInput) {
      toast.warn("Please enter a touch value.");
      return;
    }

    try {
      await axios.post(`${BACKEND_SERVER_URL}/api/master-touch/create`, {
        touch: touchInput,
      });

      setTouchInput(""); 
      fetchTouch(); 
      toast.success("Touch value added successfully!");
    } catch (err) {
      console.error("Failed to add touch", err);
      toast.error("Failed to add touch. Please enter a valid decimal number.");
    }
  };

  return (
    <div className="master-container">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <div className="add-item-form">
        <h2 style={{ textAlign: "center" }}>Add Touch Entries</h2>
        <label>Touch:</label>
        <input
          type="number"
          step="0.001"
          value={touchInput}
          onChange={(e) => setTouchInput(e.target.value)}
          placeholder="Enter touch value"
        />

        <button onClick={handleAddItem}>Add Touch</button>
      </div>

      <div className="item-list">
        <h2 style={{ textAlign: "center" }}>Touch Entries</h2>
        {touchList.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>SI.No</th> 
                <th>Touch Value</th>
              </tr>
            </thead>
            <tbody>
              {touchList.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.touch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No touch values added</p>
        )}
      </div>
    </div>
  );
};

export default Masteradditems;
