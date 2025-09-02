import React, { useState, useEffect } from "react";
import "./Jobcarddd.css";
import VisibilityIcon from "@mui/icons-material/Visibility";

const LOCAL_STORAGE_KEY = "jobcardEntries";

const Jobcarddd = ({ name, phone, address }) => {

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    date: getTodayDate(),
    givenWeight: "",
    touch: "",
    finalTouch: "",
    estimateWeight: "",
    item: "",
    quantity: "",
    description: "",
  });

  const [derivedData, setDerivedData] = useState({
    purity: 0,
    pureValue: 0,
    givenfinalWeight: 0,
    copper: 0,
  });

  const [entryGroups, setEntryGroups] = useState([]);
  const [entries, setEntries] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
  const [productInput1, setProductInput1] = useState("");
  const [productInput2, setProductInput2] = useState("");
  const [productItems, setProductItems] = useState([]);
  const [popupFinalWeight, setPopupFinalWeight] = useState("");
  const [popupWastage, setPopupWastage] = useState("");
  const [wastageType, setWastageType] = useState("+");
  const [subEntryPopupData, setSubEntryPopupData] = useState([]);

  useEffect(() => {
    const { givenWeight, touch, finalTouch } = formData;
    const gWeight = parseFloat(givenWeight) || 0;
    const gTouch = parseFloat(touch) || 0;
    const fTouch = parseFloat(finalTouch) || 0;

    const purity = (gWeight * gTouch) / 100;
    const pureValue = fTouch / 100;
    const givenfinalWeight = pureValue !== 0 ? purity / pureValue : 0;
    const copper = gWeight - givenfinalWeight;

    setDerivedData({
      purity: purity.toFixed(3),
      pureValue: pureValue.toFixed(3),
      givenfinalWeight: givenfinalWeight.toFixed(3),
      copper: copper.toFixed(3),
    });
  }, [formData.givenWeight, formData.touch, formData.finalTouch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const newSubEntry = {
      date: formData.date,
      givenWeight: formData.givenWeight,
      touch: formData.touch,
      purity: derivedData.purity,
      finalTouch: formData.finalTouch,
      copper: derivedData.copper,
      givenfinalWeight: derivedData.givenfinalWeight,
      estimateWeight: formData.estimateWeight,
      quantity: formData.quantity,
      description: formData.description,
    };
    console.log(newSubEntry)

    const existingGroupIndex = entryGroups.findIndex(
      (group) => group.item === formData.item
    );

    if (existingGroupIndex !== -1) {
      const updatedGroups = [...entryGroups];
      updatedGroups[existingGroupIndex].subEntries.push(newSubEntry);
      setEntryGroups(updatedGroups);
    } else {
      const newGroup = {
        item: formData.item,
        productWeight: productInput1,
        finalWeight: derivedData.finalWeight,
        wastage: "",
        productItems: [],
        subEntries: [newSubEntry],
        estimateWeight: formData.estimateWeight,
        quantity: formData.quantity,
        description: formData.description,
      };
      setEntryGroups([...entryGroups, newGroup]);
    }

    setEntries([
      ...entries,
      {
        ...formData,
        ...derivedData,
        manualFinalWeight: "",
        wastage: "",
        productItems: [],
        productInput1: "",
        productInput2: "",
      },
    ]);

    setFormData({
      date: getTodayDate(),
      givenWeight: "",
      touch: "",
      finalTouch: "",
      estimateWeight: "",
      item: "",
      quantity: "",
      description: "",
    });

    setDerivedData({
      purity: 0,
      pureValue: 0,
      givenfinalWeight: 0,
      copper: 0,
    });
  };


  const handleSaveEntry = () => {
    const updatedGroups = [...entryGroups];
    const groupIndex = selectedEntryIndex;
    
    // Calculate the values before saving
    const computedFinalWeight = finalWeight.toFixed(3);
    const computedWastage = calculateWastage().toFixed(3);
    
    updatedGroups[groupIndex] = {
      ...updatedGroups[groupIndex],
      productWeight: productInput1,
      finalWeight: computedFinalWeight, // Store computed final weight
      wastage: `${popupWastage}${wastageType}`,
      wastageValue: computedWastage, // Store computed wastage value
      productItems: productItems.map(item => ({
        name: item.name === "Other" ? item.customName || "Other" : item.name,
        weight: item.weight
      })),
      wastageType: wastageType
    };
  
    setEntryGroups(updatedGroups);
    setShowPopup(false);
  };


  const handleView = (groupIndex) => {
    const group = entryGroups[groupIndex];
    setSelectedEntryIndex(groupIndex);
    setShowPopup(true);
    setProductItems(group.productItems || []);
    setProductInput1(group.productWeight || "");
    setPopupWastage(group.wastage?.replace(/[^0-9.]/g, '') || "");
    setWastageType(group.wastage?.includes('%') ? '%' : '+');
    setSubEntryPopupData(group.subEntries);
  };

  const handleAddRow = () => {
    setProductItems([...productItems, { name: "", weight: "" }]);
  };

  const handleProductItemChange = (index, field, value) => {
    const updated = [...productItems];
    updated[index][field] = value;
    setProductItems(updated);
  };

  useEffect(() => {
    const storedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (showPopup && selectedEntryIndex !== null) {
      const touchValue =
        parseFloat(entries[selectedEntryIndex]?.finalTouch) || 0;
      setProductInput2(touchValue.toFixed(3));
    }
  }, [showPopup, selectedEntryIndex]);

  const productWeight = parseFloat(productInput1 || 0);

  const addItemWeight = productItems.reduce(
    (sum, item) => sum + (parseFloat(item.weight) || 0),
    0
  );

  const finalWeight = productWeight - addItemWeight;

  const calculateWastage = () => {
    const baseWeight = parseFloat(finalWeight) || 0;
    const wastage = parseFloat(popupWastage) || 0;

    if (wastageType === "+") {
      return baseWeight + wastage;
    } else if (wastageType === "%") {
      return baseWeight + (baseWeight * wastage) / 100;
    }
    return baseWeight;
  };

  useEffect(() => {
    const storedGroups = localStorage.getItem("entryGroups");
    if (storedGroups) {
      setEntryGroups(JSON.parse(storedGroups));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("entryGroups", JSON.stringify(entryGroups));
  }, [entryGroups]);

  const handleSubEntryChange = (groupIndex, subIndex, field, value) => {
    const updatedGroups = [...entryGroups];
    updatedGroups[groupIndex].subEntries[subIndex][field] = value;

    const { givenWeight, touch, finalTouch } =
      updatedGroups[groupIndex].subEntries[subIndex];
    const gWeight = parseFloat(givenWeight) || 0;
    const gTouch = parseFloat(touch) || 0;
    const fTouch = parseFloat(finalTouch) || 0;

    const purity = (gWeight * gTouch) / 100;
    const pureValue = fTouch / 100;
    const givenfinalWeight = pureValue !== 0 ? purity / pureValue : 0;
    const copper = gWeight - finalWeight;

    updatedGroups[groupIndex].subEntries[subIndex].purity = purity.toFixed(3);
    updatedGroups[groupIndex].subEntries[subIndex].copper = copper.toFixed(3);
    updatedGroups[groupIndex].subEntries[subIndex].finalWeight =
      givenfinalWeight.toFixed(3);

    setEntryGroups(updatedGroups);
  };

  const totalCopper = entryGroups.reduce((sum, group) => {
    return (
      sum +
      group.subEntries.reduce(
        (subSum, sub) => subSum + (parseFloat(sub.copper) || 0),
        0
      )
    );
  }, 0);

  const totalGivenFinalWeight = entryGroups.reduce((sum, group) => {
    return (
      sum +
      group.subEntries.reduce(
        (subSum, sub) => subSum + (parseFloat(sub.givenfinalWeight) || 0),
        0
      )
    );
  }, 0);


  const allDatesSame = (subEntries) => {
    const firstDate = subEntries[0]?.date;
    return subEntries.every((entry) => entry.date === firstDate);
  };



  return (
    <div className="jobcard-container">
      <div className="form-section">
      <div className="job-card-header">
<div className="job-card-logo">Premier Jewel</div>
<div className="job-card-contact">
  <p>Town Hall 458 Road</p>
  <p>Coimbatore</p>
  <p>9875637456</p>
</div>
</div>
        <div className="details-grid-2x6">
          <div className="grid-cell">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          <div className="grid-cell">
            <label>Given Weight</label>
            <input
              name="givenWeight"
              value={formData.givenWeight}
              onChange={handleChange}
            />
          </div>
          <div className="grid-cell">
            <label>Touch</label>
            <input
              name="touch"
              value={formData.touch}
              onChange={handleChange}
            />
          </div>
          <div className="grid-cell">
            <label>Purity</label>
            <input value={derivedData.purity} readOnly />
          </div>
          <div className="grid-cell">
            <label>Final Touch</label>
            <input
              name="finalTouch"
              value={formData.finalTouch}
              onChange={handleChange}
            />
          </div>
          <div className="grid-cell">
            <label>Copper</label>
            <input value={derivedData.copper} readOnly />
          </div>
          <div className="grid-cell">
            <label>Given Final Weight</label>
            <input value={derivedData.givenfinalWeight} readOnly />
          </div>
          <div className="grid-cell">
            <label>Estimate Weight</label>
            <input
              name="estimateWeight"
              value={formData.estimateWeight}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid-cell">
  <label >Select Item</label>
  <select name="item" value={formData.item} onChange={handleChange} style={{height:'1.8rem'}}>
    <option value=""> Select Item </option>
    <option value="Ring">Ring</option>
    <option value="Chain">Chain</option>
  </select>
</div>

          <div className="grid-cell">
            <label>Quantity</label>
            <input
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>
          <div className="grid-cell">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="1"
            />
          </div>
          <div className="grid-cell" style={{ display: "none" }}>
            <label>Pure Value</label>
            <input value={derivedData.pureValue} readOnly />
          </div>
        </div>
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>
      <hr /> <br />
      <h2 className="title">Goldsmith Information</h2>
      <div className="info-card">
        <p>
          <strong>Name:</strong> {name}{" "}
        </p>
        <p>
          <strong>Address:</strong> {address}{" "}
        </p>
        <p>
          <strong>Phone Number:</strong> {phone}{" "}
        </p>
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th rowSpan="2">S.No</th>
            <th rowSpan="2">Date</th> 
            <th rowSpan="2">Item</th>
            <th colSpan="6">Given Weight Details</th>
            {entryGroups.some(group => group.subEntries.some(entry => entry.estimateWeight)) && (
  <th rowSpan="2">Estimate Weight</th>
)}
{entryGroups.some(group => group.subEntries.some(entry => entry.quantity)) && (
  <th rowSpan="2">Quantity</th>
)}
{entryGroups.some(group => group.subEntries.some(entry => entry.description)) && (
  <th rowSpan="2">Description</th>
)}

            <th rowSpan="2">Product Weight</th>
            <th rowSpan="2">Final Weight</th>
            <th rowSpan="2">Wastage</th>
            <th rowSpan="2">Product Items</th>
            <th rowSpan="2">Actions</th>
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
          {entryGroups.map((group, groupIndex) => {
            const datesAreSame = allDatesSame(group.subEntries);
            return (
              <React.Fragment key={groupIndex}>
                {group.subEntries.map((entry, subIndex) => (
                  <tr key={`group-${groupIndex}-sub-${subIndex}`}>
                    {subIndex === 0 && (
                      <>
                        <td rowSpan={group.subEntries.length}>{groupIndex + 1}</td>
                        {datesAreSame ? (
                          <td rowSpan={group.subEntries.length}>{entry.date}</td>
                        ) : (
                          <td>{entry.date}</td>
                        )}
                        <td rowSpan={group.subEntries.length}>{group.item}</td>
                      </>
                    )}
                    {subIndex !== 0 && !datesAreSame && <td>{entry.date}</td>}
                    <td>{entry.givenWeight}</td>
                    <td>{entry.touch}</td>
                    <td>{entry.purity}</td>
                    <td>{entry.finalTouch}</td>
                    <td>{entry.copper}</td>
                    <td>{entry.givenfinalWeight}</td>

                    {entryGroups.some(group => group.subEntries.some(e => e.estimateWeight)) && (
  <td>{entry.estimateWeight}</td>
)}
{entryGroups.some(group => group.subEntries.some(e => e.quantity)) && (
  <td>{entry.quantity}</td>
)}
{entryGroups.some(group => group.subEntries.some(e => e.description)) && (
  <td>{entry.description}</td>
)}

                    {subIndex === 0 && (
                      <>
                        <td rowSpan={group.subEntries.length}>{group.productWeight}</td>
                        <td rowSpan={group.subEntries.length}>{group.finalWeight}</td>
                        <td rowSpan={group.subEntries.length}>{group.wastageValue}</td>
                        <td rowSpan={group.subEntries.length}>
                          {group.productItems?.map((item, i) => (
                            <div key={i}>
                              {item.name} - {item.weight}
                            </div>
                          ))}
                        </td>
                        <td rowSpan={group.subEntries.length}>
                          <button onClick={() => handleView(groupIndex)}> <VisibilityIcon/></button>
                        </td>
                      </>
                    )}
                  </tr>                  
                ))}
  
              </React.Fragment>
            );
          })}
        </tbody>
     
<tfoot>
  <tr>
    <td colSpan="8" style={{textAlign: 'right', fontWeight: 'bold'}}>Total Given Final Weight:</td>
    <td style={{fontWeight: 'bold'}}>{totalGivenFinalWeight.toFixed(3)}</td>
 
  </tr>
</tfoot>

      </table>
      {showPopup && selectedEntryIndex !== null && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Jobcard Details</h3>
            <table className="styled-table">
              <thead>
                <tr>
                  <th rowSpan="2">S.No</th>
                  <th rowSpan="2">Date</th>
                  <th rowSpan="2">Item</th>
                  <th colSpan="6">Given Weight Details</th>
                  {entryGroups.some(group => group.subEntries.some(entry => entry.estimateWeight)) && (
  <th rowSpan="2">Estimate Weight</th>
)}
{entryGroups.some(group => group.subEntries.some(entry => entry.quantity)) && (
  <th rowSpan="2">Quantity</th>
)}
{entryGroups.some(group => group.subEntries.some(entry => entry.description)) && (
  <th rowSpan="2">Description</th>
)}
                  {/* <th rowSpan="2">Estimate Weight</th>
                  <th rowSpan="2">Quantity</th>
                  <th rowSpan="2">Description</th> */}
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
                {subEntryPopupData?.map((entry, subIndex) => {
                  const datesAreSame = allDatesSame(subEntryPopupData);
                  return (
                    <tr key={subIndex}>
                      {subIndex === 0 && (
                        <>
                          <td rowSpan={subEntryPopupData.length}>{selectedEntryIndex + 1}</td>
                          {datesAreSame ? (
                            <td rowSpan={subEntryPopupData.length}>{entry.date}</td>
                          ) : (
                            <td>{entry.date}</td>
                          )}
                          <td rowSpan={subEntryPopupData.length}>
                            {entryGroups[selectedEntryIndex]?.item}
                          </td>
                        </>
                      )}
                      {subIndex !== 0 && !datesAreSame && <td>{entry.date}</td>}
                      <td>{entry.givenWeight}</td>
                      <td>{entry.touch}</td>
                      <td>{entry.purity}</td>
                      <td>{entry.finalTouch}</td>
                      <td>{entry.copper}</td>
                      <td>{entry.givenfinalWeight}</td>

                      {entryGroups.some(group => group.subEntries.some(e => e.estimateWeight)) && (
  <td>{entry.estimateWeight}</td>
)}
{entryGroups.some(group => group.subEntries.some(e => e.quantity)) && (
  <td>{entry.quantity}</td>
)}
{entryGroups.some(group => group.subEntries.some(e => e.description)) && (
  <td>{entry.description}</td>
)}

                      {subIndex === 0 && (
                        <>
                          <td rowSpan={subEntryPopupData.length}>
                            {entryGroups[selectedEntryIndex]?.productWeight}
                          </td>
                          <td rowSpan={subEntryPopupData.length}>
                            {entryGroups[selectedEntryIndex]?.finalWeight}
                          </td>
                          <td rowSpan={subEntryPopupData.length}>
                            {entryGroups[selectedEntryIndex]?.wastageValue}
                          </td>
                          <td rowSpan={subEntryPopupData.length}>
                            {entryGroups[selectedEntryIndex]?.productItems?.map((item, i) => (
                              <div key={i}>
                                {item.name} - {item.weight}
                              </div>
                            ))}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
  <tr>
    <td colSpan="8" style={{textAlign: 'right', fontWeight: 'bold'}}>Total Given Final Weight:</td>
    <td style={{fontWeight: 'bold'}}>{totalGivenFinalWeight.toFixed(3)}</td>
  </tr>
</tfoot>


            </table>
            <hr />
            <div>
              <label>
                <strong>Product Weight Calculation:</strong>
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "0px",
                }} >
                <input
                  type="number"
                  value={productInput1}
                  onChange={(e) => setProductInput1(e.target.value)}
                  style={{ width: "80px" }}
                  placeholder="Weight" />
                <span>= {productWeight.toFixed(2)}</span>
              </div>
            </div>
            <hr/>
            <div>
              <button onClick={handleAddRow} className="add">
                Add Item
              </button>
              <div
                style={{
                  maxHeight: "230px",
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      backgroundColor: "#f0f0f0",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        Weight
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "8px" }}>
                          <select
                            value={item.name}
                            onChange={(e) =>
                              handleProductItemChange(
                                idx,
                                "name",
                                e.target.value
                              )
                            }
                            style={{ width: "100%" }}
                          >
                            <option value="">Select</option>
                            <option value="Enamel">Enamel</option>
                            <option value="Beads">Beads</option>
                            <option value="Stone">Stone</option>
                            <option value="Other">Other</option>
                          </select>
                          {item.name === "Other" && (
                            <input
                              placeholder="Enter name"
                              value={item.customName || ""}
                              onChange={(e) =>
                                handleProductItemChange(
                                  idx,
                                  "customName",
                                  e.target.value
                                )
                              }
                              style={{ width: "100%", marginTop: "4px" }}
                            />
                          )}
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            placeholder="Weight"
                            value={item.weight}
                            onChange={(e) =>
                              handleProductItemChange(
                                idx,
                                "weight",
                                e.target.value
                              )
                            }
                            style={{ width: "100%" }}
                          />
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <button
                            onClick={() => {
                              const updatedItems = [...productItems];
                              updatedItems.splice(idx, 1);
                              setProductItems(updatedItems);
                            }}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "4px",
                              backgroundColor: "#ff4444",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <hr />

            <div style={{ marginTop: "0px" }}>
  <label>
    <strong>Final Weight Calculation:</strong>
  </label>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <span>Product Weight = {productWeight.toFixed(2)}</span>
    <span>−</span>
    <span>Add Items = {addItemWeight.toFixed(2)}</span>
    <span>=</span>
    <input
      value={finalWeight.toFixed(3)}
      readOnly
      style={{ backgroundColor: "#f0f0f0", width: "100px" }}
    />
  </div>
</div>
            <hr />
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "flex-start" }}>
           
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <label><strong>Wastage:</strong></label>
  <input
    value={finalWeight.toFixed(3)}
    readOnly
    style={{ backgroundColor: "#f0f0f0", width: "100px" }}
  />
  <select
    value={wastageType}
    onChange={(e) => setWastageType(e.target.value)}
    style={{ width: "60px" }}
  >
    <option value="+">+</option>
    <option value="%">%</option>
  </select>
  <input
    type="number"
    value={popupWastage}
    onChange={(e) => setPopupWastage(e.target.value)}
    placeholder="Wastage"
    style={{ width: "100px" }}
  /> =
  <input 
    style={{width:'6rem'}}
    value={calculateWastage().toFixed(3)}
    readOnly
  />
</div>
              <div
                style={{
                  minWidth: "200px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginRight:'3rem'
                }}
              >
                {wastageType === "%" ? (
                  <>
                    <div>
                      {finalWeight.toFixed(3)} × {popupWastage}% ={" "}
                      {(finalWeight * (popupWastage / 100)).toFixed(3)}
                    </div>
                    <div>Total: {calculateWastage().toFixed(3)}</div>
                  </>
                ) : (
                  <>
                    <div>
                      {finalWeight.toFixed(3)} + {popupWastage} ={" "}
                      {calculateWastage().toFixed(3)} 
                     
                    </div>
                  
                  </>
                  
                )}
              </div>
            </div>


         <hr/>   


<div style={{ 
  marginTop: "20px",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#f5f5f5",
  width: "fit-content"
}}>
  <span><strong>Total Given Final Weight:</strong></span>
  <span>{totalGivenFinalWeight.toFixed(3)}</span>
  <span><strong> - Total Wastage:</strong></span>
  <span>{calculateWastage().toFixed(3)}</span>
  <span><strong> = Net Weight:</strong></span>
  <span>{(totalGivenFinalWeight - calculateWastage()).toFixed(3)}</span>
</div>


<h4 style={{ color: "red" }}>
  Goldsmith must give to owner ={" "}
  {(totalGivenFinalWeight - calculateWastage()) >= 0
    ? (totalGivenFinalWeight - calculateWastage()).toFixed(3)
    : "0.000"}
</h4>
<h4 style={{ color: "green" }}>
  Owner must give to Goldsmith ={" "}
  {(totalGivenFinalWeight - calculateWastage()) < 0
    ? Math.abs(totalGivenFinalWeight - calculateWastage()).toFixed(3)
    : "0.000"}
</h4>

<hr/>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "10px" }}>
              <button 
                onClick={() => setShowPopup(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              <button
                className="btn-update"
                onClick={handleSaveEntry}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobcarddd;