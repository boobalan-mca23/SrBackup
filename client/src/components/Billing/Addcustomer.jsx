
import React, { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Box,
  Button,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"; 

const AddCustomer = ({ onAddCustomer }) => {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setCustomer({ name: "", address: "", phone: "" });
    setOpen(false);
  };

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (customer.name && customer.address && customer.phone) {
      const newCustomer = {
        id: `C${Date.now()}`,
        customer_name: customer.name,
        address: customer.address,
        phone_number: customer.phone,
      };
      onAddCustomer(newCustomer);
      handleClose();
    }
  };

  return (
    <Box sx={{ display: "inline-block", m: 1 }}>
      <Tooltip title="Add Customer" arrow>
        <IconButton
          color="primary"
          onClick={handleClickOpen}
          sx={{
            backgroundColor: "#1DA3A3",
            marginLeft: "60rem",
            color: "white",
            "&:hover": {
              backgroundColor: "#1DA3A3",
              opacity: 0.9,
            },
          }}
        >
          <PersonAddAlt1Icon fontSize="medium" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Customer Name"
            name="name"
            fullWidth
            variant="outlined"
            value={customer.name}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Address"
            name="address"
            fullWidth
            variant="outlined"
            value={customer.address}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            name="phone"
            fullWidth
            variant="outlined"
            value={customer.phone}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              color: "black",
              borderColor: "black",
              "&:hover": {
                borderColor: "black",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": {
                backgroundColor: "black",
                opacity: 0.9,
              },
            }}
          >
            Save Customer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddCustomer;