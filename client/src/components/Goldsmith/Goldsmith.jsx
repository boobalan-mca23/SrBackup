import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Goldsmith.css";
import { Link } from "react-router-dom";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import axios from "axios";
import NewJobCard from "./Newjobcard";

const Goldsmith = () => {
  const [goldsmith, setGoldsmith] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedGoldsmith, setSelectedGoldsmith] = useState(null);
  const [goldRows, setGoldRows] = useState([]);
  const [itemRows, setItemRows] = useState([]);
  const [deductionRows, setDeductionRows] = useState([]);
  const [received, setReceived] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [jobCardError, setJobCardError] = useState({});
  const [jobCardId, setJobCardId] = useState(null);
  const [jobCardTotal, setJobCardTotal] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [selectedName, setSelectedName] = useState({});
  const [masterItems, setMasterItems] = useState([]);
  const [masterSeal, setMasterSeal] = useState([]);
  const [noJobCard, setNoJobCard] = useState({});
  const [lastJobCard,setLastJobCard]=useState({})
  const [goldSmithWastage,setGoldSmithWastage]=useState(0)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    wastage: "",
  });
  const [wastageErr, setWastageErr] = useState({});
  const [phoneErr, setPhoneErr] = useState({});
  const formRef = useRef({
    name: null,
    phone: null,
    address: null,
    wastage: null,
    update: null,
  });
  const [currentJob,setCurrentJob]=useState("")
  


  useEffect(() => {
    const fetchGoldsmiths = async () => {
      try {
        const response = await fetch(`${BACKEND_SERVER_URL}/api/goldsmith`);
        const data = await response.json();
        setGoldsmith(data);
        console.log("goldSmith Data", data);
      } catch (error) {
        console.error("Error fetching goldsmith data:", error);
      }
    };
    //  await axios.get(`${BACKEND_SERVER_URL}/api/masterseal`);
    const fetchMasterItem = async () => {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/master-items`);
      setMasterItems(res.data);
    };
    const fetchMasterSealItem  = async () => {
      const res =await axios.get(`${BACKEND_SERVER_URL}/api/masterseal`);
      setMasterSeal(res.data);
    };

    fetchGoldsmiths();
    fetchMasterItem();
    fetchMasterSealItem();
  }, []);

  const handleEditClick = (goldsmith) => {
    setSelectedGoldsmith(goldsmith);
    console.log('w',goldsmith.wastage)
    setFormData({
      name: goldsmith.name,
      phone: goldsmith.phone,
      address: goldsmith.address,
      wastage: goldsmith.wastage,
    });
    setOpenEditDialog(true);
  };

  const handleWastage = (val) => {
    // Check if val is a valid number (including decimal)
    if (!/^\d*\.?\d*$/.test(val)) {
      setWastageErr({ err: "Please enter a valid number" });
      // still update input so user can correct it
      setFormData((prev) => ({ ...prev, wastage: val }));
      return;
    }
    // Valid input
    setFormData((prev) => ({ ...prev, wastage: val }));
    setWastageErr({});
  };

  const handlePhoneChange = (val) => {
    console.log("phoneval", val);

    // Allow empty input (user is deleting text)
    if (val === "") {
      setPhoneErr({ err: "" });
      setFormData((prev) => ({ ...prev, phone: val }));
      return;
    }

    // Check if the value contains only digits
    if (!/^\d*$/.test(val)) {
      setPhoneErr({ err: "Please enter digits only" });
      setFormData((prev) => ({ ...prev, phone: val })); // still allow user to correct
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

    setFormData((prev) => ({ ...prev, phone: val }));
  };

  const handleEditSubmit = async () => {
    if (wastageErr.err || phoneErr.err) {
      toast.warn("Enter Valid Details");
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/goldsmith/${selectedGoldsmith.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
    
      if (response.ok) {
        toast.success("Goldsmith updated successfully");
        console.log('response',response)
        setGoldsmith((prev) =>
          prev.map((g) =>
            g.id === selectedGoldsmith.id ? { ...g, ...formData } : g
          )
        );

        setOpenEditDialog(false);
      } else {
        toast.error("Failed to update goldsmith");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.warn(error.response.data.message);
      } else {
        toast.error("Failed to add goldsmith. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this goldsmith?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/goldsmith/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setGoldsmith((prev) => prev.filter((g) => g.id !== id));
        toast.success("Goldsmith deleted successfully");
      } else {
        toast.error("Failed to delete goldsmith");
      }
    } catch (error) {
      toast.error(responseData.message);
    }
  };

  const handleUpdateJobCard = async (
    totalGoldWt,
    totalItemWt,
    totalDeductionWt,
    totalWastage,
    totalBalance,
    openBal
  ) => {
    console.log("update");

    const payload = {
      goldRows: goldRows,
      itemRow: itemRows,
      deductionRows: deductionRows,
      receivedAmount: received,
      goldSmithBalance: {
        id: selectedName.id,
        balance: totalBalance,
      },
      total: {
        id: jobCardTotal[0]?.id,
        givenWt: totalGoldWt,
        itemWt: totalItemWt,
        stoneWt: totalDeductionWt,
        wastage: totalWastage,
        balance: totalBalance,
        openBal: openBal,
        goldSmithWastage:goldSmithWastage,
      },
    };
    console.log("payload update", payload);

    try {
      const response = await axios.put(
        `${BACKEND_SERVER_URL}/api/job-cards/${selectedName.id}/${jobCardId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 400) {
        alert(response.data.message);
      }
      console.log("Response:", response.data.jobCards); // success response

      setOpen(false);
      setEdit(false);

      toast.success(response.data.message);
    } catch (err) {
      console.error("POST Error:", err.response?.data || err.message);
      toast.error(
        err.message || "An error occurred while creating the job card"
      );
    }
  };
  
 
   let filterGoldSmith= goldsmith.length>=1 ? goldsmith.filter((gs) => {
    const nameMatch =
      gs.name && gs.name.toLowerCase().startsWith(searchTerm.toLowerCase());
    const phoneMatch = gs.phone && gs.phone.includes(searchTerm);
    const addressMatch =
      gs.address && gs.address.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || phoneMatch || addressMatch;
  }):[]
  
   

  const handleJobCardId = (id) => {
    const num = Number(id);
    if (isNaN(num)) {
      setJobCardError({ err: "Please Enter Vaild Input" });
    } else {
      setJobCardError({});
      setJobCardId(num);
    }
  };
  const handleSearch = () => {
    if (!jobCardError.err && !isNaN(jobCardId) && jobCardId !== null) {
      const fetchJobCardById = async () => {
        try {
          const res = await fetch(
            `${BACKEND_SERVER_URL}/api/job-cards/${jobCardId}/jobcard`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await res.json();
          if (res.status === 404) {
            setOpen(false);
            setEdit(false);
            setNoJobCard({ err: "No Job Card For This Id" });
          } else {
            console.log("data", data);
            setGoldRows(data.jobcard[0].givenGold);
            setItemRows(
              data.jobcard[0].deliveryItem.length >= 1
                ? data.jobcard[0].deliveryItem
                : []
            );
            setDeductionRows(
              data.jobcard[0].additionalWeight.length >= 1
                ? data.jobcard[0].additionalWeight
                : []
            );
            setReceived(data.jobcard[0].goldSmithReceived);
            setSelectedName(data.jobcard[0].goldsmith);
            setJobCardTotal(data.jobcard[0].jobCardTotal);
            setGoldSmithWastage(Number(data.jobcard[0].jobCardTotal[0].goldSmithWastage)?.toFixed(3))
            setCurrentJob(data.jobcard[0].jobCardTotal[0].isFinished)
            setLastJobCard(data.lastJobCard||{})
            setOpeningBalance(data.jobcard[0].jobCardTotal[0].openBal);
            setOpen(true);
            setEdit(true);
            setNoJobCard({});
          }
        } catch (err) {
          toast.error(err.message);
        }
      };
      fetchJobCardById();
    }
  };

  return (
    <div className="homeContainer">
      <Paper className="customer-details-container " elevation={3} sx={{ p: 3 }} >
        <Typography variant="h5" align="center" gutterBottom>
          Goldsmith Details
        </Typography>

        <TextField
          label="Search Goldsmith Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px",
              width: "18rem",
              backgroundColor: "#f8f9fa",
              "&.Mui-focused": {
                backgroundColor: "#ffffff",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: "#777" }} />
              </InputAdornment>
            ),
          }}
        />

        <div className="tableContainer">
          <Table>
          <TableHead
           
            className="thead"
          >
            <TableRow>
               <TableCell align="center" className="tableCell" >
                <strong>S.No</strong>
              </TableCell>
              <TableCell align="center" className="tableCell" >
                <strong>Goldsmith Name</strong>
              </TableCell>
              <TableCell align="center" className="tableCell">
                <strong>Phone Number</strong>
              </TableCell>
              <TableCell align="center" className="tableCell">
                <strong>Address</strong>
              </TableCell>
              <TableCell align="center" className="tableCell">
                <strong>GoldSmith Wastage</strong>
              </TableCell>
              <TableCell align="center" className="tableCell">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterGoldSmith.length > 0 ? (
              filterGoldSmith.map((goldsmith, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{ index + 1}</TableCell>
                  <TableCell align="center">{goldsmith.name}</TableCell>
                  <TableCell align="center">{goldsmith.phone}</TableCell>
                  <TableCell align="center">{goldsmith.address}</TableCell>
                  <TableCell align="center">{(Number(goldsmith.wastage)).toFixed(3)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Jobcard">
                      <Link
                        to={`/jobcard/${goldsmith.id}/${goldsmith.name}`}
                        state={{
                          phone: goldsmith.phone,
                          address: goldsmith.address,
                        }}
                        style={{ marginRight: "10px", color: "#1976d2" }}
                      >
                        <AssignmentIndOutlinedIcon
                          style={{ cursor: "pointer" }}
                        />
                      </Link>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <EditIcon
                        style={{
                          cursor: "pointer",
                          marginRight: "10px",
                          color: "#388e3c",
                        }}
                        onClick={() => handleEditClick(goldsmith)}
                      />
                    </Tooltip>

                    {/* <Tooltip title="Delete">
                      <DeleteIcon
                        style={{ cursor: "pointer", color: "#d32f2f" }}
                        onClick={() => handleDelete(goldsmith.id)}
                      />
                    </Tooltip> */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No goldsmith details available.
                </TableCell>
              </TableRow>
            )}
            
          </TableBody>
          
        </Table>
         
        </div>
       
      </Paper>

      <div className="customer-details-container">
        <Typography variant="h6" gutterBottom>
          Search Job Card
        </Typography>
        <div className="searchBox">
          <div className="inputWithError">
            <TextField
              id="outlined-basic"
              label="JobCard Id"
              onChange={(e) => handleJobCardId(e.target.value)}
              variant="outlined"
              autoComplete="off"
            />
            {jobCardError.err && (
              <p className="errorText">{jobCardError.err}</p>
            )}
            {noJobCard.err && <p className="errorText">{noJobCard.err}</p>}
          </div>

          <Button
            className="searchBtn"
            variant="contained"
            onClick={handleSearch}
            disabled={!!jobCardError.err}
          >
            Search
          </Button>
        </div>
      </div>

      {open && (
        <NewJobCard
          name={selectedName.name}
          goldSmithWastage={ goldSmithWastage}
          setGoldSmithWastage={setGoldSmithWastage}
          balance={openingBalance}
          goldRows={goldRows}
          setGoldRows={setGoldRows}
          itemRows={itemRows}
          setItemRows={setItemRows}
          deductionRows={deductionRows}
          setDeductionRows={setDeductionRows}
          received={received}
          setReceived={setReceived}
          masterItems={masterItems}
          masterSeal={masterSeal}
          isFinished={currentJob}
          handleUpdateJobCard={handleUpdateJobCard}
          jobCardId={jobCardId}
          lastJobCardId={lastJobCard.jobcardId}
          lastIsFinish={lastJobCard.isFinished}
          onclose={() => {
            setOpen(false);
          }}
          open={open}
          edit={edit}
        />
      )}

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Goldsmith</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={formData.name || ""}
            fullWidth
            margin="normal"
            inputRef={(el) => (formRef.current.name = el)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown") {
                formRef.current.phone.focus();
              }
              if (e.key === "ArrowUp") {
                formRef.current.name.focus();
              }
            }}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Phone"
            value={formData.phone || ""}
            inputRef={(el) => (formRef.current.phone = el)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown") {
                formRef.current.address.focus();
              }
              if (e.key === "ArrowUp") {
                formRef.current.name.focus();
              }
            }}
            fullWidth
            margin="normal"
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
          {phoneErr.err && <p style={{ color: "red" }}>{phoneErr.err}</p>}
          <TextField
            label="Address"
            value={formData.address || ""}
            fullWidth
            margin="normal"
            inputRef={(el) => (formRef.current.address = el)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown") {
                formRef.current.wastage.focus();
              }
              if (e.key === "ArrowUp") {
                formRef.current.phone.focus();
              }
            }}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <TextField
            label="Wastage"
            value={formData.wastage || ""}
            fullWidth
            inputRef={(el) => (formRef.current.wastage = el)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown") {
                formRef.current.update.focus();
              }
              if (e.key === "ArrowUp") {
                formRef.current.address.focus();
              }
            }}
            margin="normal"
            onChange={(e) => handleWastage(e.target.value)}
          />
          {wastageErr.err && <p style={{ color: "red" }}>{wastageErr.err}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            ref={(el) => (formRef.current.update = el)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Goldsmith;
