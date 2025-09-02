import React, { useState, useEffect, useRef } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Button,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./Billing.css";

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [billId, setBillId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const billRef = useRef();
  const [products, setProducts] = useState([]);
  const [productWeight, setProductWeight] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPure, setTotalPure] = useState(0);
  const [customerClosing, setCustomerClosing] = useState(0);
  const [balanceRow, setBalanceRow] = useState([]);
  const [closing, setClosing] = useState(0);
  const [pure, setPure] = useState(0);
  const [customerBalance, setCustomerBalance] = useState({
    exPure: 0,
    balance: 0,
    exBalAmount: 0,
    balAmount: 0,
  });
  const [cashTotal, setCashTotal] = useState(0);
  const [customerPure, setCustomerPure] = useState(0);
  const [customerExpure, setCustomerExPure] = useState(0);
  const [customerCashBalance, setCustomerCashBalance] = useState(0);
  const inputRefs = useRef({});
  const [rows, setRows] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [goldRate, setGoldRate] = useState(0);
  const [billPure, setBillPure] = useState(0);
  const [billAmount, setBillAmount] = useState(0);
  const [receivedPure, setReceivedPure] = useState(0);

  const navigate = useNavigate();

  const registerRef = (rowId, field) => (el) => {
    if (!inputRefs.current[rowId]) inputRefs.current[rowId] = {};
    inputRefs.current[rowId][field] = el;
  };

  const handleProductSelect = (itemIndex, stockId) => {
    setRows([]);
    const tempProducts = [...productWeight];
    let customerData;
    const tempSelectProduct = tempProducts.filter(
      (item, index) => itemIndex === index
    );
    console.log("masterjewelid", selectedProduct.master_jewel_id);

    if (!selectedCustomer) {
      toast.error("Please select a customer first!", { autoClose: 2000 });
      return;
    }

    customerData = customers.filter(
      (item) => item.customer_id === selectedCustomer.customer_id
    );

    if (customerData.length === 0) {
      toast.error("Customer data not found for selected customer.", {
        autoClose: 2000,
      });
      return;
    }

    const filterMasterItem =
      customerData[0].MasterJewelTypeCustomerValue.filter(
        (item) => item.masterJewel_id === selectedProduct.master_jewel_id
      );

    if (filterMasterItem.length === 0) {
      toast.warning("Percentage is Required for this jewel type!", {
        autoClose: 2000,
      });
    } else {
      const billObj = {
        productName: tempSelectProduct[0].item_name,
        productTouch: tempSelectProduct[0].touchValue,
        productWeight: tempSelectProduct[0].value,
        productPure: 0,
        productPercentage: 0,
        productAmount: 0,
        stockId: stockId,
      };

      billObj.productPercentage = filterMasterItem[0].value;
      billObj.productPure =
        ((billObj.productTouch + billObj.productPercentage) *
          billObj.productWeight) /
        100;
      goldRate === 0
        ? (billObj.productAmount = 0)
        : (billObj.productAmount =
            parseFloat(billObj.productPure) * parseFloat(goldRate));

      const tempBill = [...billItems];
      tempBill.push(billObj);
      //bill cashTotal
      let cash = 0;
      for (const amt of tempBill) {
        cash += amt.productAmount;
      }
      setCashTotal(cash);
      setBillItems(tempBill);
      // its filter expure and balance
      let customerData = customers.filter(
        (item) => item.customer_id === selectedCustomer.customer_id
      );

      if (customerData.length === 0) {
        toast.error("Customer data not found for selected customer.", {
          autoClose: 2000,
        });
        return;
      }
      let balObj = {
        // set customer excess and balance
        exPure: customerData[0].customerBalance[0].expure,
        balance: customerData[0].customerBalance[0].balance,
        exBalAmount: 0,
        balAmount: 0,
      };
      setCustomerBalance(balObj);
      if (balObj.balance > 0) {
        let total = balObj.balance + calculateTotal(tempBill);
        setBillPure(total);
        balObj.balAmount = balObj.balance * goldRate;
        setBillAmount(balObj.balAmount + cash);
        setCustomerPure(total);
        setCustomerExPure(0);
        // setCustomerCashBalance(balObj.balAmount + cash)
      }
      if (balObj.exPure > 0) {
        let total = calculateTotal(tempBill) - balObj.exPure;
        setBillPure(total);
        balObj.exBalAmount = balObj.exPure * goldRate;
        setBillAmount(cash - balObj.exBalAmount);
        //Footer Section
        if (total >= 0) {
          setCustomerPure(total);
          setCustomerExPure(0);
          // setCustomerCashBalance(balObj.balAmount + cash)
        } else {
          setCustomerPure(0);
          setCustomerExPure(total);
          // setCustomerCashBalance(cash - balObj.exBalAmount)
        }
      }

      if (balObj.balance === 0 && balObj.exPure === 0) {
        setBillPure(calculateTotal(tempBill));
        setBillAmount(cash);
        setCustomerPure(calculateTotal(tempBill));
        setCustomerExPure(0);
        // setCustomerCashBalance(cash)
      }

      tempProducts.splice(itemIndex, 1);
      setProductWeight(tempProducts);
    }
  };

  const handleSaveBill = async () => {
    const payLoad = {
      customer_id: selectedCustomer.customer_id,
      order_status: "completed",
      totalPrice: totalPrice,
      orderItems: billItems,
      receivedDetails: rows,
      oldBalance: parseFloat(customerPure),
      excessBalance: parseFloat(customerExpure),
    };

    // Basic validations
    if (!selectedCustomer) {
      toast.error("Customer Name is Required!", { autoClose: 2000 });
      return;
    }

    if (!selectedProduct) {
      toast.error("Jewel Name is Required!", { autoClose: 2000 });
      return;
    }

    if (billItems.length === 0) {
      toast.error("Order Items are Required!", { autoClose: 2000 });
      return;
    }

    // Validate received rows
    let isValid = true;
    let hasValidRow = false;

    if (rows.length >= 1) {
      for (let i = 0; i < rows.length; i++) {
        const { goldRate, givenGold, touch, amount } = rows[i];

        const allEmpty =
          (!goldRate || goldRate <= 0) &&
          (!givenGold || givenGold <= 0) &&
          (!touch || touch <= 0) &&
          (!amount || amount <= 0);

        const isRowValid =
          (goldRate > 0 && amount > 0) || (givenGold > 0 && touch > 0);

        if (allEmpty || !isRowValid) {
          isValid = false;
          break;
        }

        if (isRowValid) {
          hasValidRow = true;
        }
      }

      if (!isValid || !hasValidRow) {
        toast.warn("Fill all required fields", { autoClose: 1000 });
        return;
      } else {
        console.log("payload", payLoad);

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/saveBill`,
            payLoad
          );
          if (response.status === 201) {
            setBillId(response.data.data + 1);
            toast.success("Bill Created Successfully!", { autoClose: 1000 });
            setSelectedCustomer("");
            setSelectedProduct("");
            setBillItems([]);
            setRows([]);
            setBillPure(0);
            setBillAmount(0);
            setCustomerBalance({
              exPure: 0,
              balance: 0,
              exBalAmount: 0,
              balAmount: 0,
            });
            setCustomerExPure(0);
            setCustomerPure(0);
            setCustomerCashBalance(0);
            setGoldRate(0);
            setTotalPure(0);
            setCashTotal(0);
            window.print();
          }
        } catch (err) {
          toast.error(`Error saving bill: ${err.message}`, { autoClose: 3000 });
          console.error("Error saving bill:", err);
        }
      }
    } else {
      console.log("payload", payLoad);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/saveBill`,
          payLoad
        );
        if (response.status === 201) {
          setBillId(response.data.data + 1);
          toast.success("Bill Created Successfully!", { autoClose: 1000 });
          setSelectedCustomer("");
          setSelectedProduct("");
          setBillItems([]);
          setRows([]);
          setBillPure(0);
          setBillAmount(0);
          setCustomerBalance({
            exPure: 0,
            balance: 0,
            exBalAmount: 0,
            balAmount: 0,
          });
          setCustomerExPure(0);
          setCustomerPure(0);
          setCustomerCashBalance(0);
          setGoldRate(0);
          setTotalPure(0);
          setCashTotal(0);
          window.print();
        }
      } catch (err) {
        toast.error(`Error saving bill: ${err.message}`, { autoClose: 3000 });
        console.error("Error saving bill:", err);
      }
    }
  };
  const handleCustomerName = (newValue) => {
    setSelectedCustomer(newValue);
    if (newValue) {
      const tempCust = [...customers];
      const filterCus = tempCust.filter(
        (item, index) => item.customer_id === newValue.customer_id
      );
      let obj = {
        exPure: filterCus[0].customerBalance[0].expure,
        balance: filterCus[0].customerBalance[0].balance,
        exBalAmount: filterCus[0].customerBalance[0].expure * goldRate,
        balAmount: filterCus[0].customerBalance[0].balance * goldRate,
      };
      setCustomerBalance(obj);
      if (obj.balance !== 0) {
        const tempBill = [...billItems];
        let cash = 0,
          purity = 0;
        for (const amt of tempBill) {
          cash += amt.productAmount;
          purity += amt.productPure;
        }

        setBillPure(purity + obj.balance);
        setBillAmount(cash + obj.balance * goldRate);
        //Footer Values
        setCustomerPure(purity + obj.balance);
        setCustomerExPure(0);
        // setCustomerCashBalance(cash + obj.balance * goldRate)
      }
      if (obj.exPure !== 0) {
        const tempBill = [...billItems];
        let cash = 0,
          purity = 0;

        for (const amt of tempBill) {
          cash += amt.productAmount;
          purity += amt.productPure;
        }
        setBillPure(purity - obj.exPure);
        setBillAmount(cash - obj.exPure * goldRate);
        //Footer Values
        setCustomerPure(0);
        setCustomerExPure(purity - obj.exPure);
        // setCustomerCashBalance(cash - obj.exPure * goldRate)
      }
      if (obj.balance === 0 && obj.exPure === 0) {
        const tempBill = [...billItems];
        let cash = 0,
          purity = 0;
        for (const amt of tempBill) {
          cash += amt.productAmount;
          purity += amt.productPure;
        }
        setBillPure(purity);
        setBillAmount(cash);
        setCustomerPure(purity);
        setCustomerExPure(0);
        // setCustomerCashBalance(purity * goldRate)
      }
    }
  };

  const handleSelectedProduct = (newValue) => {
    setSelectedProduct(newValue);

    const fetchWeight = async () => {
      try {
        const productsWeight = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getProductWeight/${newValue.master_jewel_id}`
        );
        let response = productsWeight.data.productsWeight;

        if (billItems.length >= 1) {
          const existingStockIds = billItems.map((item) => item.stockId);
          const newItems = response.filter(
            (item) => !existingStockIds.includes(item.stock_id)
          );
          setProductWeight(newItems);
        } else {
          setProductWeight(response);
        }
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setProductWeight([]);
          toast.info("No products found for this jewel type.", {
            autoClose: 2000,
          });
        } else if (err.response && err.response.status === 500) {
          toast.error("Server error while fetching product weights.", {
            autoClose: 3000,
          });
        } else {
          toast.error("Error fetching product weights.", { autoClose: 3000 });
        }
        console.error("Error fetching product weights:", err);
      }
    };
    fetchWeight();
  };

  const calculateTotal = (items) => {
    return items.reduce((acc, currValue) => acc + currValue.productPure, 0);
  };

  const calculateClosing = (balRows) => {
    return balRows.reduce((acc, currValue) => acc + currValue.pure, 0);
  };

  const handleChangePercentage = (itemIndex, value) => {
    setRows([]);
    const tempBill = [...billItems];
    const itemToUpdate = tempBill[itemIndex];

    const newPercentage = parseInt(value);
    if (isNaN(newPercentage)) {
      itemToUpdate.productPercentage = "";
      itemToUpdate.productPure =
        (itemToUpdate.productTouch * itemToUpdate.productWeight) / 100;
    } else {
      itemToUpdate.productPercentage = newPercentage;
      itemToUpdate.productPure =
        ((itemToUpdate.productTouch + newPercentage) *
          itemToUpdate.productWeight) /
        100;
      itemToUpdate.productAmount = itemToUpdate.productPure * goldRate;

      //TotalCash
      let cash = 0,
        purity = 0;
      for (const amt of tempBill) {
        cash += amt.productAmount;
        purity += amt.productPure;
      }
      setCashTotal(cash);
      if (customerBalance.balance > 0) {
        // old balance update
        setBillPure(purity + customerBalance.balance);
        setBillAmount(cash + customerBalance.balance * goldRate);
        setCustomerPure(purity + customerBalance.balance);
        setCustomerExPure(0);
        // setCustomerCashBalance(cash + customerBalance.balance * goldRate)
      }

      if (customerBalance.exPure > 0) {
        // Excess balance update
        setBillPure(purity - customerBalance.exPure);
        setBillAmount(cash - customerBalance.exPure * goldRate);
        if (purity - customerBalance.exPure >= 0) {
          setCustomerPure(purity - customerBalance.exPure);
          setCustomerExPure(0);
          // setCustomerCashBalance(cash - customerBalance.exPure * goldRate)
        } else {
          setCustomerPure(0);
          setCustomerExPure(purity - customerBalance.exPure);
          // setCustomerCashBalance(cash - customerBalance.exPure * goldRate)
        }
      }

      if (customerBalance.balance === 0 && customerBalance.exPure === 0) {
        setBillPure(purity);
        setBillAmount(cash);
        setCustomerPure(purity);
        setCustomerExPure(0);
        // setCustomerCashBalance(cash)
      }
    }

    setBillItems([...tempBill]);
  };

  const handleRemoveOrder = (index, item_name, touchValue, value, stock_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order item?"
    );

    if (confirmDelete) {
      setRows([]);
      const tempBill = [...billItems]; // remove order items
      tempBill.splice(index, 1);
      setBillItems(tempBill);

      let cash = 0,
        purity = 0;
      for (const amt of tempBill) {
        cash += amt.productAmount;
        purity += amt.productPure;
      }
      if (customerBalance.balance > 0) {
        // old balance update
        setBillPure(purity + customerBalance.balance);
        setBillAmount(cash + customerBalance.balance * goldRate);
        setCustomerPure(purity + customerBalance.balance);
        // setCustomerCashBalance(cash + customerBalance.balance * goldRate)
        setCustomerExPure(0);
      }

      if (customerBalance.exPure > 0) {
        // Excess balance update
        setBillPure(purity - customerBalance.exPure);
        setBillAmount(cash - customerBalance.exPure * goldRate);
        if (purity - customerBalance.exPure >= 0) {
          setCustomerPure(purity - customerBalance.exPure);
          setCustomerExPure(0);
          // setCustomerCashBalance(cash - customerBalance.exPure * goldRate)
        } else {
          setCustomerPure(0);
          setCustomerExPure(purity - customerBalance.exPure);
          // setCustomerCashBalance(cash - customerBalance.exPure * goldRate)
        }
      }

      if (customerBalance.balance === 0 && customerBalance.exPure === 0) {
        setBillPure(purity);
        setBillAmount(cash);
        setCustomerPure(purity);
        // setCustomerCashBalance(cash)
        setCustomerExPure(0);
      }
      setCashTotal(cash);
      setTotalPure(purity);

      const tempProduct = [...productWeight];
      tempProduct.push({ item_name, stock_id, touchValue, value });
      setProductWeight(tempProduct);
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        date: new Date().toISOString().slice(0, 10),
        goldRate: "",
        givenGold: "",
        touch: "",
        purityWeight: "",
        amount: "",
        hallmark: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recived item?"
    );
    if (confirmDelete) {
      const updatedRows = [...rows];
      updatedRows.splice(index, 1);

      let pure = updatedRows.reduce(
        (acc, currValue) => acc + Number(currValue.purityWeight),
        0
      );
      console.log("purity", pure);
      let decrement = billPure - pure;
      console.log("decrement value", decrement);

      if (decrement >= 0) {
        setCustomerPure(decrement);
        // setCustomerCashBalance(decrement * goldRate)
        setCustomerExPure(0);
      }
      //customerExPure
      if (decrement < 0) {
        setCustomerExPure(decrement);
        // setCustomerCashBalance(decrement * goldRate)
        setCustomerPure(0);
      }
      if (updatedRows.length >= 1) {
        for (let i = updatedRows.length - 1; i >= 0; i--) {
          // its calculate last gold rate
          if (updatedRows[i].goldRate > 0) {
            if (decrement < 0) {
              setCustomerCashBalance(0);
              break;
            }
            setCustomerCashBalance(decrement * updatedRows[i].goldRate);
            break;
          }
          setCustomerCashBalance(0);
        }
      } else {
        setCustomerCashBalance(0);
      }
      setRows(updatedRows);
    }
  };
  const handleGoldRate = (goldValue) => {
    console.log("goldValue", goldValue);
    let tempBill = [...billItems];
    for (const bill of tempBill) {
      bill.productAmount = bill.productPure * goldValue;
    }
    setBillItems(tempBill);

    let cash = 0;
    for (const amt of tempBill) {
      cash += amt.productAmount;
    }
    setCashTotal(cash);
    if (customerBalance.balance > 0) {
      let obj = {
        exPure: 0,
        balance: customerBalance.balance,
        exBalAmount: 0,
        balAmount: customerBalance.balance * goldValue,
      };
      setCustomerBalance(obj);
      setBillAmount(cash + obj.balAmount);
      // setCustomerCashBalance(cash + obj.balAmount)
    }
    if (customerBalance.exPure > 0) {
      let obj = {
        exPure: customerBalance.exPure,
        balance: 0,
        exBalAmount: customerBalance.exPure * goldValue,
        balAmount: 0,
      };
      setCustomerBalance(obj);
      setBillAmount(cash - obj.exBalAmount);
      // setCustomerCashBalance(cash - obj.exBalAmount)
    }
    if ((customerBalance.balance === 0) & (customerBalance.exPure === 0)) {
      setBillAmount(cash);
      // setCustomerCashBalance(cash)
    }

    setGoldRate(goldValue);
  };
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    if (field === "goldRate") {
      updatedRows[index]["amount"] = (
        updatedRows[index]["purityWeight"] * updatedRows[index]["goldRate"]
      ).toFixed(2);
      setCustomerCashBalance(customerPure * updatedRows[index]["goldRate"]);
    }

    if (field === "givenGold" || field === "touch") {
      const givenGold = parseFloat(updatedRows[index]["givenGold"]);
      const touch = parseFloat(updatedRows[index]["touch"]);
      if (!isNaN(givenGold) && !isNaN(touch)) {
        updatedRows[index]["purityWeight"] = (
          (givenGold * touch) /
          100
        ).toFixed(3);
        updatedRows[index]["amount"] = (
          updatedRows[index]["purityWeight"] * updatedRows[index]["goldRate"]
        ).toFixed(2);

        //customerPurity
        let tempRows = [...rows];
        let pure = tempRows.reduce(
          (acc, currValue) => acc + Number(currValue.purityWeight),
          0
        );
        console.log("purity", pure);
        let decrement = billPure - pure;
        console.log("decrement value", decrement);

        if (decrement >= 0) {
          setCustomerPure(decrement);
          // setCustomerCashBalance(decrement * goldRate)
          setCustomerExPure(0);
        }
        //customerExPure
        if (decrement < 0) {
          let tempRows = [...rows];
          let pure = tempRows.reduce(
            (acc, currValue) => acc + Number(currValue.purityWeight),
            0
          );

          setCustomerExPure(billPure - pure);
          // setCustomerCashBalance((billPure - pure) * goldRate)
          setCustomerPure(0);
        }
        for (let i = tempRows.length - 1; i >= 0; i--) {
          // its calculate last gold rate
          if (tempRows[i].goldRate > 0) {
            if (decrement < 0) {
              setCustomerCashBalance(0);
              break;
            }
            setCustomerCashBalance(decrement * tempRows[i].goldRate);
            break;
          }
        }
      } else {
        updatedRows[index]["purityWeight"] = "";
      }
    } else if (field === "amount" && updatedRows[index]["goldRate"] > 0) {
      const purityWeight = value / updatedRows[index]["goldRate"];
      updatedRows[index]["purityWeight"] = purityWeight.toFixed(3);

      let tempRows = [...rows];
      let pure = tempRows.reduce(
        (acc, currValue) => acc + Number(currValue.purityWeight),
        0
      );
      console.log("purity", pure);
      let decrement = billPure - pure;
      console.log("decrement value", decrement);

      if (decrement >= 0) {
        setCustomerPure(decrement);
        setCustomerCashBalance(decrement * updatedRows[index]["goldRate"]);
        setCustomerExPure(0);
      }
      //customerExPure
      if (decrement < 0) {
        let tempRows = [...rows];
        let pure = tempRows.reduce(
          (acc, currValue) => acc + Number(currValue.purityWeight),
          0
        );

        setCustomerExPure(billPure - pure);
        setCustomerCashBalance(0);
        setCustomerPure(0);
      }
    }
    setRows(updatedRows);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/getCustomerValueWithPercentage`
        );
        console.log("customerInfo from billing", response.data);
        setCustomers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error("Error fetching customers!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };

    const fetchJewelItem = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getJewelType`
        );
        setProducts(
          Array.isArray(response.data.allJewel) ? response.data.allJewel : []
        );
      } catch (error) {
        toast.error("Error fetching jewel types!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };
    const fetchBillLength = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/getBillLength`
        );
        console.log("billLength", response.data.billLength);
        setBillId(response.data.billLength + 1);
      } catch (error) {
        toast.error("Error Fetch bill no!", { containerId: "custom-toast" });
        console.error("Error:", error);
      }
    };
    fetchCustomers();
    fetchJewelItem();
    fetchBillLength();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDate(now.toLocaleDateString("en-IN"));
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

  useEffect(() => {
    let tempRows = [...rows];
    let total = tempRows.reduce(
      (acc, item) => acc + Number(item.purityWeight),
      0
    );

    setReceivedPure(total);
  }, [rows]);
  useEffect(() => {
    setTotalPrice(calculateTotal(billItems));
    setTotalPure(Number(calculateTotal(billItems)));
  }, [billItems, customerClosing]);

  const handleKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") {
      const fields = ["goldRate", "givenGold", "touch", "amount"];
      const index = fields.indexOf(field);
      const nextField = fields[index + 1];
      if (nextField && inputRefs.current[rowId]?.[nextField]) {
        inputRefs.current[rowId][nextField].focus();
      }
    }
  };
  return (
    <Box className="billing-wrapper">
      <Box className="left-panel">
        <h1 className="heading">Estimate Only</h1>
        <Box className="bill-header">
          <Box className="bill-number">
            <p>
              <strong>Bill No:</strong> {billId}
            </p>
          </Box>
          <Box className="bill-info">
            <p>
              <strong>Date:</strong> {date}
              <br></br>
              <br></br>
              <strong>Time:</strong> {time}
            </p>
          </Box>
        </Box>

        <Box className="search-section no-print">
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customer_name || ""}
            onChange={(event, newValue) => handleCustomerName(newValue)}
            value={selectedCustomer}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Customer"
                variant="outlined"
                size="small"
              />
            )}
            className="small-autocomplete"
          />

          <Autocomplete
            options={products}
            getOptionLabel={(option) => option.jewel_name || ""}
            onChange={(event, newValue) => handleSelectedProduct(newValue)}
            value={selectedProduct}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Product Name"
                variant="outlined"
                size="small"
              />
            )}
            className="small-autocomplete"
          />
        </Box>
        {selectedCustomer && (
          <Box className="customer-details">
            <h3 className="no-print">Customer Details:</h3>
            <p>
              <strong>Name:</strong> {selectedCustomer.customer_name}
            </p>
          </Box>
        )}
        <Box
          className="items-section"
          style={{ transition: "border-color 0.2s" }}
        >
          <h3>Bill Details:</h3>

          <div className="run">
            <TextField
              size="small"
              style={{
                width: "120px",
                height: "1rem",
                bottom: "18px",
                left: "5px",
              }}
              value={goldRate}
              onChange={(e) => handleGoldRate(e.target.value)}
              type="number"
              required
              disabled={viewMode && selectedBill}
              label="Gold Rate"
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th className="th">Description</th>
                <th className="th">Touch</th>
                <th className="th no-print">%</th>
                <th className="th">Weight</th>
                <th className="th">Pure</th>
                <th className="th">Amount</th>
                <th className="th no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length > 0 ? (
                billItems.map((item, index) => (
                  <tr key={index}>
                    <td className="td">{item.productName}</td>
                    <td className="td">{item.productTouch}</td>
                    <td className="td no-print">
                      <input
                        value={item.productPercentage}
                        type="number"
                        onChange={(e) =>
                          handleChangePercentage(index, e.target.value)
                        }
                      />
                    </td>
                    <td className="td">{item.productWeight}</td>
                    <td className="td">{item.productPure.toFixed(3)}</td>
                    <td className="td">{item.productAmount.toFixed(2)}</td>
                    <td className="td no-print">
                      <Button
                        onClick={() =>
                          handleRemoveOrder(
                            index,
                            item.productName,
                            item.productTouch,
                            item.productWeight,
                            item.stockId
                          )
                        }
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="no-products-message">
                    No products selected
                  </td>
                </tr>
              )}
              {/* <tr>
                <td  className="td merge-cell">
                  <strong>Total</strong>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td className="td">{totalPrice.toFixed(3)}</td>
                <td>TotalAmount</td>
                <td className="no-print"></td>
              </tr> */}
              <tr>
                <td className="td merge-cell">
                  <strong>Bill Total</strong>
                </td>
                <td className="td merge-cell"></td>
                <td className="td merge-cell"></td>
                <td className="td merge-cell no-print"></td>
                <td className="td merge-cell">
                  <strong>{totalPure.toFixed(3)}</strong>
                </td>
                <td className="td merge-cell">
                  <strong> {cashTotal.toFixed(2)}</strong>
                </td>
                <td className="td merge-cell no-print"></td>
              </tr>

              {customerBalance.balance !== 0 ? (
                <tr>
                  <td className="td merge-cell" colSpan={2}></td>
                  <td className="td merge-cell">
                    <strong>Old balance </strong>
                  </td>
                  <td className="td merge-cell no-print"></td>
                  <td className="td merge-cell">
                    <strong>+{customerBalance.balance.toFixed(3)}</strong>
                  </td>
                  <td className="td merge-cell">
                    <strong>+{customerBalance.balAmount.toFixed(2)}</strong>
                  </td>
                  <td className="td merge-cell no-print"></td>
                </tr>
              ) : (
                ""
              )}

              {customerBalance.exPure !== 0 ? (
                <tr>
                  <td className="td merge-cell" colSpan={2}></td>

                  <td className="td merge-cell">
                    <strong>Excees balance </strong>
                  </td>
                  <td className="td merge-cell no-print"></td>
                  <td className="td merge-cell">
                    <strong>-{customerBalance.exPure.toFixed(3)}</strong>
                  </td>
                  <td className="td merge-cell">
                    -{customerBalance.exBalAmount.toFixed(2)}
                  </td>
                  <td className="td merge-cell no-print"></td>
                </tr>
              ) : (
                ""
              )}

              <tr>
                <td className="td merge-cell" colSpan={2}></td>

                <td className="td merge-cell">
                  <strong>
                    {customerBalance.balance === 0 &&
                    customerBalance.exPure === 0
                      ? "Total"
                      : billPure >= 0
                      ? "old Balance Total"
                      : "Excees Total"}
                  </strong>
                </td>
                <td className="td merge-cell no-print"></td>
                <td className="td merge-cell">
                  <strong>{billPure.toFixed(3)}</strong>
                </td>
                <td className="td merge-cell">
                  <strong>{billAmount.toFixed(2)}</strong>
                </td>
                <td className="td merge-cell no-print"></td>
              </tr>
            </tbody>
          </table>
          <br></br>
          <Box className="items-section ">
            <div >
              <h3>Received Details:</h3>
              <p className="add-icon-wrapper no-print">
                <IconButton
                  size="small"
                  onClick={handleAddRow}
                  className="add-circle-icon"
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </p>
            </div>

            <table className="table received-details-table">
              <thead>
                <tr>
                  <th className="th">S.No</th>
                  <th className="th">Date</th>
                  <th className="th">Gold Rate</th>
                  <th className="th">Gold</th>
                  <th className="th">Touch</th>
                  <th className="th">Purity WT</th>
                  <th className="th">Amount</th>
                  {/* <th className="th">Hallmark</th> */}
                  <th className="th no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <tr key={index}>
                      <td className="td">{index + 1}</td>
                      <td className="td">
                        <TextField
                          className="date-field"
                          size="small"
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            handleRowChange(index, "date", e.target.value)
                          }
                          InputProps={{ disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.goldRate}
                          onChange={(e) =>
                            handleRowChange(index, "goldRate", e.target.value)
                          }
                          inputRef={registerRef(index, "goldRate")}
                          onKeyDown={(e) => handleKeyDown(e, index, "goldRate")}
                          type="number"
                          InputProps={{ disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.givenGold}
                          onChange={(e) =>
                            handleRowChange(index, "givenGold", e.target.value)
                          }
                          type="number"
                          InputProps={{ disableUnderline: true }}
                          inputRef={registerRef(index, "givenGold")}
                          onKeyDown={(e) =>
                            handleKeyDown(e, index, "givenGold")
                          }
                          autoComplete="off"
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.touch}
                          onChange={(e) =>
                            handleRowChange(index, "touch", e.target.value)
                          }
                          type="number"
                          InputProps={{ disableUnderline: true }}
                          inputRef={registerRef(index, "touch")}
                          onKeyDown={(e) => handleKeyDown(e, index, "touch")}
                          autoComplete="off"
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.purityWeight}
                          InputProps={{
                            readOnly: true,
                            disableUnderline: true,
                          }}
                          inputRef={registerRef(index, "purityWeight")}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.amount}
                          onChange={(e) =>
                            handleRowChange(index, "amount", e.target.value)
                          }
                          type="number"
                          InputProps={{ disableUnderline: true }}
                          autoComplete="off"
                          inputRef={registerRef(index, "amount")}
                        />
                      </td>
                      {/* <td className="td">
                        <TextField
                          size="small"
                          value={row.hallmark}
                          onChange={(e) =>
                            handleRowChange(index, "hallmark", e.target.value)
                          }
                          type="number"
                          InputProps={{ disableUnderline: true }}
                        />
                      </td> */}
                      <td className="td no-print">
                        {(!viewMode ||
                          index >=
                            (selectedBill?.receivedDetails?.length || 0)) && (
                          <IconButton onClick={() => handleDeleteRow(index)}>
                            <MdDeleteForever />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="no-products-message">
                      No received details added
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="td" colSpan={5}></td>
                  <td className="td">
                    <strong>Total</strong>:{receivedPure}
                  </td>
                  <td className="td" colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Box>
        <div className="flex">
          <b>
            {customerCashBalance < 0
              ? `Excess Cash Balance :${customerCashBalance.toFixed(2)}`
              : `Cash Balance: ${customerCashBalance.toFixed(2)}`}
          </b>
          <b>Excess Pure:{customerExpure.toFixed(3)}</b>
          <b>Pure Balance:{customerPure.toFixed(3)}</b>
          {/* <b>Hallmark Balance:</b> */}
        </div>
        {/* <Box className="closing-box">
          <p className="closing-line">
            <span>Received</span>
            <span>{pure.toFixed(3)}</span>
          </p>
          <p className="closing-line">
            <span>Closing</span>
            <span>
              {(balanceRow.length === 0 ? totalPure : closing).toFixed(3)}
            </span>
          </p>
        </Box> */}
        <br></br>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveBill}
          className="save-button no-print"
          disabled={billItems.length < 1}
        >
          Save
        </Button>
      </Box>

      <Box className="right-panel no-print">
        <h3
          className="heading"
          style={{ fontSize: "20px", marginBottom: "15px" }}
        >
          Available Product Weights
        </h3>
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell className="th">S.No</TableCell>
              <TableCell className="th">Product Finish Weight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productWeight.length > 0 ? (
              productWeight.map((product, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleProductSelect(index, product.stock_id)}
                  className="product-weight-row"
                >
                  <TableCell className="td">{index + 1}</TableCell>
                  <TableCell className="td">{product.value}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="td no-product-weight-message" colSpan={2}>
                  No product weight data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ToastContainer />
      </Box>
    </Box>
  );
};

export default Billing;

