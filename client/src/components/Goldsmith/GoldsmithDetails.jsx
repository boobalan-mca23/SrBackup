
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import Jobcarddd from "./Jobcarddd";

const GoldsmithDetails = () => {
  const { id, name } = useParams();
  const location = useLocation();
  const { phone, address } = location.state || {};

  const [openPopup, setOpenPopup] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
  const [showEntryPopup, setShowEntryPopup] = useState(false);

  const handleAddClick = () => setOpenPopup(true);
  const handleClose = () => setOpenPopup(false);

  const handleEntrySave = (newEntry) => {
    setEntries((prev) => [...prev, newEntry]);
    handleClose();
  };

  const handleViewClick = (index) => {
    setSelectedEntryIndex(index);
    setShowEntryPopup(true);
  };

  const handleEntryUpdate = (updatedEntry) => {
    const updated = [...entries];
    updated[selectedEntryIndex] = updatedEntry;
    setEntries(updated);
    setShowEntryPopup(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: "auto" }}>

      <Box
        sx={{
          mb: 3,
          p: 2,
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          
        }}
      >
        <Typography variant="h5" gutterBottom>
          Goldsmith Details
        </Typography>
        <Typography>
          <strong>ID:</strong> {id}
        </Typography>
        <Typography>
          <strong>Name:</strong> {name}
        </Typography>
        <Typography>
          <strong>Phone:</strong> {phone || "N/A"}
        </Typography>
        <Typography>
          <strong>Address:</strong> {address || "N/A"}
        </Typography>
      </Box>

  
      <Button variant="contained" onClick={handleAddClick} sx={{ mb: 3 }}>
        Add Jobcard
      </Button>


      <Dialog
        open={openPopup}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: { backgroundColor: "aliceblue", width: "99rem !important" },
        }}
      >
        <DialogTitle>
          Jobcard Details
          <Button
            onClick={handleClose}
            sx={{ float: "right" }}
            color="error"
            variant="outlined"
            
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Jobcarddd name={name} phone={phone} address={address} onSave={handleEntrySave} />
        </DialogContent>
      </Dialog>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Saved Jobcards
      </Typography>

      {entries.length === 0 ? (
        <Typography>No jobcards added yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="jobcards table">
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} align="center">
                  S.No
                </TableCell>
                <TableCell rowSpan={2} align="center">
                  Item
                </TableCell>
                <TableCell colSpan={6} align="center">
                  Given Weight Details
                </TableCell>
                <TableCell rowSpan={2} align="center">
                  Product Weight
                </TableCell>
                <TableCell rowSpan={2} align="center">
                  Wastage
                </TableCell>
                <TableCell rowSpan={2} align="center">
                  Actions
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Given Weight</TableCell>
                <TableCell align="center">Touch</TableCell>
                <TableCell align="center">Purity</TableCell>
                <TableCell align="center">Final Touch</TableCell>
                <TableCell align="center">Copper</TableCell>
                <TableCell align="center">Final Weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>{entry.item}</TableCell>
                  <TableCell align="center">{entry.givenWeight}</TableCell>
                  <TableCell align="center">{entry.touch}</TableCell>
                  <TableCell align="center">{entry.purity}</TableCell>
                  <TableCell align="center">{entry.finalTouch}</TableCell>
                  <TableCell align="center">{entry.copper}</TableCell>
                  <TableCell align="center">{entry.finalWeight}</TableCell>
                  <TableCell>
                    {entry.productItems && entry.productItems.length > 0 ? (
                      entry.productItems.map((item, idx) => (
                        <div key={idx}>
                          {item.name} - {item.weight}
                        </div>
                      ))
                    ) : (
                      <em>No Products</em>
                    )}
                  </TableCell>
                  <TableCell align="center">{entry.wastage || ""}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewClick(index)}
                    >
                      View / Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {showEntryPopup && selectedEntryIndex !== null && (
        <Dialog open={showEntryPopup} onClose={() => setShowEntryPopup(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Jobcard Entry</DialogTitle>
          <DialogContent dividers>
            <Jobcarddd
              name={name}
              phone={phone}
              address={address}
              existingEntry={entries[selectedEntryIndex]}
              onUpdate={handleEntryUpdate}
              isEditing
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default GoldsmithDetails;


