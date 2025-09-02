import React, { useState, useEffect, useRef } from "react";
import axios from "axios";


import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Autocomplete,
  Box,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Balance, ElevatorSharp, Visibility } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { teal } from "@mui/material/colors";

const CustReport = () => {
  const location = useLocation();
  const printRef = useRef();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [billInfo, setBillInfo] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [excess, setExcess] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalExcess, setTotalExcess] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  const navigate = useNavigate();
  useEffect(() => {
    // Get current date in UTC
    const today = new Date();

    // Convert to Indian Standard Time (IST)
    const offset = 5.5 * 60; // IST is UTC +5:30
    const indiaTime = new Date(today.getTime() + offset * 60000); // Adjust the time by the offset

    // Extract date parts (year, month, day)
    const year = indiaTime.getFullYear();
    const month = String(indiaTime.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(indiaTime.getDate()).padStart(2, "0");

    // Format the date as YYYY-MM-DD
    const currentDate = `${year}-${month}-${day}`;

    console.log("currentDate in IST:", currentDate);

    setFromDate(currentDate);
    setToDate(currentDate);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customer_id = params.get("custId");

    if (customer_id && customers.length > 0) {
      const match = customers.find(
        (cust) => String(cust.customer_id) === String(customer_id)
      );
      if (match) setSelectedCustomer(match);
    }
  }, [location.search, customers]); // depends on both URL and customers

  const handlePrintPDF = async () => {
    const input = printRef.current;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("Customer-Report.pdf");
  };
  useEffect(() => {
    if (fromDate > toDate) {
      toast.warn("Select Date order was Wrong");
      return;
    }
    const fetchBill = async () => {
      setBalance(0);
      setExcess(0);
      const params = new URLSearchParams(location.search);
      const from = params.get("fromDate");
      const to = params.get("toDate");
      const customer_id = params.get("custId");
      billInfo.splice(0, billInfo.length);
      if (customer_id) {
        const cust = customers.find(
          (item) => item.customer_id.toString() === customer_id
        );
        if (cust) {
          console.log("customer name", cust);
          setSelectedCustomer(cust); // ✅ Set the selected customer in Autocomplete
        }
      }
      let billTotal = 0;
      let excessTotal = 0;
      try {
        const res = await axios.get(
          `${REACT_APP_BACKEND_SERVER_URL}/api/bill/getCustomerBillWithDate`,
          {
            params: {
              fromDate: from,
              toDate: to,
              customer_id: customer_id ? customer_id : null,
            },
          }
        );
        const rawData = res.data || [];

        const formatted = rawData
          .map((entry) => {
            const formattedDate = new Date(entry.date || entry.created_at)
              .toISOString()
              .split("T")[0];

            if (entry.type === "bill") {
              billTotal += entry.info.total_price;
              return {
                type: "Bill",
                date: formattedDate,
                id: entry.info.id,
                value: entry.info.total_price,
                items: entry.info.OrderItems.map((item) => ({
                  itemName: item.itemName,
                  touchValue: item.touchValue,
                  productWeight: item.productWeight,
                  final_price: item.final_price,
                })),
              };
            } else if (entry.type === "receipt") {
              excessTotal += entry.info.purityWeight;
              return {
                type: "Receipt",
                date: formattedDate,
                id: entry.info.receipt_id,
                value: entry.info.amount,
                gold: `${entry.info.givenGold}g`,
                purityWeight: entry.info.purityWeight,
                touch: entry.info.touch,
                rate: entry.info.goldRate,
              };
            }

            return null;
          })
          .filter(Boolean);
        setTotalExcess(excessTotal);
        setTotalBalance(billTotal);
        if (excessTotal > billTotal) {
          setExcess(excessTotal - billTotal);
          setBalance(0);
        }
        if (billTotal > excessTotal) {
          setExcess(0);
          setBalance(billTotal - excessTotal);
        }
        setBillInfo(formatted);
      } catch (error) {
        toast.error("Error fetching Bills!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };

    fetchBill();
  }, [location.search]);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
        );
        console.log("Fetch Customer:", response);
        setCustomers(response.data);
      } catch (error) {
        toast.error("Error fetching Customer!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };
    fetchCustomer();
  }, []);

  const calculateRecivedAmount = (Balance) => {
    return Balance.reduce((acc, currValue) => {
      return acc + currValue.gold_pure;
    }, 0);
  };

  const handleCustomerBill = async () => {
    setBalance(0);
    setExcess(0);

    if (selectedCustomer) {
      navigate(
        `/report?type=customer&fromDate=${fromDate}&toDate=${toDate}&custId=${selectedCustomer.customer_id}`
      );
    } else {
      navigate(
        `/report?type=customer&fromDate=${fromDate}&toDate=${toDate}&custId=null`
      );
    }

    billInfo.splice(0, billInfo.length);

    try {
      const res = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/bill/getCustomerBillWithDate`,
        {
          params: {
            fromDate: fromDate,
            toDate: toDate,
            customer_id: selectedCustomer ? selectedCustomer.customer_id : null,
          },
        }
      );
      let rawData = res.data || [];
      let billTotal = 0;
      let excessTotal = 0;
      const formatted = rawData
        .map((entry) => {
          const formattedDate = new Date(entry.date || entry.created_at)
            .toISOString()
            .split("T")[0];

          if (entry.type === "bill") {
            return {
              type: "Bill",
              date: formattedDate,
              id: entry.info.id,
              value: entry.info.total_price,
              items: entry.info.OrderItems.map((item) => ({
                itemName: item.itemName,
                touchValue: item.touchValue,
                productWeight: item.productWeight,
                final_price: item.final_price,
              })),
            };
          } else if (entry.type === "receipt") {
            return {
              type: "Receipt",
              date: formattedDate,
              id: entry.info.receipt_id,
              value: entry.info.amount,
              gold: `${entry.info.givenGold}g`,
              purityWeight: entry.info.purityWeight,
              touch: entry.info.touch,
              rate: entry.info.goldRate,
            };
          }

          return null;
        })
        .filter(Boolean);
      console.log("res", formatted);
      setTotalExcess(excessTotal);
      setTotalBalance(billTotal);
      if (excessTotal > billTotal) {
        setExcess(excessTotal - billTotal);
        setBalance(0);
      }
      if (billTotal > excessTotal) {
        setExcess(0);
        setBalance(billTotal - excessTotal);
      }
      setBillInfo(formatted);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewBill = (billNo) => {
    
    navigate(`/billing/${billNo}`);
  };

  return (
    <>
 
      <div style={{ padding: "20px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            marginBottom: 3,
          }}
        >
         

          <Button
            variant="contained"
            onClick={handleCustomerBill}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              paddingX: 3,
              paddingY: 1,
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#115293",
              },
            }}
          >
            Search
          </Button>
          <Button variant="contained" onClick={handlePrintPDF}>
            Print
          </Button>
        </Box>
     

        <TableContainer
          component={Paper}
          style={{ marginTop: "20px", padding: "30px" }}
          ref={printRef}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              marginBottom: 3,
            }}
          >
            <TextField
              type="date"
              label="From Date"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              type="date"
              label="To Date"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Autocomplete
              value={selectedCustomer || null}
              options={customers}
              getOptionLabel={(option) => option.customer_name || ""}
              onChange={(event, newValue) => setSelectedCustomer(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer" size="small" />
              )}
              sx={{ minWidth: 300 }}
            />
          </Box>
          <h3 style={{ textAlign: "center" }}>Customer Report</h3>
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
                {[
                  "S.NO",
                  "Bill.NO",
                  "Date",
                  "Description",
                  "Received Amount",
                  "Balance",
                  // "Action",
                ].map((label, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{
                      color: "black",
                      fontWeight: "bold",
                      border: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {billInfo.length > 0 ? (
                billInfo.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      {index + 1}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      {item.id}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      {item.date}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      <Table
                        size="small"
                        sx={{ border: "1px solid #ccc", width: "100%" }}
                      >
                        <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
                          <TableRow>
                            {item.type === "Bill" ? (
                              <>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Item Name
                                </TableCell>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Touch Value
                                </TableCell>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Product Weight
                                </TableCell>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Final Price
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  GoldRate
                                </TableCell>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Gold
                                </TableCell>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Touch
                                </TableCell>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Purity Weight
                                </TableCell>
                                <TableCell
                                  sx={{
                                    border: "1px solid #ccc",
                                    fontWeight: "bold",
                                  }}
                                  align="center"
                                >
                                  Amount
                                </TableCell>
                                {/* <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Rate</TableCell>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Value</TableCell> */}
                              </>
                            )}
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {item.type === "Bill" ? (
                            item.items?.map((orderItem, idx) => (
                              <TableRow key={idx}>
                                <TableCell
                                  align="center"
                                  sx={{ border: "1px solid #ccc" }}
                                >
                                  {orderItem.itemName}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ border: "1px solid #ccc" }}
                                >
                                  {orderItem.touchValue}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ border: "1px solid #ccc" }}
                                >
                                  {orderItem.productWeight}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ border: "1px solid #ccc" }}
                                >
                                  {orderItem.final_price}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                align="center"
                                sx={{ border: "1px solid #ccc" }}
                              >
                                {item.rate}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ border: "1px solid #ccc" }}
                              >
                                {item.gold}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ border: "1px solid #ccc" }}
                              >
                                {item.touch}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ border: "1px solid #ccc" }}
                              >
                                {item.purityWeight}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ border: "1px solid #ccc" }}
                              >
                                {item.value}
                              </TableCell>

                              {/* <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{item.rate}</TableCell>
                              <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{item.value}</TableCell> */}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableCell>

                    {item.type === "Bill" && (
                      <>
                        <TableCell
                          align="center"
                          sx={{ border: "1px solid #ccc" }}
                        ></TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: "1px solid #ccc" }}
                        >
                          {item.value}
                        </TableCell>
                      </>
                    )}
                    {item.type === "Receipt" && (
                      <>
                        <TableCell
                          align="center"
                          sx={{ border: "1px solid #ccc" }}
                        >
                          {item.purityWeight.toFixed(3)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: "1px solid #ccc" }}
                        ></TableCell>
                      </>
                    )}

                    {/* <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      <IconButton onClick={() => handleViewBill(item.id)}>
                        <Visibility style={{ color: "black" }} />
                      </IconButton>
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ border: "1px solid #ccc" }}
                  >
                    No data found
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={4}></TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", border: "1px solid #ccc" }}
                >
                  Total Received: {totalExcess.toFixed(3)}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", border: "1px solid #ccc" }}
                >
                  Total Balance: {totalBalance.toFixed(3)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {/* <TableHead>
            <TableRow sx={{ backgroundColor: "#e6f7ff" }}>
             
             
            </TableRow>
          </TableHead> */}

          {selectedCustomer && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#f0fff0",
                  padding: "16px 24px",
                  borderRadius: "10px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  minWidth: "200px",
                  textAlign: "center",
                }}
              >
                <b style={{ color: "#388e3c" }}>Excess:</b>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  {excess.toFixed(3)}
                </div>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#fff0f0",
                  padding: "16px 24px",
                  borderRadius: "10px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  minWidth: "200px",
                  textAlign: "center",
                }}
              >
                <b style={{ color: "#d32f2f" }}>Balance:</b>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  {balance.toFixed(3)}
                </div>
              </Box>
            </Box>
          )}
        </TableContainer>

        {/* TableContainer remains unchanged */}
      </div>
    </>
  );
};

const styles = {
  smallAutocomplete: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: "5px",
  },
};
export default CustReport;
