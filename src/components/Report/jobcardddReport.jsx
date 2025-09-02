import React, { useState, useEffect } from "react";
import axios from "axios";
// import { BACKEND_SERVER_URL } from "../../Config/Config";
import "./jobcardreport.css";

const JobcardddReport = () => {
  const [allJobCards, setAllJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchAllJobCardsData = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_SERVER_URL}/api/job-cards/job-cards`
        );
        setAllJobCards(response.data);
      } catch (err) {
        console.error("Failed to fetch job card data:", err);
        setError("Failed to load job card reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllJobCardsData();
  }, []);

  if (loading) return <p>Loading job cards...</p>;
  if (error) return <p>{error}</p>;
  if (allJobCards.length === 0) return <p>No job cards found.</p>;

  const filteredJobCards = allJobCards.filter((jobCard) => {
    const jobCardDate = new Date(jobCard.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchesDate =
      (!from || jobCardDate >= from) && (!to || jobCardDate <= to);

    const matchesName = jobCard.goldsmith?.name
      ?.toLowerCase()
      .includes(searchName.toLowerCase());

    return matchesDate && matchesName;
  });

  const flatItems = filteredJobCards.flatMap((jobCard) =>
    (jobCard.items || []).map((item) => ({
      ...item,
      jobCardDate: new Date(jobCard.date).toISOString().split("T")[0],
      goldsmithName: jobCard.goldsmith?.name || "N/A",
    }))
  );

  const totals = flatItems.reduce(
    (acc, item) => {
      acc.givenWeight += parseFloat(item.givenWeight) || 0;
      acc.finalWeight += parseFloat(item.manualFinalWeight || item.finalWeight) || 0;
      acc.wastage += parseFloat(item.wastage) || 0;
      return acc;
    },
    { givenWeight: 0, finalWeight: 0, wastage: 0 }
  );

  return (
    <div className="jobcard-report-container">
      <h2 className="report-title">Jobcarddd Report</h2>


<div
  className="filters"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    width:'45rem'
  }}
>

  <div style={{ display: "flex", gap: "1rem" }}>
    <label>
      From:
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
    </label>

    <label>
      To:
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
    </label>
  </div>

    <input
    type="text"
    placeholder="Search by Customer Name"
    value={searchName}
    onChange={(e) => setSearchName(e.target.value)}
    style={{ width: "40%", minWidth: "200px", height:'2rem' }}
  />



</div>

<div className="legend">
        <strong>Legend:</strong>{" "}
        <span style={{ color: "green" }}>
          Green = Goldsmith should give balance to Owner
        </span>
        ,
        <span style={{ color: "red", marginLeft:'2rem' }}>
          Red = Owner should give balance to Goldsmith
        </span>
      </div>
      <br/>
<hr/>
      <table className="styled-table">
        <thead>
          <tr>
            <th rowSpan="2">S.No</th>
            <th rowSpan="2">Date</th>
            <th rowSpan="2">Name</th>
            <th rowSpan="2">Item</th>
            <th colSpan="6" style={{ textAlign: "center" }}>
              Given Weight Details
            </th>
            <th rowSpan="2">Product Weight</th>
            <th rowSpan="2">Final Weight</th>
            <th rowSpan="2">Wastage</th>
            <th rowSpan="2">Product Items</th>
          </tr>
          <tr>
            <th>Given Weight</th>
            <th>Touch</th>
            <th>Purity</th>
            <th>Final Touch</th>
            <th>Copper</th>
            <th>Given Final Weight</th>
          </tr>
        </thead>
        <tbody>
          {flatItems.length === 0 ? (
            <tr>
              <td colSpan="14" style={{ textAlign: "center" }}>
                No items found
              </td>
            </tr>
          ) : (
            flatItems.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.jobCardDate}</td>
                <td>{entry.goldsmithName}</td>
                <td>{entry.item}</td>
                <td>{entry.givenWeight}</td>
                <td>{entry.touch}</td>
                <td>{entry.purity}</td>
                <td>{entry.finalTouch}</td>
                <td>{entry.copper}</td>
                <td>{entry.finalWeight}</td>
                <td>{entry.productWeight}</td>
                <td>{entry.manualFinalWeight}</td>
                <td>{entry.wastage}</td>
                <td>
                  {entry.productItems && entry.productItems.length > 0
                    ? entry.productItems.map((pi, i) => (
                        <div key={i}>
                          {pi.name} - {pi.weight}
                        </div>
                      ))
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>

        <tfoot>
          <tr style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
            <td colSpan="4" style={{ textAlign: "center" }}>
              TOTAL
            </td>
            <td>{totals.givenWeight.toFixed(2)}</td>
            <td colSpan="5"></td>
            <td></td>
            <td></td>
            <td>{totals.finalWeight.toFixed(2)}</td>
            <td>{totals.wastage.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default JobcardddReport;
