import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Customer from "./components/Customer/Customer";
import Goldsmith from "./components/Goldsmith/Goldsmith";
import Billing from "./components/Billing/Billing";
import Report from "./components/Report/Report";
import Stock from "./components/Stock/Stock";
import Navbar from "./components/Navbar/Navbar";
import Master from "./components/Master/Master";
import MasterCustomer from "./components/Master/Mastercustomer";
import Customertrans from "./components/Customer/Customertrans";
import AddCustomer from "./components/Billing/Addcustomer";
import CustomerReport from "./components/Report/customer.report";
import Overallreport from "./components/Report/overallreport";
import GoldsmithDetails from "./components/Goldsmith/GoldsmithDetails";
import Jobcarddd from "./components/Goldsmith/Jobcarddd";
import JobcardddReport from "./components/Report/jobcardddReport";
import ReceiptReport from "./components/Report/receiptreport";
import Receipt from "./components/ReceiptVoucher/receiptvoucher";
import Customerorders from "./components/Customer/Customerorders";
import Orderreport from "./components/Report/orderreport";
import SrJobCard from "./components/Goldsmith/SrJobCard";
import JobCardReport from "./components/Report/SrJobCardReport";
import ProtectedRoutes from "./ProtectedRoutes/protected.routes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />

        {/* Protected routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Customer />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/goldsmith"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Goldsmith />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/bill"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Billing />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Report />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/customerreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <CustomerReport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/overallreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Overallreport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/orderreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Orderreport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/receiptreport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <ReceiptReport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }User Management

Create and manage user accounts
        />
        <Route
          path="/receiptvoucher"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Receipt />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Stock />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/customertrans"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Customertrans />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/customerorders"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Customerorders />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/jobCardReport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <JobCardReport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/goldsmithdetails/:id/:name"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <GoldsmithDetails />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/jobcarddd"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <Jobcarddd />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/jobcardddReport"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <JobcardddReport />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/jobcard/:id/:goldsmithname"
          element={
            <ProtectedRoutes>
              <PageWithNavbar>
                <SrJobCard />
              </PageWithNavbar>
            </ProtectedRoutes>
          }
        />
        <Route
          path="/addcustomer"
          element={
            <ProtectedRoutes>
              <AddCustomer />
            </ProtectedRoutes>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/master"
          element={
            <ProtectedRoutes>
              <Master />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/mastercustomer"
          element={
            <ProtectedRoutes>
              <MasterCustomer />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function PageWithNavbar({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ["/", "/home"];
  if (hideNavbarPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <>
      <div className="noPrint-nav">
        <Navbar />
      </div>
      <div style={{ paddingTop: "64px" }}>{children}</div>
    </>
  );
}

export default App;
