import React from "react";
import "./Stock.css";

const Stock = () => {
  const stockSummary = [
    { label: "Total Items", value: 480 },
    { label: "Total Weight", value: "1950.50g" },
  ];

  const stockData = [
    {
      productNo: "JWL-001",
      type: "Bangle",
      purity: "91.6",
      weight: "22.450",
      status: "In Stock",
      dateIn: "2025-06-16",
    },
    {
      productNo: "JWL-002",
      type: "Ring",
      purity: "22kt",
      weight: "5.230",
      status: "Sold",
      dateIn: "2025-06-15",
    },
  ];

  return (
    <div className="stock-container">
      <h2 className="stock-heading">Stock Dashboard</h2>

      <div className="stock-summary">
        {stockSummary.map((item, index) => (
          <div key={index} className="stock-card">
            <p className="stock-label">{item.label}</p>
            <p className="stock-value">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="stock-filters">
        <input type="text" placeholder="Search Product No or Type" />
        <select>
          <option value="">All Status</option>
          <option value="in">In Stock</option>
          <option value="sold">Sold</option>
      
        </select>
        <input type="date" />
      </div>


      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Product No</th>
              <th>Type</th>
              <th>Purity</th>
              <th>Weight (g)</th>
              <th>Status</th>
              <th>Date In</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item, index) => (
              <tr key={index}>
                <td>{item.productNo}</td>
                <td>{item.type}</td>
                <td>{item.purity}</td>
                <td>{item.weight}</td>
                <td
                  className={
                    item.status === "Sold"
                      ? "sold-status"
                    
                      : "in-stock-status"
                  }
                >
                  {item.status}
                </td>
                <td>{item.dateIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stock;









