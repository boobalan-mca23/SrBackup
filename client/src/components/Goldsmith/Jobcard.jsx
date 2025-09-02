
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import { BACKEND_SERVER_URL } from "../../Config/Config";
import "./Jobcard.css";
import EditItemPopup from "./Edititempopup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Jobcard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { goldsmithName, goldsmithPhone, goldsmithAddress, goldsmithId } =
    location.state || {};

  const today = new Date().toISOString().split("T")[0];
  const [jobDetails, setJobDetails] = useState({
    id: "",
    date: today,
    items: [],
    description: "",
    goldsmithId: goldsmithId || "",
  });
  const [finalWeight, setFinalWeight] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupGivenWeight, setPopupGivenWeight] = useState("");
  const [popupTouch, setPopupTouch] = useState("");
  const [popupEstimateWeight, setPopupEstimateWeight] = useState("");
  const [popupWastage, setPopupWastage] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [formData, setFormData] = useState({
    date: today,
    givenWeight: "",
    touch: "",
    estimateWeight: "",
    selectedItem: "",
    description: "",
  });
  console.log("its a new commit");

  const fetchData = async () => {
    try {
      const itemsRes = await axios.get(
        `${BACKEND_SERVER_URL}/api/master-items`
      );
      setItemsList(itemsRes.data);

      if (id) {
        const jobRes = await axios.get(
          `${BACKEND_SERVER_URL}/api/job-cards/${id}`
        );
        const jobCard = jobRes.data[0];
        console.log("card", jobCard);

        setJobDetails({
          id: jobCard.id,
          date: jobCard.date.split("T")[0],
          description: jobCard.description,
          goldsmithId: jobCard.goldsmithId.toString(),
          items: jobCard.items.map((item) => ({
            id: item.id,
            selectedItem: item.masterItem.id.toString(),
            selectedItemName: item.masterItem.itemName,
            givenWeight: item.givenWeight.toString(),
            originalGivenWeight: item.originalGivenWeight.toString(),
            touch: item.touch.toString(),
            estimateWeight: item.estimateWeight.toString(),
            finalWeight: item.finalWeight?.toString() || "",
            wastage: item.wastage?.toString() || "",
            purity: item.purity,
            additionalWeights: item.additionalWeights || [],
            stone:
              item.additionalWeights?.find((aw) => aw.name === "stone")
                ?.weight || null,
            enamel:
              item.additionalWeights?.find((aw) => aw.name === "enamel")
                ?.weight || null,
            beads:
              item.additionalWeights?.find((aw) => aw.name === "beeds")
                ?.weight || null,
          })),
        });

        setFormData({
          date: jobCard.date.split("T")[0],
          description: jobCard.description,
        });
      } else {
        setJobDetails({
          id: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          goldsmithId: "",
          items: [],
        });

        setFormData({
          date: new Date().toISOString().split("T")[0],
          description: "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      // toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const calculatePurityWeight = (weight, touch) => {
    const givenWeight = parseFloat(weight) || 0;
    const touchValue = parseFloat(touch) || 0;
    return (givenWeight * touchValue) / 100;
  };

  const purityWeight = calculatePurityWeight(
    formData.givenWeight,
    formData.touch
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.selectedItem ||
      !formData.givenWeight ||
      !formData.touch ||
      !formData.estimateWeight
    ) {
      toast.error("Please fill all item fields before submitting.");
      return;
    } 

    const selectedItemObj = itemsList.find(
      (item) => item.itemName === formData.selectedItem
    );

    if (!selectedItemObj) {
      toast.error("Selected item not found");
      return;
    }

    const newItem = {
      id: Date.now().toString(), 
      selectedItem: selectedItemObj.id,
      selectedItemName: formData.selectedItem,
      givenWeight: purityWeight.toFixed(2),
      originalGivenWeight: formData.givenWeight,
      touch: formData.touch,
      estimateWeight: formData.estimateWeight,
      finalWeight: "",
      wastage: "",
      purityWeight,
      stone: null,
      enamel: null,
      beads: null,
    };

    const updatedJobDetails = {
      ...jobDetails,
      id: jobDetails.id,
      date: formData.date,
      description: formData.description,
      items: [newItem], 
    };

    try {
      const payload = {
        id: updatedJobDetails.id,
        date: updatedJobDetails.date,
        description: updatedJobDetails.description,
        goldsmithId: updatedJobDetails.goldsmithId,
        items: updatedJobDetails.items.map((item) => ({
          id: item.id,
          selectedItem: item.selectedItem,
          originalGivenWeight: item.originalGivenWeight,
          givenWeight: item.givenWeight,
          touch: item.touch,
          estimateWeight: item.estimateWeight,
          finalWeight: item.finalWeight || null,
          wastage: item.wastage || null,
          purityWeight: item.purityWeight,
          stone: item.stone || null,
          enamel: item.enamel || null,
          beads: item.beads || null,
          additionalWeights: item.additionalWeights || [], 
        })),
      };

   
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/job-cards`,
        payload
      );
      console.log("Post response:", response.data); 

     
      await fetchData(); 

      setFormData({
        date: today,
        givenWeight: "",
        touch: "",
        estimateWeight: "",
        selectedItem: "",
        description: "",
      });

  
      if (!id) {
        navigate(`/job-cards/${response.data.id}`, {
          state: location.state,
          replace: true,
        });
      }

      toast.success(`Job card ${id ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Error saving job card:", error);
      toast.error(
        `Failed to save job card: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  const handleOpenPopup = (index) => {
    setSelectedIndex(index);
    setFinalWeight(jobDetails.items[index].finalWeight || "");
    setPopupGivenWeight(jobDetails.items[index].originalGivenWeight);
    setPopupTouch(jobDetails.items[index].touch);
    setPopupEstimateWeight(jobDetails.items[index].estimateWeight);
    setPopupWastage(jobDetails.items[index].wastage || "");
    setSelectedItemId(jobDetails.items[index].id);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setFinalWeight("");
    setPopupWastage("");
  };

  const handleSaveFinalWeight = (updatedItemData) => {
    setJobDetails((prev) => {
      const updatedItems = [...prev.items];
      const index = updatedItems.findIndex(
        (item) => item.id === updatedItemData.id
      );

      if (index !== -1) {
        updatedItems[index] = {
          ...updatedItems[index],
          finalWeight: updatedItemData.finalWeight,
          wastage: updatedItemData.wastage,
          purity: updatedItemData.purity,
          additionalWeights: updatedItemData.additionalWeights,
          stone:
            updatedItemData.additionalWeights?.find((aw) => aw.name === "stone")
              ?.weight || null,
          enamel:
            updatedItemData.additionalWeights?.find(
              (aw) => aw.name === "enamel"
            )?.weight || null,
          beads:
            updatedItemData.additionalWeights?.find((aw) => aw.name === "beeds")
              ?.weight || null,
        };
      }

      return { ...prev, items: updatedItems };
    });

    toast.success("Item updated successfully!");
  };

  const handleDeleteItem = (indexToDelete) => {
    setJobDetails((prev) => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== indexToDelete),
    }));
    toast.success("Item deleted successfully!");
  };

  const totalGivenWeight = jobDetails.items.reduce(
    (sum, item) => sum + Number(item.givenWeight || 0),
    0
  );
  const totalEstimateWeight = jobDetails.items.reduce(
    (sum, item) => sum + Number(item.estimateWeight || 0),
    0
  );
  const totalFinalWeight = jobDetails.items.reduce(
    (sum, item) => sum + Number(item.finalWeight || 0),
    0
  );
  const totalWastage = jobDetails.items.reduce(
    (sum, item) => sum + Number(item.wastage || 0),
    0
  );

  const balance = totalGivenWeight - (totalFinalWeight + totalWastage);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="job-card-container">
        <div className="job-card-form">
          <h3>Job Card Details</h3>

          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleFormChange}
          />

          <label>Given Weight * Touch:</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                name="givenWeight"
                value={formData.givenWeight}
                onChange={handleFormChange}
                style={{ width: "80px" }}
              />
              <span> * </span>
              <input
                type="text"
                name="touch"
                value={formData.touch}
                onChange={handleFormChange}
                style={{ width: "80px" }}
              />
            </div>
            <span>=</span>
            <div style={{ minWidth: "80px" }}>
              {!isNaN(purityWeight) && purityWeight > 0
                ? purityWeight.toFixed(2) + " g"
                : ""}
            </div>
          </div>

          <label>Estimate Weight:</label>
          <input
            type="text"
            name="estimateWeight"
            value={formData.estimateWeight}
            onChange={handleFormChange}
          />

          <label>Select Item:</label>
          <select
            name="selectedItem"
            value={formData.selectedItem}
            onChange={handleFormChange}
          >
            <option value="">Select an Item</option>
            {itemsList.map((item) => (
              <option key={item._id} value={item.itemName}>
                {item.itemName}
              </option>
            ))}
          </select>

          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            rows="4"
            cols="33"
          ></textarea>

          <button
            onClick={handleSubmit}
            style={{ backgroundColor: "#4CAF50", marginTop: "20px" }}
          >
            {id ? "Update Job Card" : "Save Job Card"}
          </button>
        </div>

        <div className="job-card">
          <div className="job-card-header">
            <div className="job-card-logo">Premier Jewel</div>
            <div className="job-card-contact">
              <p>Town Hall 458 Road</p>
              <p>Coimbatore</p>
              <p>9875637456</p>
            </div>
          </div>

          <div className="job-card-details">
            <div className="job-card-number">
              <p>
                <strong>No:</strong> {id || "New"}
              </p>
              <p style={{ marginLeft: "19rem" }}>
                <strong>Date:</strong> {jobDetails.date}
              </p>
            </div>
          </div>
          <hr className="divider" />

          <div className="job-card-customer">
            <h3>Goldsmith Information</h3>
            <br />
            <p>
              <strong>Name:</strong> {goldsmithName}
            </p>
            <p>
              <strong>Address:</strong> {goldsmithAddress}
            </p>
            <p>
              <strong>Phone:</strong> {goldsmithPhone}
            </p>
          </div>
          <hr className="divider" />

          <div className="job-card-description">
            <h3>Description</h3>
            <p>{jobDetails.description}</p>
          </div>
          <hr className="divider" />

          <div className="job-card-items">
            <table>
              <thead>
                <tr>
                  <th>SI.No</th>
                  <th>Item</th>
                  <th>Given Weight (Gross)</th>
                  <th>Touch</th>
                  <th>Given Weight (Purity)</th>
                  {/* <th>E.W</th> */}
                  <th>Product WT</th>
                  <th>Stone</th>
                  <th>Enamel</th>
                  <th>Beeds</th>
                  <th>Final WT</th>
                  <th>Wastage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobDetails.items.length > 0 ? (
                  jobDetails.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.selectedItemName}</td>
                      <td>{item.originalGivenWeight} g</td>
                      <td>{item.touch}</td>
                      <td>{item.givenWeight} g</td>
                      {/* <td>{item.estimateWeight} g</td> */}
                      <td>
                        {item.finalWeight ? `${item.finalWeight} g` : "Pending"}
                      </td>
                      <td>{item.stone ? `${item.stone} g` : "-"}</td>
                      <td>{item.enamel ? `${item.enamel} g` : "-"}</td>
                      <td>{item.beads ? `${item.beads} g` : "-"}</td>
                      <td>{item.purity}</td>
                      <td>{item.wastage} g</td>
                      <td>
                        <button onClick={() => handleOpenPopup(index)}>
                          &#128065;
                        </button>
                        <button onClick={() => handleDeleteItem(index)}>
                          &#128465;
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      No items added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <hr className="divider" />

          <div className="job-card-totals">
            <h3>Balance</h3>
            <p>
              <strong>Balance:</strong> {balance.toFixed(2)} g
            </p>
            <p>
              {balance > 0 ? (
                <span style={{ color: "green" }}>
                  Owner should give {balance.toFixed(2)} g
                </span>
              ) : balance < 0 ? (
                <span style={{ color: "red" }}>
                  Goldsmith should give {Math.abs(balance).toFixed(2)} g
                </span>
              ) : (
                <span style={{ color: "blue" }}>No balance to be given</span>
              )}
            </p>
          </div>

          <div className="job-card-footer">
            <p>jeevagoldcoins@gmail.com</p>
          </div>
        </div>

        <EditItemPopup
          isOpen={showPopup}
          onClose={handleClosePopup}
          givenWeight={popupGivenWeight}
          touch={popupTouch}
          estimateWeight={popupEstimateWeight}
          finalWeight={finalWeight}
          wastage={popupWastage}
          onGivenWeightChange={(e) => setPopupGivenWeight(e.target.value)}
          onTouchChange={(e) => setPopupTouch(e.target.value)}
          onEstimateWeightChange={(e) => setPopupEstimateWeight(e.target.value)}
          onFinalWeightChange={(e) => setFinalWeight(e.target.value)}
          onWastageChange={(e) => setPopupWastage(e.target.value)}
          onSave={handleSaveFinalWeight}
          calculatePurityWeight={calculatePurityWeight}
          itemId={selectedItemId}
        />
      </div>
    </>
  );
};

export default Jobcard;











 
 
 
 