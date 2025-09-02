import React, { useState, useRef } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  IconButton,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableHead,
  Paper,
  TableContainer,
} from "@mui/material";

const Receipt = ({ initialGoldRate = 0 }) => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([
    {
      _id: "1",
      name: "Customer 1",
      phone: "1234567890",
      balance: 10,
      expure: 0,
    },
    {
      _id: "2",
      name: "Customer 2",
      phone: "9876543210",
      balance: 0,
      expure: 5,
    },
    {
      _id: "3",
      name: "Customer 3",
      phone: "5555555555",
      balance: 0,
      expure: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [allReceipts, setAllReceipts] = useState([]);
  const inputRefs = useRef({});
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [excess, setExcess] = useState(0);
  const [goldRate, setGoldRate] = useState(initialGoldRate);
  const [customerPure, setCustomerPure] = useState(0);
  const [customerExcees, setCustomerExcees] = useState(0);
  const [customerCashBalance, setCustomerCashBalance] = useState(0);

  const handleGoldRate = (goldValue) => {
    const tempRows = [...rows];
    for (const r of tempRows) {
      r.goldRate = goldValue;
    }
    setRows(tempRows);
    setGoldRate(goldValue);
  };

  const createNewRow = () => ({
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    goldRate: goldRate,
    givenGold: "",
    touch: "",
    purityWeight: "",
    amount: "",
  });

  const handleCustomerChange = (event) => {
    const customerId = event.target.value;
    setSelectedCustomer(customerId);

    // Mock data for receipts when customer is selected
    if (customerId) {
      setAllReceipts([
        {
          date: "2023-05-15",
          goldRate: 5000,
          givenGold: 10,
          touch: 92,
          purityWeight: 9.2,
          amount: 46000,
        },
        {
          date: "2023-06-20",
          goldRate: 5200,
          givenGold: 5,
          touch: 90,
          purityWeight: 4.5,
          amount: 23400,
        },
      ]);
    }
  };

  const handleInputChange = (id, field, value, index) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        const goldRate = parseFloat(updatedRow.goldRate) || 0;
        const givenGold = parseFloat(updatedRow.givenGold) || 0;
        const touch = parseFloat(updatedRow.touch) || 0;
        const amount = parseFloat(updatedRow.amount) || 0;

        if (field === "goldRate") {
          updatedRow.amount = (
            updatedRow.purityWeight * updatedRow.goldRate
          ).toFixed(2);
        }
        if (field === "givenGold" || field === "touch") {
          const purityWeight = givenGold * (touch / 100);
          updatedRow.purityWeight = purityWeight.toFixed(3);
        } else if (field === "amount" && goldRate > 0) {
          const purityWeight = amount / goldRate;
          updatedRow.purityWeight = purityWeight.toFixed(3);
        } else if (field === "goldRate" && updatedRow.purityWeight > 0) {
          updatedRow.amount = (updatedRow.purityWeight * goldRate).toFixed(2);
        }

        return updatedRow;
      }
      return row;
    });
    setRows(updatedRows);

    // Mock calculations for UI demonstration
    if (balance) {
      let totalPurity = updatedRows.reduce(
        (acc, currValue) => acc + Number(currValue.purityWeight),
        0
      );
      let value = balance - totalPurity;
      if (value >= 0) {
        setCustomerPure(value);
        setCustomerExcees(0);
        for (let i = updatedRows.length - 1; i >= 0; i--) {
          if (updatedRows[i].goldRate > 0) {
            setCustomerCashBalance(value * updatedRows[i].goldRate);
            break;
          }
        }
      } else {
        setCustomerPure(0);
        setCustomerExcees(value);
      }
    }

    if (excess) {
      let totalPurity = updatedRows.reduce(
        (acc, currValue) => acc + Number(currValue.purityWeight),
        0
      );
      let value = excess + totalPurity;
      setCustomerPure(0);
      setCustomerExcees(value);
    }

    if (total === 0 && excess === 0 && balance === 0) {
      let totalPurity = updatedRows.reduce(
        (acc, currValue) => acc + Number(currValue.purityWeight),
        0
      );
      let value = excess + totalPurity;
      setCustomerPure(0);
      setCustomerExcees(-value);
    }
  };

  const registerRef = (rowId, field) => (el) => {
    if (!inputRefs.current[rowId]) inputRefs.current[rowId] = {};
    inputRefs.current[rowId][field] = el;
  };

  const handleKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") {
      const fields = ["date", "goldRate", "givenGold", "touch", "amount"];
      const index = fields.indexOf(field);
      const nextField = fields[index + 1];
      if (nextField && inputRefs.current[rowId]?.[nextField]) {
        inputRefs.current[rowId][nextField].focus();
      }
    }
  };

  const handleAddRow = () => setRows([...rows, createNewRow()]);

  const handleDeleteRow = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this row?"
    );
    if (confirmDelete) {
      const updatedRows = [...rows];
      updatedRows.splice(index, 1);

      // Mock calculations for UI demonstration
      if (balance) {
        let totalPurity = updatedRows.reduce(
          (acc, currValue) => acc + Number(currValue.purityWeight),
          0
        );
        let value = balance - totalPurity;
        if (value >= 0) {
          setCustomerPure(value);
          setCustomerExcees(0);
          for (let i = updatedRows.length - 1; i >= 0; i--) {
            if (updatedRows[i].goldRate > 0) {
              setCustomerCashBalance(value * updatedRows[i].goldRate);
              break;
            }
          }
        } else {
          setCustomerPure(0);
          setCustomerExcees(value);
        }
      }

      if (excess) {
        let totalPurity = updatedRows.reduce(
          (acc, currValue) => acc + Number(currValue.purityWeight),
          0
        );
        let value = excess + totalPurity;
        setCustomerPure(0);
        setCustomerExcees(value);
      }

      if (total === 0 && excess === 0 && balance === 0) {
        let totalPurity = updatedRows.reduce(
          (acc, currValue) => acc + Number(currValue.purityWeight),
          0
        );
        let value = excess + totalPurity;
        setCustomerPure(0);
        setCustomerExcees(-value);
      }
      setRows(updatedRows);
    }
  };

  const handleSave = () => {
    alert("Save functionality would be implemented here in a real application");
  };

  if (loading)
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={2}>
      <FormControl size="small" margin="none" sx={{ width: "28%", mb: 1 }}>
        <InputLabel id="customer-label" size="small">
          Select Customer
        </InputLabel>
        <Select
          labelId="customer-label"
          label="Select Customer"
          value={selectedCustomer}
          onChange={handleCustomerChange}
          size="small"
          sx={{ fontSize: 13, py: 0.8 }}
        >
          {customers.map((c) => (
            <MenuItem key={c._id} value={c._id} sx={{ fontSize: 13 }}>
              {`${c.name} (${c.phone})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
        bgcolor="#f9f9f9"
        border="1px solid #ccc"
        borderRadius="8px"
        boxShadow="0 2px 6px rgba(0,0,0,0.1)"
        marginBottom={2}
        sx={{ width: "28%", mb: 1 }}
      >
        <Box>
          <b>
            {balance !== 0
              ? `Old Balance: ₹${balance}`
              : excess !== 0
              ? `Excess Balance: ₹${excess}`
              : `Total: ₹${total}`}
          </b>
        </Box>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={2}
      >
        <Typography variant="h6">Receipt Voucher</Typography>
        <Box>
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddRow}
            size="small"
            variant="contained"
            sx={{ mr: 1 }}
          >
            Add Row
          </Button>
          <Button
            startIcon={<VisibilityIcon />}
            onClick={() => setOpenDialog(true)}
            size="small"
            variant="outlined"
          >
            View Receipts
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                "Date",
                "Gold Rate",
                "Given Gold",
                "Touch",
                "Purity Weight",
                "Amount",
                "Action",
              ].map((header) => (
                <TableCell key={header} sx={{ border: "1px solid #ccc" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                {[
                  "date",
                  "goldRate",
                  "givenGold",
                  "touch",
                  "purityWeight",
                  "amount",
                ].map((field) => (
                  <TableCell key={field} sx={{ border: "1px solid #eee" }}>
                    <TextField
                      type={field === "date" ? "date" : "number"}
                      value={row[field]}
                      onChange={(e) =>
                        handleInputChange(row.id, field, e.target.value, index)
                      }
                      onKeyDown={(e) => handleKeyDown(e, row.id, field)}
                      inputRef={registerRef(row.id, field)}
                      size="small"
                      fullWidth
                      variant="outlined"
                      label=""
                      disabled={field === "purityWeight"}
                      autoComplete="off"
                    />
                  </TableCell>
                ))}
                <TableCell sx={{ border: "1px solid #eee" }}>
                  <IconButton onClick={() => handleDeleteRow(index)}>
                    <DeleteForeverIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        padding={2}
        bgcolor="#f0f4f8"
        borderRadius="10px"
        boxShadow="0 2px 5px rgba(0,0,0,0.1)"
        marginBottom={2}
      >
        <Box textAlign="center">
          <b>
            {customerCashBalance >= 0
              ? "Customer Cash Balance:"
              : "Excess Cash Balance :"}{" "}
            {customerCashBalance.toFixed(2)}
          </b>
        </Box>
        <Box textAlign="center">
          <b>
            Excess Balance: {customerExcees > 0 ? "-" : ""}
            {customerExcees.toFixed(3)}
          </b>
        </Box>
        <Box textAlign="center">
          <b>Purity Balance: {customerPure.toFixed(3)}</b>
        </Box>
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          size="small"
          disabled={rows.length < 1}
        >
          Save
        </Button>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>All Receipts</DialogTitle>
        <DialogContent>
          {loadingReceipts ? (
            <Box textAlign="center" mt={2}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    "Date",
                    "Gold Rate",
                    "Given Gold",
                    "Touch",
                    "Purity Weight",
                    "Amount",
                  ].map((header) => (
                    <TableCell key={header} sx={{ border: "1px solid #ccc" }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allReceipts.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ border: "1px solid #eee" }}>
                      {r.date?.slice(0, 10)}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>
                      {r.goldRate}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>
                      {r.givenGold}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>
                      {r.touch}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>
                      {r.purityWeight}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>
                      {r.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Receipt;
