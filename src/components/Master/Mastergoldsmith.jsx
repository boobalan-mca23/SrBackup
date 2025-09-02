import React, { use, useState ,useEffect} from "react";
import "./Mastergoldsmith.css";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from "@mui/material";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRef } from "react";


function Mastergoldsmith() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goldsmithName, setgoldsmithName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const[phoneErr,setPhoneErr]=useState({})
  const [wastage, setWastage] = useState(0);
  const [wastageErr,setWastageErr]=useState({})
  const [address, setAddress] = useState("");
  const [goldsmith, setGoldsmith] = useState([]);
  const goldSmithRef=useRef()
  const phoneRef=useRef()
  const wastageRef=useRef()
  const addressRef=useRef()
  const saveBtn=useRef()

  const openModal = () => {
    setIsModalOpen(true);
    setgoldsmithName("");
    setPhoneNumber("");
    setAddress("");
    setWastage("")
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveGoldsmith = async () => {
    if (goldsmithName.trim()) {
      const newGoldsmith = {
        name: goldsmithName,
        phonenumber: phoneNumber || null,
        address: address || null,
        wastage:wastage || null
      };
       if(wastageErr.err || phoneErr.err){
         toast.warn('Enter Valid Details')
         return;
       }
       console.log('newGoldSmith',newGoldsmith)
      try {
        const response = await axios.post(
          `${BACKEND_SERVER_URL}/api/goldsmith`,
          newGoldsmith
        );
        
        setGoldsmith([...goldsmith, response.data]);
        closeModal();
        toast.success("Goldsmith added successfully!");
      } catch (error) {
       if (error.response && error.response.data && error.response.data.message) {
           toast.warn(error.response.data.message);
       } else {
          toast.error("Failed to add goldsmith. Please try again.");
         }
      }
    } else {
      
      toast.warn("Please enter the goldsmith's name.");
    }
  };

  const handlePhoneChange = (val) => {
    // Allow empty input (user is deleting text)
  if (val === "") {
    setPhoneErr({ err: "" }); 
    setPhoneNumber(val)
    return;
  }

  // Check if the value contains only digits
  if (!/^\d*$/.test(val)) {
    setPhoneErr({ err: "Please enter digits only" });
    setPhoneNumber(val) // still allow user to correct
    return;
  }

  // Check the length
  if (val.length < 10) {
    setPhoneErr({ err: "Phone number length is too short" });
  } else if (val.length > 10) {
    setPhoneErr({ err: "Phone number length is too long" });
  } else {
    setPhoneErr({ err: "" }); // valid case
  }
  setPhoneNumber(val)
};


  const handleWastage = (val) => {
  // Check if val is a valid number (including decimal)
  if (!/^\d*\.?\d*$/.test(val)) {
    setWastageErr({ err: "Please enter a valid number" });
    setWastage(val); // still update input so user can correct it
    return;
  }

  // Valid input
  setWastage(val);
  setWastageErr({});
};
   useEffect(()=>{
       const fetchAllGoldSmith=async()=>{
          const response=await axios.get(`${BACKEND_SERVER_URL}/api/goldsmith`)
          setGoldsmith(response.data||[])
          console.log('res',response)
       }
       fetchAllGoldSmith()
   },[])

  return (
    <div className="customer-container">
      <Button
        style={{
          backgroundColor: "#F5F5F5",
          color: "black",
          borderColor: "#25274D",
          borderStyle: "solid",
          borderWidth: "2px",
        }}
        variant="contained"
        onClick={openModal}
      >
        Add Goldsmith
      </Button>
     
      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogTitle>Add New Goldsmith</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Goldsmith Name"
            type="text"
            fullWidth
            inputRef={goldSmithRef}
            onKeyDown={(e)=>{
              if(e.key==="Enter" || e.key==="ArrowDown"){
                phoneRef.current.focus()
              }
            }}
            value={goldsmithName}
            onChange={(e) => setgoldsmithName(e.target.value)}
            autoComplete="off"
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            inputRef={phoneRef}
            onKeyDown={(e)=>{
              if(e.key==="Enter" || e.key==="ArrowDown"){
                addressRef.current.focus()
              }
              if(e.key==="ArrowUp"){
                goldSmithRef.current.focus()
              }
            }}
            value={phoneNumber}
            onChange={(e) =>handlePhoneChange(e.target.value)}
            autoComplete="off"
          />
           {phoneErr.err&&<p style={{color:"red"}}>{phoneErr.err}</p>}
          <TextField
            margin="dense"
            label="Address"
            type="text"
            fullWidth
            multiline
            rows={4}
            inputRef={addressRef}
             onKeyDown={(e)=>{
              if(e.key==="Enter"||e.key==="ArrowDown"){
                wastageRef.current.focus()
              }
              if(e.key==="ArrowUp"){
                phoneRef.current.focus()
              }
            }}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="off"
          />

          <TextField
            autoFocus
            margin="dense"
            label="Goldsmith Wastage"
            type="text"
            fullWidth
            inputRef={wastageRef}
             onKeyDown={(e)=>{
              if(e.key==="Enter"||e.key==="ArrowDown"){
                saveBtn.current.focus()
              }
              if(e.key==="ArrowUp"){
                addressRef.current.focus()
              }
            }}
            value={wastage}
            onChange={(e) => handleWastage(e.target.value)}
            autoComplete="off"
            
          />
          {wastageErr.err&&<p style={{color:"red"}}>{wastageErr.err}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary" >
            Cancel
          </Button>
          <Button onClick={handleSaveGoldsmith} color="primary" ref={saveBtn}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
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

      {goldsmith.length > 0 && (
        <Paper className="customer-table">
          <h2>Gold Smith InforMations</h2>
          <table border="1" width="100%">
            <thead>
              <tr>
                <th>S No</th>
                <th>Goldsmith Name</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Wastage</th>
              </tr>
            </thead>
            <tbody>
              {goldsmith.map((goldsmith, index) => (
                <tr key={index}>
                  <td>{index+1}</td>
                  <td>{goldsmith.name}</td>
                  <td>{goldsmith.phone}</td>
                  <td>{goldsmith.address}</td>
                  <td>{(Number(goldsmith.wastage)).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}
    </div>
  );
}

export default Mastergoldsmith;
