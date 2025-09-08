import React, { useState, useEffect } from "react";
import axios from 'axios'
import Button from "@mui/material/Button";
import { MdDeleteForever } from "react-icons/md";
import { FaWeight } from "react-icons/fa";
import "./Newjobcard.css";
import {
  goldRowValidation,
  receiveRowValidation,
  itemValidation,
  deductionValidation,
  wastageValidation,
} from "./JobcardValidation";
import adjustToThreeDecimals from "./adjustThree";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import weight from '../../Assets/weight.jpg'

const format = (val) =>
  isNaN(parseFloat(val)) ? "" : parseFloat(val).toFixed(3);

const NewJobCard = ({
  open,
  onclose,
  edit,
  name,
  goldSmithWastage,
  balance,
  goldRows,
  setGoldRows,
  itemRows,
  setItemRows,
  deductionRows,
  setDeductionRows,
  masterItems,
  masterSeal,
  handleSaveJobCard,
  handleUpdateJobCard,
  jobCardId,
  received,
  setReceived,
  jobCardLength,
  lastJobCardId,
  lastIsFinish,
  isFinished,
  setGoldSmithWastage,
}) => {
  const today = new Date().toLocaleDateString("en-IN");
  const [formErrors, setFormErrors] = useState([]);
  const [receivedErrors, setReceivedErrors] = useState([]);
  const [itemErrors, setItemErrors] = useState([]);
  const [deductionErrors, setDeductionErrors] = useState([]);
  const [wastageErrors, setWastageErrors] = useState({});
  const [netWeight, setNetWeight] = useState("0.000");
  const [wastage, setWastage] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [balanceDifference, setBalanceDifference] = useState(0);
  const [time, setTime] = useState("");


  const calculatePurity = (w, t) =>
    !isNaN(w) && !isNaN(t) ? ((w * t) / 100).toFixed(3) : "";

  const handleGoldRowChange = (i, field, val) => {
    const copy = [...goldRows];
    copy[i][field] = val;
 
    setGoldRows(copy);
    // check validation
    goldRowValidation(goldRows, setFormErrors);
  };
  const handleRecivedChange = (i, field, val) => {
    const copy = [...received];
    copy[i][field] = val;
    //  copy[i].purity = calculatePurity(
    //   parseFloat(copy[i].weight),
    //   parseFloat(copy[i].touch)
    // );

    setReceived(copy);
    //check validation
    receiveRowValidation(received, setReceivedErrors);
  };

  const handleItemRowChange = (i, field, val) => {
    const updated = [...itemRows];
    updated[i][field] = val;
    setItemRows(updated);
    // check validation
    itemValidation(itemRows, setItemErrors);
  };

  const handleDeductionChange = (i, field, val) => {
    const updated = [...deductionRows];
    updated[i][field] = val;
    setDeductionRows(updated);
    // check validation
    deductionValidation(deductionRows, setDeductionErrors);
  };
  const handleGoldSmithChange = (e) => {
     setGoldSmithWastage(e.target.value);
    if (!isNaN(e.target.value) && e.target.value !== "") {
      wastageValidation(e.target.value, setWastageErrors);
      setWastage(adjustToThreeDecimals((netWeight * parseFloat(e.target.value)) / 100));
      let calculatedFinalTotal =parseFloat(totalItemWeight) + adjustToThreeDecimals((netWeight * parseFloat(e.target.value)) / 100);
      setFinalTotal(format(calculatedFinalTotal));
    } else {
      wastageValidation(e.target.value, setWastageErrors);
    }
  };

  const totalGoldWeight = goldRows.reduce(
    (sum, row) => sum + parseFloat(row.weight || 0),
    0
  );
  const totalReceivedWeight = received.reduce(
    (sum, row) => sum + parseFloat(row.weight || 0),
    0
  );

  const totalBalance =
    balance >= 0
      ? parseFloat(totalGoldWeight) + parseFloat(balance)
      : parseFloat(balance) + parseFloat(totalGoldWeight);

  const totalItemWeight = itemRows.reduce(
    (sum, item) => sum + parseFloat(item.weight || 0),
    0
  );

  const totalDeductionWeight = deductionRows.reduce(
    (sum, deduction) => sum + parseFloat(deduction.weight || 0),
    0
  );

  const stoneOptions = ["Stone", "Enamel", "Beads","Chain", "Others"];

  const handleRemoveReceived = (removeIndex) => {
    const isTrue = window.confirm(
      "Are you sure you want to remove this received row?"
    );
    if (isTrue) {
      const receivedItems = received.filter((_, index) => index != removeIndex);
      setReceived(receivedItems);
    }
  };
  const handleRemovegold = (removeIndex) => {
    const isTrue = window.confirm(
      "Are you sure you want to remove this gold row?"
    );
    if (isTrue) {
      const goldItems = goldRows.filter((_, index) => index != removeIndex);
      setGoldRows(goldItems);
    }
  };
  const handleRemoveItem = (removeIndex) => {
    const isTrue = window.confirm(
      "Are you sure you want to remove this Item row?"
    );
    if (isTrue) {
      const removeItems = itemRows.filter((_, index) => index != removeIndex);
      setItemRows(removeItems);
    }
  };
  const handleRemovededuction = (removeIndex) => {
    const isTrue = window.confirm(
      "Are you sure you want to deduction this Item row?"
    );
    if (isTrue) {
      const removeItems = deductionRows.filter(
        (_, index) => index != removeIndex
      );
      setDeductionRows(removeItems);
    }
  };

  // useEffect(() => {
  //   setItemPurity(calculatePurity(totalItemWeight, parseFloat(itemTouch)));
  // }, [totalItemWeight, itemTouch]);

  const safeParse = (val) => (isNaN(parseFloat(val)) ? 0 : parseFloat(val));

  useEffect(() => {
    const jobCardBalance =
      safeParse(balance) >= 0
        ? safeParse(totalGoldWeight) + safeParse(balance)
        : safeParse(balance) + safeParse(totalGoldWeight);
         console.log('finalTotal',finalTotal)
    let difference = jobCardBalance - safeParse(finalTotal);

    if (received.length >= 1) {
      const totalReceived = received.reduce((sum, row) => {
        return sum + parseFloat(row.weight || 0);
      }, 0);

      difference -= totalReceived;
    }

    setBalanceDifference(format(difference));
  }, [balance, goldRows, itemRows, deductionRows, wastage, received]);

  useEffect(() => {
    let calculatedNetWeight = totalItemWeight - totalDeductionWeight;
    setNetWeight(format(adjustToThreeDecimals(calculatedNetWeight)));
    setWastage(
      format(
        adjustToThreeDecimals((calculatedNetWeight * goldSmithWastage) / 100)
      )
    );
    
    setFinalTotal(
      totalItemWeight + adjustToThreeDecimals((calculatedNetWeight * goldSmithWastage) / 100)
    );
  }, [itemRows, deductionRows]);

useEffect(() => {
    const updateTime = () => {
      const now = new Date();
     
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const SaveJobCard = (print="noprint") => {
    // form validation
    let goldIsTrue = goldRowValidation(goldRows, setFormErrors);
    let itemIsTrue = "";
    let deductionIsTrue = "";
    if (edit) {
      itemIsTrue = itemValidation(itemRows, setItemErrors);
      deductionIsTrue = deductionValidation(deductionRows, setDeductionErrors);
    }
    let receivedIsTrue = receiveRowValidation(received, setReceivedErrors);
    if (edit) {
      if (
        goldIsTrue &&
        itemIsTrue &&
        deductionIsTrue &&
        receivedIsTrue &&
        !wastageErrors.wastage
      ) {
        if(print==="print"){
          window.print()
          if(isFinished==="false"){
            console.log('testinnnnn')
            handleUpdateJobCard(
             totalGoldWeight,
             totalItemWeight,
             totalDeductionWeight,
             finalTotal,
             balanceDifference,
             balance,
             format(totalReceivedWeight)
             );
          }
        }
        else{
           handleUpdateJobCard(
             totalGoldWeight,
             totalItemWeight,
             totalDeductionWeight,
             finalTotal,
             balanceDifference,
             balance,
             format(totalReceivedWeight)
             );
        }
       
        
      } else {
        toast.warn("Give Correct Information");
      }
    } else {
      if (goldIsTrue && receivedIsTrue && !wastageErrors.wastage) {
        if(print==="print"){
          window.print()
              handleSaveJobCard(
                totalGoldWeight,
                totalItemWeight,
                totalDeductionWeight,
                finalTotal,
                balanceDifference,
                balance,
                totalReceivedWeight
             );
          }else{
             handleSaveJobCard(
                totalGoldWeight,
                totalItemWeight,
                totalDeductionWeight,
                finalTotal,
                balanceDifference,
                balance,
                totalReceivedWeight
             );
          }
         
       
      } else {
        toast.warn("Give Correct Information");
      }
    }
  };

  const getGivenWeight=async(i,item="gold")=>{
      try{
        const res=await axios.get(`${BACKEND_SERVER_URL}/api/weightRoute/getWeight`)
         console.log('weight from mechine',res.data.weightdata)
          
         if(item==="gold"){
          const copy = [...goldRows];
          copy[i]['weight'] = res.data.weightdata;
          setGoldRows(copy);
         }else if(item==="item"){
          const copy = [...itemRows];
          copy[i]['weight'] = res.data.weightdata;
          setItemRows(copy);
         }else{
           const copy = [...received];
          copy[i]['weight'] = res.data.weightdata;
          setReceived(copy);
         }
          
         
      }catch(err){
        toast.error("Weight Mechine Not Connected",{autoClose:2000})
      }
  }
  

  return (
    <div className="jobcard-page print-jobcard">
      <Dialog
        open={open}
        onClose={onclose}
        maxWidth={false}
        PaperProps={{
          className: "jobcard-dialog",
        }}
      >
        <DialogTitle
          className="dialogTitle"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {edit ? "Update Job Card" : "Add New Job Card"}
          <IconButton onClick={onclose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <div className="container">
            <div className="header">
              <div className="header-item">
                <span className="header-label">ID:</span>{" "}
                {edit ? jobCardId : jobCardLength}
              </div>
              <div className="header-item">
                <span className="header-label">Name:</span> {name}
              </div>
              <div className="header-item">
                <span className="header-label">Date:</span> {today}
              </div>
               <div className="header-item">
                <span className="header-label">Time:</span> {time}
              </div>
            </div>

          

            <div className="section">
              <h3 >Given Gold</h3>
              <div className="goldGrid">
              {goldRows.map((row, i) => (
                <div key={i} className="row">
                     <span style={{marginTop:"5px"}}>{i<9 ? (`0${i+1}.`):(`${i+1}.`)} </span> 
                      <span className="userinput" id="username">{row.username}</span>
                  <div>
                    <select
                      value={row.itemName}
                      onChange={(e) =>
                        handleGoldRowChange(i, "itemName", e.target.value)
                      }
                      className="givenGoldSelect"

                    >
                      <option value="">Item</option>
                      {masterItems.map((option, index) => (
                        <option key={index} value={option.itemName}>
                          {option.itemName}
                        </option>
                      ))}
                    </select>{" "}
                    <br></br>
                    {formErrors[i]?.itemName && (
                      <span className="error">{formErrors[i]?.itemName}</span>
                    )}
                  </div>
                  <div>
                    <img src={weight} className ="weight" onClick={()=>{getGivenWeight(i)}}></img>
                  </div>
                  
                  <div>
                   
                    <input
                      type="text"
                      placeholder="Wt"
                      value={row.weight}
                      onChange={(e) =>
                        handleGoldRowChange(i, "weight", e.target.value)
                      }
                      className="input givenInput"
                    />{" "}
                     
                    <br></br>
                   
                    {formErrors[i]?.weight && (
                      <span className="error">{formErrors[i].weight}</span>
                    )}
                  </div>
                  

                 <div> <span className="operator">x</span></div>
                  <div>
                    <input
                      type="text"
                      placeholder="Touch"
                      value={row.touch}
                      onChange={(e) =>
                        handleGoldRowChange(i, "touch", e.target.value)
                      }
                      className="input givenTouch"
                    />
                    <br></br>
                    {formErrors[i]?.touch && (
                      <span className="error">{formErrors[i].touch}</span>
                    )}
                  </div>
                  <div>
                      {!row.id && (
                    <MdDeleteForever
                      className="deleteIcon"
                      onClick={() => {
                        handleRemovegold(i);
                      }}
                    />
                  )}
                  </div>
                  
                </div>
              ))}
              </div>
               <div className="Balance">
                   <button
                onClick={() =>
                  setGoldRows([
                    ...goldRows,
                    {username: localStorage.getItem("username"), itemName: "", weight: "", touch: "91.70" },
                  ])
                }
                className="circle-button"
              >
                +
              </button>
              <div className="total-gold-container">
                <span className="total-gold-label">Total:</span>
                <span className="total-gold-value">
                  {format(totalGoldWeight)}
                </span>
              </div>
               </div>
            </div>

            <div className="section">
              {/* <h4 className="section-title">Balance</h4> */}
              <div className="balance-block">
                <div className="balance-display-row">
                  <span className="balance-label">
                    {balance >= 0 ? "Opening Balance" : "ExceesBalance"}:
                  </span>
                  <span className="balance-value">{format(balance)}</span>
                </div>
                <div className="balance-display-row">
                  <span className="balance-label">Total:</span>
                  <span className="balance-value balanceLine">
                    {format(totalGoldWeight)}
                  </span>
                </div>
              
                <div className="balance-display-row">
                  <span className="balance-label">Total Balance:</span>
                  <span className="balance-value">{format(totalBalance)}</span>
                </div>
              </div>
            </div>

            <div className="section itemDelivery" style={{opacity:edit?1:0.3}} >
              <h3 >Item Delivery</h3>
              <div className="itemsGrid">
                {itemRows.map((item, i) => (
                <div key={i} className="row " >
                    <span style={{marginTop:"5px"}}>{i<9 ? (`0${i+1}.`):(`${i+1}.`)} </span> 
                  <div >
                    <input
                      type="text"
                      placeholder="Wt"
                      value={item.weight}
                      onChange={(e) =>
                        handleItemRowChange(i, "weight", e.target.value)
                      }
                      className="input itemwt"
                      disabled={!edit}
                    />
                    <br></br>
                    {itemErrors[i]?.weight && (
                      <span className="error">{itemErrors[i]?.weight}</span>
                    )}
                  </div>
                   <div>
                    {edit && <img src={weight} className ="weight" onClick={()=>{getGivenWeight(i,"item")}}></img> }
                   
                  </div>
              
                  <div>
                    <select
                      value={item.itemName}
                      onChange={(e) =>
                        handleItemRowChange(i, "itemName", e.target.value)
                      }
                      className="itemname-select"
                      disabled={!edit}
                    >
                      <option value="">Item</option>
                      {masterItems.map((option, index) => (
                        <option key={index} value={option.itemName}>
                          {option.itemName}
                        </option>
                      ))}
                    </select>
                    <br></br>
                    {itemErrors[i]?.itemName && (
                      <span className="error">{itemErrors[i]?.itemName}</span>
                    )}
                  </div>
                   <div > 
                      <select
                        value={item.sealName || ""}
                        onChange={(e) =>
                          handleItemRowChange(i, "sealName", e.target.value)
                        }
                        className="seal-select"
                       
                      >
                        <option value="">Seal</option>
                        {masterSeal.map((option, index) => (
                          <option key={index} value={option.sealName}>
                            {option.sealName}
                          </option>
                        ))}
                      </select>
                      <br></br>
                      {itemErrors[i]?.sealName && (
                        <span className="error">{itemErrors[i]?.sealName}</span>
                      )}
                    </div>

                  {!item.id && (
                    <MdDeleteForever
                      className="deleteIcon"
                      onClick={() => {
                        handleRemoveItem(i);
                      }}
                    />
                  )}
                </div>
              ))}
              </div>
              <button
                onClick={() =>
                  setItemRows([...itemRows, { weight: "", name: "" }])
                }
                className="circle-button"
                disabled={!edit}
                style={{opacity:edit?1:0.3}}
              >
                +
              </button>
              <div className="total-gold-container">
                <span className="total-gold-label">Total Item Weight:</span>
                <span className="total-gold-value">
                  {format(totalItemWeight)}
                </span>
              </div>
          <div className="wastageBox">
              <div className="deduction-section" >
                <h3>BC Section </h3>
                {deductionRows.map((deduction, i) => (
                  <div key={i} className="deduction-row">
                      <span style={{marginTop:"5px"}}>{i<9 ? (`0${i+1}.`):(`${i+1}.`)} </span> 
                    <div>
                      <select
                        value={deduction.type}
                        onChange={(e) =>
                          handleDeductionChange(i, "type", e.target.value)
                        }
                        className="deduction-select"
                        disabled={!edit}
                      >
                        {stoneOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <br></br>
                      {deductionErrors[i]?.type && (
                        <span className="error">
                          {deductionErrors[i]?.type}
                        </span>
                      )}
                    </div>
                    <div>
                      {deduction.type === "Others" && (
                        <input
                          disabled={!edit}
                          type="text"
                          placeholder="Specify type"
                          value={deduction.customType}
                          onChange={(e) =>
                            handleDeductionChange(
                              i,
                              "customType",
                              e.target.value
                            )
                          }
                          className="deduction-input"
                        />
                      )}
                      <br></br>
                      {deductionErrors[i]?.customType && (
                        <span className="error">
                          {deductionErrors[i]?.customType}
                        </span>
                      )}
                    </div>
                    <div>
                      <input
                        disabled={!edit}
                        type="text"
                        value={deduction.weight}
                        onChange={(e) =>
                          handleDeductionChange(i, "weight", e.target.value)
                        }
                        className="deduction-input"
                        placeholder="Weight"
                      />
                      
                      <br></br>
                      {deductionErrors[i]?.weight && (
                        <span className="error">
                          {deductionErrors[i]?.weight}
                        </span>
                      )}
                    </div>
                    <div className="delBtn">
                       {!deduction.id && (
                      <MdDeleteForever
                        className="deleteIcon"
                        onClick={() => {
                          handleRemovededuction(i);
                        }}
                      />
                    )}
                    </div>
                   
                  </div>
                ))}
                <button
                  onClick={() =>
                    setDeductionRows([
                      ...deductionRows,
                      { type: "Stone", customType: "", weight: "" },
                    ])
                  }
                  disabled={!edit}
                  className="circle-button"
                >
                  +
                </button>
               
              </div>

              <div className="wastageSection">
                  <h3>Wastage Section </h3>
         
               <div className="wastageInputBox">
                 
                  <input
                    readOnly
                    type="number"
                    value={netWeight}
                    
                  />
                  <span className="operator">x</span>
                  <div  className="watageGoldSmith">
                    <input
                      type="text"
                      value={goldSmithWastage}
                     
                      onChange={(e) => {
                        handleGoldSmithChange(e);
                      }}
                      disabled={!edit}
                    />{" "}
                    <br></br>
                    {wastageErrors?.wastage && (
                      <span className="error">{wastageErrors?.wastage}</span>
                    )}
                  </div>
                  <span className="operator">=</span>
                  <input
                    readOnly
                    type="number"
                    value={wastage}
                   
                  />
                </div>
                <div className="finalTotalContainer">
                <span className="finalTotal">
                  <strong>Total</strong> = {format(totalItemWeight)} +{" "}
                  {parseFloat(wastage).toFixed(3)}
                </span>
              
                <span className="finalTotal">
                  {" "}
                  = <strong> {format(finalTotal)}</strong>
                </span>
              </div>
           
              </div>
             </div>
              <div className="total-purity-container">
                  <span className="total-purity-label">
                    Total Stone Wt:
                  </span>
                  <span className="total-purity-value">
                    {format(totalDeductionWeight)}
                  </span>
                </div>
              <div className="net-weight-display">
                <span className="header-label">Net Weight:</span>
                <span className="net-weight-value" style={{ color: "blue" }}>
                  {netWeight}
                </span>
              </div>
             
              

              <div className="recevedSection" >
                <h3>Received Section</h3>
                {received.map((row, i) => (
                  <div key={i} className="row">
                      <span style={{marginTop:"5px"}}>{i<9 ? (`0${i+1}.`):(`${i+1}.`)} </span> 
                 
                    <div>
                      <input
                        type="number"
                        placeholder="Weight"
                        value={row.weight}
                        onChange={(e) =>
                          handleRecivedChange(i, "weight", e.target.value)
                        }
                        onWheel={(e) => e.target.blur()}
                        className="input"
                      />
                      <br></br>
                      {receivedErrors[i]?.weight && (
                        <span style={{ color: "red", fontSize: "16px" }}>
                          {receivedErrors[i].weight}
                        </span>
                      )}
                    </div>
                    <span className="operator">x</span>
                  
                    <div>
                      <input
                        type="number"
                        placeholder="Touch"
                        value={row.touch}
                        onChange={(e) =>
                          handleRecivedChange(i, "touch", e.target.value)
                        }
                        className="input"
                      />
                      {receivedErrors[i]?.touch && (
                        <span style={{ color: "red", fontSize: "16px" }}>
                          {receivedErrors[i].touch}
                        </span>
                      )}
                    </div>
                     <div>
                    <img src={weight} className ="weight" onClick={()=>{getGivenWeight(i,"receive")}}></img>
                  </div>
                    {!row.id && (
                      <MdDeleteForever
                        className="deleteIcon"
                        onClick={() => {
                          handleRemoveReceived(i);
                        }}
                      />
                    )}
                    {/* <span className="operator">=</span>
            <input
              type="text"
              readOnly
              placeholder="Purity"
              value={format(row.purity)}
              className="input-read-only"
            /> */}
                  </div>
                ))}
                {itemRows.length>0 && <button
                  onClick={() =>
                    setReceived([...received, { weight: 0, touch: 91.7 }])
                  }
                  className="circle-button" 
                  // this code used for does'nt open previous job card and if its last job card and its status true that time is not work
                 disabled={
                   edit? !lastJobCardId
                    ? true // If lastJobCard doesn't exist yet, disable the button
                    : jobCardId !==lastJobCardId
                   ? true
                   : lastIsFinish === "false"
                   ? false
                   : true : true
                     
                    }

                >
                  +
                </button>}
                <div className="total-purity-container">
                  <span className="total-purity-label">Total:</span>
                  <span className="total-purity-value">
                    {format(totalReceivedWeight)}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
              className="button"
            >
              <Button
                variant="contained"
                color="success"
                style={{ marginRight: "15px" }}
                onClick={() => SaveJobCard()}
                disabled={edit?isFinished==="true"? true:false:false}
              >
                {edit ?"UPDATE":"SAVE"}
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "blue" }}
                onClick={() => SaveJobCard("print")}
              >
                PRINT
              </Button>
            </div>

              {balanceDifference > 0 ? (
                <p className="balance-text-goldsmith">
                  Goldsmith should give balance:
                  <span className="balance-amount">
                    {format(balanceDifference)}
                  </span>
                </p>
              ) : balanceDifference < 0 ? (
                <p className="balance-text-owner">
                  Owner should give balance:
                  <span className="balance-amount">
                    {format(balanceDifference)}
                  </span>
                </p>
              ) : (
                <p className="balance-text-owner">
                  balance Nil:
                  <span className="balance-amount">
                    {format(balanceDifference)}
                  </span>
                </p>
              )}
         
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewJobCard;
