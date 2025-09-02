import { useEffect, useState, useRef } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import { FaCheck } from "react-icons/fa";
import { GrFormSubtract } from "react-icons/gr";
import {
  Autocomplete,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import axios from "axios";
import "./SrReport.css";

const JobCardReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [jobCard, setJobCard] = useState([]);
  const [goldSmith, setGoldSmith] = useState([]);
  const [selectedGoldSmith, setSelectedGoldSmith] = useState({});
  const [page, setPage] = useState(0); // 0-indexed for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isPrinting, setIsPrinting] = useState(true);
  const paginatedData = isPrinting
    ? jobCard.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : jobCard;

  const reportRef = useRef();

  // Calculate totals for current page
  const currentPageTotal = paginatedData.reduce(
    (acc, job) => {
      acc.givenWt += job.jobCardTotal[0]?.givenWt || 0;
      acc.itemWt += job.jobCardTotal[0]?.itemWt || 0;
      acc.stoneWt += job.jobCardTotal[0]?.stoneWt || 0;
      acc.wastage += job.jobCardTotal[0]?.wastage || 0;
      acc.receive += job.jobCardTotal[0].receivedTotal;
      return acc;
    },
    { givenWt: 0, itemWt: 0, stoneWt: 0, wastage: 0, receive: 0 }
  );

  const handleDownloadPdf = async () => {
  setIsPrinting(false); // show all rows

  const clearBtn = document.getElementById("clear");
  const printBtn = document.getElementById("print");
  const thead = document.getElementById("reportHead");
  const tfoot = document.getElementById("reportFoot");

  clearBtn.style.visibility = "hidden";
  printBtn.style.visibility = "hidden";
  thead.style.position = "static"; // fix for print
  tfoot.style.position = "static"; // fix for print

  setTimeout(async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Define margins
    const margin = 10; // mm
    const usableWidth = pdfWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let position = margin;
    let remainingHeight = imgHeight;
    let imgPosition = 0;

    if (imgHeight <= pdfHeight - margin * 2) {
      // fits in one page
      pdf.addImage(imgData, "PNG", margin, margin, usableWidth, imgHeight);
    } else {
      while (remainingHeight > 0) {
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          usableWidth,
          imgHeight,
          undefined,
          'FAST'
        );

        remainingHeight -= (pdfHeight - margin * 2);
        imgPosition -= (pdfHeight - margin * 2);

        if (remainingHeight > 0) {
          pdf.addPage();
          position = margin;
        }
      }
    }

    pdf.save("JobCard_Report.pdf");

    // Restore UI
    setIsPrinting(true);
    clearBtn.style.visibility = "visible";
    printBtn.style.visibility = "visible";
    thead.style.position = "sticky";
    tfoot.style.position = "sticky";
  }, 1000); // allow DOM to update
};



  const handleDateClear = () => {
    setFromDate(null);
    setToDate(null);
     setSelectedGoldSmith({})
  };

  const handleGoldSmith = (newValue) => {
    if (!newValue || newValue === null) {
      return;
    }
    setSelectedGoldSmith(newValue);

    const fetchJobCards = async () => {
      try {
        const from = fromDate ? fromDate.format("YYYY-MM-DD") : "";
        const to = toDate ? toDate.format("YYYY-MM-DD") : "";

        const response = await axios.get(
          `${BACKEND_SERVER_URL}/api/job-cards/${newValue.id}/goldsmithCard`,
          { params: { fromDate: from, toDate: to } }
        );
        console.log("data", response.data);
        setJobCard(response.data);

        setPage(0);
      } catch (error) {
        console.error("Error fetching goldsmith data:", error);
      }
    };
    fetchJobCards();
  };

  useEffect(() => {
    const fetchGoldsmiths = async () => {
      try {
        const response = await fetch(`${BACKEND_SERVER_URL}/api/goldsmith`);
        const data = await response.json();

        setGoldSmith(data || []);
      } catch (error) {
        console.error("Error fetching goldsmith data:", error);
      }
    };
    fetchGoldsmiths();
    const today = dayjs();
    setFromDate(today);
    setToDate(today);
  }, []);

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <div >
        <div className="reportHeader">
          <h3>GoldSmith Report</h3>
          <div className={`report ${!isPrinting ? "print-mode" : ""}`}>
            <label>From Date</label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  value={fromDate}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => setFromDate(newValue)}
                />
              </DemoContainer>
            </LocalizationProvider>
            <label>To Date</label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  value={toDate}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => setToDate(newValue)}
                />
              </DemoContainer>
            </LocalizationProvider>

            {/* Autocomplete */}
            <Autocomplete
              disablePortal
              options={goldSmith}
              getOptionLabel={(option) => option.name || ""}
              sx={{ width: 300 }}
              value={selectedGoldSmith}
              onChange={(event, newValue) => handleGoldSmith(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select GoldSmith" />
              )}
            />

            {isPrinting && (
              <Button
                id="clear"
                className="clr noprint reportBtn"
                onClick={handleDateClear}
              >
                Clear
              </Button>
            )}
            {isPrinting && (
              <div className="noprint">
                <Button
                  id="print"
                  onClick={() => {
                    handleDownloadPdf();
                  }}
                  className="reportBtn"
                >
                  Print
                </Button>
              </div>
            )}

            {jobCard.length > 0 && jobCard.at(-1)?.jobCardTotal?.length > 0 ? (
              <div className="jobInfo">
                {jobCard.at(-1).jobCardTotal[0].balance >= 0 ? (
                  <span style={{ color: "green",fontSize:"20px" }}>
                    Gold Smith Should Given{" "}
                    {jobCard.at(-1).jobCardTotal[0].balance.toFixed(3)}g
                  </span>
                ) : jobCard.at(-1).jobCardTotal[0].balance < 0 ? (
                  <span style={{ color: "red",fontSize:"20px"}}>
                    Owner Should Given{" "}
                    {jobCard.at(-1).jobCardTotal[0].balance.toFixed(3)}g
                  </span>
                ) : (
                  <span style={{ color: "black",fontSize:"20px" }}>balance 0</span>
                )}
              </div>
            ) : (
              <div className="jobInfo">
                <span>No Balance</span>
              </div>
            )}
          </div>
        </div>

        <div className="jobReportTable" >
          {paginatedData.length >= 1 ? (
         
              <div className="reportContainer" >
                <table ref={reportRef}>
                  <thead className="reportThead" id="reportHead">
                    <tr>
                      <th >S.No</th>
                      <th >Date</th>
                      <th >JobCard Id</th>
                      <th colSpan="5">Given Wt</th>
                      <th colSpan="4">Item Wt</th>
                      <th >Stone Wt</th>
                      <th >After Wastage</th>
                      <th >Balance</th>
                      <th colSpan="3">ReceiveAmt</th>
                      <th>Is Finished</th>
                    </tr>
                    <tr>
                      <th colSpan={3}></th>
                      <th>Issue Date</th>
                      <th>Name</th>
                      <th>Weight</th>
                      <th>GivenTotal</th>
                      <th>Touch</th>
                      <th>Dly Date</th>
                      <th>Name</th>
                      <th>Seal Name</th>
                      <th>Weight</th>
                      <th colSpan={3}></th>
                      <th>Weight</th>
                      <th>Touch</th>
                      <th>ReceiveTotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((job, jobIndex) => {
                      const given = job.givenGold;
                      const delivery = job.deliveryItem;
                      const receive = job.goldSmithReceived;
                      const maxRows =
                        Math.max(
                          given?.length,
                          delivery?.length,
                          receive?.length
                        ) || 1;
                      const total = job.jobCardTotal?.[0];

                      return [...Array(maxRows)].map((_, i) => {
                        const g = given?.[i] || {};
                        const d = delivery?.[i] || {};
                        const r = receive?.[i] || {};

                        return (
                          <tr key={`${job.id}-${i}`}>
                            {i === 0 && (
                              <>
                                <td rowSpan={maxRows} >
                                  { jobIndex + 1}
                                </td>
                                <td rowSpan={maxRows}>
                                  {new Date(job.createdAt).toLocaleDateString(
                                    "en-GB"
                                  )}
                                </td>
                                <td rowSpan={maxRows}>{job.id}</td>
                              </>
                            )}
                            <td>
                              {g?.createdAt
                                ? new Date(g.createdAt).toLocaleDateString(
                                    "en-GB"
                                  )
                                : "-"}
                            </td>
                            <td>{g?.itemName || "-"}</td>
                            <td>{g?.weight || "-"}</td>
                            {i === 0 && (
                              <td rowSpan={maxRows}>{total?.givenWt || "-"}</td>
                            )}
                            <td>{g?.touch || "-"}</td>
                            <td>
                              {d?.createdAt
                                ? new Date(d.createdAt).toLocaleDateString(
                                    "en-GB"
                                  )
                                : "-"}
                            </td>
                            <td>{d?.itemName || "-"}</td>
                            <td>{d?.sealName || "-"}</td>
                            <td>{d?.weight || "-"}</td>
                            {i === 0 && (
                              <>
                                <td rowSpan={maxRows}>
                                  {total?.stoneWt?.toFixed(3) ?? "-"}
                                </td>
                                <td rowSpan={maxRows}>
                                  {total?.wastage?.toFixed(3) ?? "-"}
                                </td>
                                <td rowSpan={maxRows}>
                                  {total?.balance?.toFixed(3) ?? "-"}
                                </td>
                              </>
                            )}
                            <td>{r?.weight || "-"}</td>
                            <td>{r?.touch || "-"}</td>
                            {i === 0 && (
                              <>
                                <td rowSpan={maxRows}>
                                  {total?.receivedTotal || "-"}
                                </td>
                                <td rowSpan={maxRows}>
                                  {total?.isFinished === "true" ? <FaCheck /> :<GrFormSubtract size={30}/>}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      });
                    })}
                  
                  </tbody>
                  <tfoot>
                      <tr className="totalOfJobCardReport" id="reportFoot" >
                      <td colSpan="5">
                        <b>Total</b>
                      </td>
                      <td>
                        <b>{currentPageTotal.givenWt.toFixed(3)}</b>
                      </td>
                      <td colSpan="5"></td>
                      <td>
                        <b>{currentPageTotal.itemWt.toFixed(3)}</b>
                      </td>
                      <td>
                        <b>{currentPageTotal.stoneWt.toFixed(3)}</b>
                      </td>
                      <td>
                        <b>{currentPageTotal.wastage.toFixed(3)}</b>
                      </td>
                      <td colSpan="3"></td>
                      <td>
                        <b>{currentPageTotal.receive.toFixed(3)}</b>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                 <TablePagination
               
                component="div"
                count={jobCard.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
              </div>
             
         
            

          ) : (
            <span style={{ display: "block", textAlign: "center" }}>
              No JobCard For this GoldSmith
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default JobCardReport;
