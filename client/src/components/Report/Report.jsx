import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  TablePagination,
} from "@mui/material";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const DailySalesReport = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [date, setDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch(
          `${BACKEND_SERVER_URL}/api/bills?_embed=receivedDetails`
        );
        const data = await response.json();
        setBills(data);
        setFilteredBills(data);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    fetchBills();
  }, []);

  useEffect(() => {
    if (date) {
      const filtered = bills.filter(
        (bill) =>
          new Date(bill.createdAt).toDateString() ===
          new Date(date).toDateString()
      );
      setFilteredBills(filtered);
    } else {
      setFilteredBills(bills);
    }
    setPage(0);
  }, [date, bills]);

  const calculateMetrics = () => {
    return filteredBills.reduce(
      (acc, bill) => {
        const itemsAmount = bill.items.reduce(
          (sum, item) => sum + item.purity * bill.goldRate,
          0
        );
        const hallmarkCharge = bill.hallmarkCharges || 0;
        const billTotal = itemsAmount + hallmarkCharge;

        const received = bill.receivedDetails?.reduce(
          (sum, detail) => ({
            pure: sum.pure + (detail.purityWeight || 0),
            cash: sum.cash + (detail.amount || 0),
            hallmark: sum.hallmark + (detail.hallmark || 0),
          }),
          { pure: 0, cash: 0, hallmark: 0 }
        ) || { pure: 0, cash: 0, hallmark: 0 };

        const totalReceived = received.cash + received.hallmark;

        const cashBalanceForMetric = itemsAmount - totalReceived;
        const pureBalanceForMetric =
          bill.items.reduce((sum, item) => sum + item.purity, 0) -
          received.pure;
        const hallmarkBalanceForMetric = hallmarkCharge - received.hallmark;

        return {
          totalSales: acc.totalSales + billTotal,
          totalWeight:
            acc.totalWeight +
            bill.items.reduce((sum, item) => sum + item.weight, 0),
          totalPurity:
            acc.totalPurity +
            bill.items.reduce((sum, item) => sum + item.purity, 0),
          pureReceived: acc.pureReceived + received.pure,
          cashReceived: acc.cashReceived + received.cash,
          hallmarkReceived: acc.hallmarkReceived + received.hallmark,
          cashPaid: acc.cashPaid,
          outstandingCash: acc.outstandingCash + cashBalanceForMetric,
          outstandingHallmark:
            acc.outstandingHallmark + hallmarkBalanceForMetric,
          outstandingPure: acc.outstandingPure + pureBalanceForMetric,
        };
      },
      {
        totalSales: 0,
        totalWeight: 0,
        totalPurity: 0,
        pureReceived: 0,
        cashReceived: 0,
        hallmarkReceived: 0,
        cashPaid: 0,
        outstandingCash: 0,
        outstandingHallmark: 0,
        outstandingPure: 0,
      }
    );
  };

  const metrics = calculateMetrics();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleReset = () => {
    setDate("");
    setFilteredBills(bills);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography style={{ textAlign: "center" }} variant="h5" gutterBottom>
        Daily Sales Report
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Select Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <Button variant="outlined" onClick={handleReset}>
          Show All
        </Button>
      </Box>

 
      <TableContainer component={Paper}>
        <Table>
            <TableHead
                          sx={{
                            backgroundColor: "#e3f2fd",
                            "& th": {
                              backgroundColor: "#e3f2fd",
                              color: "#0d47a1",
                              fontWeight: "bold",
                              fontSize: "1rem",
                            },
                          }}>
            <TableRow>
              <TableCell>Bill No</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total Weight</TableCell>
              <TableCell>Total Purity</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Cash Received</TableCell>
              <TableCell>Hallmark Received</TableCell>
              <TableCell>Pure Received</TableCell>
              <TableCell>Cash Balance</TableCell>
              <TableCell>Hallmark Balance</TableCell>
              <TableCell>Pure Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((bill) => {
                const totalWeight = bill.items.reduce(
                  (sum, item) => sum + item.weight,
                  0
                );
                const totalPurity = bill.items.reduce(
                  (sum, item) => sum + item.purity,
                  0
                );
                const itemsAmount = bill.items.reduce(
                  (sum, item) => sum + item.purity * bill.goldRate,
                  0
                );
                const hallmarkCharge = bill.hallmarkCharges || 0;
                const totalAmount = itemsAmount + hallmarkCharge;

                const received = bill.receivedDetails?.reduce(
                  (sum, detail) => ({
                    cash: sum.cash + (detail.amount || 0),
                    pure: sum.pure + (detail.purityWeight || 0),
                    hallmark: sum.hallmark + (detail.hallmark || 0),
                  }),
                  { cash: 0, pure: 0, hallmark: 0 }
                ) || { cash: 0, pure: 0, hallmark: 0 };

                const cashBalance = received.cash;

                const hallmarkBalance = hallmarkCharge - received.hallmark;
                const pureBalance = totalPurity - received.pure;

                return (
                  <TableRow key={bill.id}>
                    <TableCell>BILL-{bill.id}</TableCell>
                    <TableCell>{bill.customerId || "Unknown"}</TableCell>
                    <TableCell>{totalWeight.toFixed(3)}</TableCell>
                    <TableCell>{totalPurity.toFixed(3)}</TableCell>
                    <TableCell>₹{totalAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{received.cash.toFixed(2)}</TableCell>
                    <TableCell>₹{received.hallmark.toFixed(2)}</TableCell>
                    <TableCell>{received.pure.toFixed(3)} g</TableCell>
                    <TableCell
                      sx={{
                        color: "success.main",
                      }}
                    >
                      ₹{cashBalance.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          hallmarkBalance > 0 ? "error.main" : "success.main",
                      }}
                    >
                      ₹{hallmarkBalance.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: pureBalance > 0 ? "error.main" : "success.main",
                      }}
                    >
                      {pureBalance.toFixed(3)} g
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredBills.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default DailySalesReport;
