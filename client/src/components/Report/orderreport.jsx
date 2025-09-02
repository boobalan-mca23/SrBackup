
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./orderreport.css";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  CalendarToday,
  CheckCircle,
  PendingActions,
  Print,
} from "@mui/icons-material";
import { BACKEND_SERVER_URL } from "../../Config/Config";

const OrderReport = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_SERVER_URL}/api/customerOrder/all-customer-orders`
      );
      const transformed = transformOrderData(response.data.data);
      setOrders(transformed);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const transformOrderData = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const groupId = item.order_group_id;
      const createdAt = item.created_at;

      if (!grouped[groupId]) {
        grouped[groupId] = {
          id: `Order Group #${groupId}`,
          customer: item.customers?.name || `Customer ${item.customer_id}`,
          items: [],
          totalPurity: 0,
          createdAt: createdAt,
        };
      }

      const weight = parseFloat(item.weight) || 0;

      grouped[groupId].items.push({
        name: item.item_name,
        description: item.description,
        weight: weight.toFixed(3),
        dueDate: item.due_date?.split("T")[0] || "N/A",
        status: item.status || "Pending",
        images: item.productImages || [],
      });

      grouped[groupId].totalPurity += weight;

      if (new Date(createdAt) < new Date(grouped[groupId].createdAt)) {
        grouped[groupId].createdAt = createdAt;
      }
    });

    return Object.values(grouped).map((group) => ({
      ...group,
      totalPurity: group.totalPurity.toFixed(3),
      orderDate: group.createdAt.split("T")[0], 
    }));
  };

  const filteredOrders = orders.filter((group) => {
    const hasStatus = group.items.some(
      (item) => filter === "all" || item.status === filter
    );

    if (!hasStatus) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        group.id.toLowerCase().includes(search) ||
        group.customer.toLowerCase().includes(search) ||
        group.items.some((item) => item.name.toLowerCase().includes(search))
      );
    }

    return true;
  });

  const getStatusIcon = (status) =>
    status === "Delivered" ? (
      <CheckCircle fontSize="small" />
    ) : (
      <PendingActions fontSize="small" />
    );

  return (
    <div className="order-report-container">
      <div className="report-header">
        <Typography
          variant="h4"
          component="h1"
          sx={{ textAlign: "center", fontWeight: 600 }}
        >
          Order Report
        </Typography>
        <div className="report-actions">
          <IconButton color="primary">
            <Print />
          </IconButton>
        </div>
      </div>

      <div
        className="report-filters"
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search orders..."
          InputProps={{ startAdornment: <Search color="action" /> }}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: 400 }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </div>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Paper sx={{ p: 3, mt: 3, textAlign: "center" }}>
          <Typography>No orders found matching your criteria</Typography>
        </Paper>
      ) : (
        filteredOrders.map((group, index) => (
          <Paper key={index} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {group.id}
            </Typography>
            <Typography variant="subtitle1" sx={{ color:"black" }}>
              Customer: {group.customer}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "black" }}>
              Order Date: {group.orderDate}
            </Typography>

            <TableContainer>
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
            }}
           >
                  <TableRow>
                    <TableCell sx={{ color: "#fff" }}>Item</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Description</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Weight</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Due Date</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {item.images.map((img, imgIdx) => (
                            <Avatar
                              key={imgIdx}
                              src={`${BACKEND_SERVER_URL}/uploads/${img.filename}`}
                              alt="img"
                              variant="rounded"
                              sx={{ width: 40, height: 40 }}
                            />
                          ))}
                          <span>{item.name}</span>
                        </Box>
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.weight}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday fontSize="small" color="action" />
                          {item.dueDate}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          icon={getStatusIcon(item.status)}
                          sx={{
                            backgroundColor:
                              item.status === "Delivered"
                                ? "success.light"
                                : "warning.light",
                            color:
                              item.status === "Delivered"
                                ? "success.dark"
                                : "warning.dark",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: "#f1f1f1" }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 600 }}>
                      Total Purity
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {group.totalPurity} g
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      )}
    </div>
  );
};

export default OrderReport;
