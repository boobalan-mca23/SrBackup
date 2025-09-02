
import React, { useEffect, useState } from "react";
import "./overallreport.css";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OverallReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    setReportData([]);

    try {
      const [customersRes, billsRes, jewelRes, coinRes, entriesRes] =
        await Promise.all([
          fetch(`${BACKEND_SERVER_URL}/api/customers`),
          fetch(`${BACKEND_SERVER_URL}/api/bills`),
          fetch(`${BACKEND_SERVER_URL}/api/jewel-stock`),
          fetch(`${BACKEND_SERVER_URL}/api/v1/stocks`),
          fetch(`${BACKEND_SERVER_URL}/api/entries`),
        ]);

      if (!customersRes.ok) throw new Error("Failed to fetch customers");
      if (!billsRes.ok) throw new Error("Failed to fetch bills");
      if (!jewelRes.ok) throw new Error("Failed to fetch jewel stock");
      if (!coinRes.ok) throw new Error("Failed to fetch coin stock");
      if (!entriesRes.ok) throw new Error("Failed to fetch entries");

      const [customers, bills, jewelData, coinData, entriesData] =
        await Promise.all([
          customersRes.json(),
          billsRes.json(),
          jewelRes.json(),
          coinRes.json(),
          entriesRes.json(),
        ]);

      const totalCashGoldEntriesPurity = entriesData.reduce(
        (sum, entry) => sum + parseFloat(entry.purity || 0),
        0
      );

      const customerBalances = customers.map((customer) => {
        const customerBills = bills.filter(
          (bill) => bill.customerId === customer.id
        );

        const totalBillAmount = customerBills.reduce((sum, bill) => {
          const billAmount =
            bill.items.reduce(
              (billSum, item) => billSum + item.purity * bill.goldRate,
              0
            ) + (bill.hallmarkCharges || 0);
          return sum + billAmount;
        }, 0);

        const totalReceived = customerBills.reduce((sum, bill) => {
          return (
            sum +
            bill.receivedDetails.reduce(
              (receivedSum, detail) => receivedSum + detail.amount,
              0
            )
          );
        }, 0);

        return {
          customerId: customer.id,
          customerName: customer.name,
          balance: totalBillAmount - totalReceived,
        };
      });

      const customerBalanceTotal = customerBalances.reduce(
        (sum, customer) => sum + customer.balance,
        0
      );

      const totalJewelPurity = jewelData.reduce(
        (sum, item) => sum + parseFloat(item.purityValue || 0),
        0
      );

      const totalCoinPurity = coinData.reduce(
        (sum, item) => sum + parseFloat(item.purity || 0),
        0
      );

      let allTransactions = [];
      try {
        const transRes = await fetch(`${BACKEND_SERVER_URL}/api/transactions`);
        if (transRes.ok) {
          allTransactions = await transRes.json();
        } else {
          const customerTransactions = await Promise.all(
            customers.map((customer) =>
              fetch(`${BACKEND_SERVER_URL}/api/transactions/${customer.id}`)
                .then((res) => (res.ok ? res.json() : []))
                .catch(() => [])
            )
          );
          allTransactions = customerTransactions.flat();
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.warn("Could not load all transactions");
      }

      const advancesGold = allTransactions.reduce(
        (sum, t) => sum + parseFloat(t.purity || 0),
        0
      );

      const overallValue =
        customerBalanceTotal +
        totalCashGoldEntriesPurity +
        totalCoinPurity +
        totalJewelPurity -
        advancesGold;

      setReportData([
        {
          label: "Customer Balance Total",
          value: `₹${customerBalanceTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          tooltip: "Sum of all customer balances (bills minus payments)",
        },
        {
          label: "Cash/Gold (Entries Purity)",
          value: `${totalCashGoldEntriesPurity.toFixed(3)}g`,
          tooltip:
            "Total gold purity from all manual Cash/Gold entries in the system",
        },
        {
          label: "Coin Stock",
          value: `${coinData.length} Coins (${totalCoinPurity.toFixed(
            3
          )}g Purity)`,
          tooltip: "Current coin inventory with total purity",
        },
        {
          label: "Jewel Stock",
          value: `${jewelData.length} Items (${totalJewelPurity.toFixed(
            3
          )}g Purity)`,
          tooltip: "Current jewel inventory with total purity",
        },
        {
          label: "Advances in Gold (Purity)",
          value: `${advancesGold.toFixed(3)}g`,
          tooltip:
            "Total gold purity equivalent from all customer advance transactions (both cash and gold advances)",
        },
        {
          label: "Active Customers",
          value: `${customers.length} (${
            customerBalances.filter((c) => c.balance > 0).length
          } with balance)`,
          tooltip: "Total customers and those with outstanding balances",
        },
        {
          label: "Overall Value",
          value: `₹${overallValue.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          tooltip:
            "Customer Balance + Cash/Gold + Coin + Jewel - Advances in Gold",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      toast.error(`Error: ${error.message}`);
      setReportData([
        {
          label: "Error",
          value: "Could not load report data",
          tooltip: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overall-report-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="report-header">
        <h2>Overall Report</h2>
      </div>

      {reportData.length > 0 && (
        <div className="report-cards-container">
          {reportData.map((item, index) => (
            <div key={index} className="report-card" title={item.tooltip}>
              <div className="card-label">{item.label}</div>
              <div className="card-value">{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OverallReport;

