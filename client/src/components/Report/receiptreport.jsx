import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TextField,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ReceiptReport = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const printRef = useRef();

  // Mock data for UI preview
  useEffect(() => {
    const mockReceipts = [
      {
        id: 1,
        customer_id: 101,
        customer_name: "John Doe",
        date: "2025-06-10",
        goldRate: 5700,
        givenGold: 20,
        touch: 91.6,
        purityWeight: 18.32,
        amount: 104624,
      },
      {
        id: 2,
        customer_id: 102,
        customer_name: "Jane Smith",
        date: "2025-06-11",
        goldRate: 5750,
        givenGold: 10,
        touch: 92,
        purityWeight: 9.2,
        amount: 52900,
      },
    ];

    const mockCustomers = [
      { id: 101, name: "John Doe", phone: "9876543210" },
      { id: 102, name: "Jane Smith", phone: "9123456780" },
    ];

    setReceipts(mockReceipts);
    setFilteredReceipts(mockReceipts);
    setCustomers(mockCustomers);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateFilter, customerFilter, receipts]);

  const applyFilters = () => {
    let result = [...receipts];

    if (dateFilter.startDate && dateFilter.endDate) {
      result = result.filter((receipt) => {
        const receiptDate = new Date(receipt.date).getTime();
        const startDate = new Date(dateFilter.startDate).getTime();
        const endDate = new Date(dateFilter.endDate).getTime();
        return receiptDate >= startDate && receiptDate <= endDate;
      });
    }

    if (customerFilter !== "all") {
      result = result.filter(
        (receipt) => receipt.customer_id === customerFilter
      );
    }

    setFilteredReceipts(result);
  };

  const handleStartDateChange = (e) => {
    setDateFilter({ ...dateFilter, startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    setDateFilter({ ...dateFilter, endDate: e.target.value });
  };

  const handleCustomerFilterChange = (e) => {
    setCustomerFilter(e.target.value);
  };

  const handlePrintPDF = async () => {
    const input = printRef.current;

    const canvas = await html2canvas(input, { scale: 2, useCORS: true });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = 210;
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft > 0) {
      position -= 297;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save("Receipt-Report.pdf");
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const totalAmount = filteredReceipts.reduce(
    (sum, r) => sum + parseFloat(r.amount),
    0
  );
  const totalPurityWeight = filteredReceipts.reduce(
    (sum, r) => sum + parseFloat(r.purityWeight),
    0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Receipt Report
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <TextField
          label="Start Date"
          type="date"
          size="small"
          value={dateFilter.startDate}
          onChange={handleStartDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />

        <TextField
          label="End Date"
          type="date"
          size="small"
          value={dateFilter.endDate}
          onChange={handleEndDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Customer</InputLabel>
          <Select
            value={customerFilter}
            label="Customer"
            onChange={handleCustomerFilterChange}
          >
            <MenuItem value="all">All Customers</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.phone})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handlePrintPDF}>
          Export as PDF
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        ref={printRef}
        style={{ padding: "20px", overflowX: "auto" }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          Receipt Report
        </Typography>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Customer</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Gold Rate</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Given Gold</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Touch</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Purity Weight</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Amount</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt, index) => (
                <TableRow
                  key={receipt.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  }}
                >
                  <TableCell>{receipt.customer_name}</TableCell>
                  <TableCell>{formatDate(receipt.date)}</TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.goldRate).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.givenGold).toFixed(3)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.touch).toFixed(2)}%
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.purityWeight).toFixed(3)}
                  </TableCell>
                  <TableCell align="right">
                    ₹
                    {new Intl.NumberFormat("en-IN").format(
                      parseFloat(receipt.amount).toFixed(2)
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No receipts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredReceipts.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Total Receipts: {filteredReceipts.length} | Total Purity Weight:{" "}
            {totalPurityWeight.toFixed(3)} | Total Amount: ₹
            {new Intl.NumberFormat("en-IN").format(totalAmount.toFixed(2))}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReceiptReport;
