import { useState, useEffect } from "react";
import "./SrJobCard.css";
import { FaCheck } from "react-icons/fa";
import { GrFormSubtract } from "react-icons/gr";
import axios from "axios";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import NewJobCard from "./Newjobcard";
import { TablePagination } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const SrJobCard = () => {
  const navigate = useNavigate();
  const { id, goldsmithname } = useParams();
  const [masterItems, setMasterItems] = useState([]);
  const [masterSeal, setMasterSeal] = useState([]);
  const [goldSmith, setGoldSmith] = useState({
    goldSmithInfo: {
      id: "",
      name: "",
      address: "",
      phoneNo: "",
      wastage: "",
      balance: "",
    },
  });
  const [goldSmithWastage, setGoldSmithWastage] = useState(0);
  const [jobCards, setJobCard] = useState([]);
  const [openingBal, setOpeningBal] = useState();
  const [jobCardId, setJobCardId] = useState(null);
  const [jobCardLength, setJobCardLength] = useState(null);
  const [goldRows, setGoldRows] = useState([
    { username: localStorage.getItem("username"),itemName: "", weight: "", touch: "91.70" },
  ]);
  const [itemRows, setItemRows] = useState([
    { weight: "", itemName: "", sealName: "" },
  ]);
  const [deductionRows, setDeductionRows] = useState([
    { type: "Stone", customType: "", weight: "" },
  ]);
  const [received, setReceived] = useState([]);
  const [open, setopen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [jobCardIndex, setJobCardIndex] = useState(0);
  const [currentJob, setCurrentJob] = useState("");
  const [page, setPage] = useState(0); // 0-indexed for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedData = jobCards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const roundTo3 = (value) => Number(parseFloat(value).toFixed(3));

  const currentPageTotal = paginatedData.reduce(
    (acc, job) => {
      acc.givenWt += job.jobCardTotal[0]?.givenWt;
      acc.itemWt += job.jobCardTotal[0]?.itemWt;
      acc.stoneWt += job.jobCardTotal[0]?.stoneWt;
      acc.wastage += job.jobCardTotal[0]?.wastage;
      acc.receive += job.jobCardTotal[0]?.receivedTotal;
      return acc;
    },
    { givenWt: 0, itemWt: 0, stoneWt: 0, wastage: 0, receive: 0 } // Initial accumulator
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterJobCard = (id, jobindex) => {
    setJobCardId(id);
    setJobCardIndex(jobindex);

    const tempJobCard = [...jobCards];
    console.log("tempJobCard", tempJobCard);
    const filteredJobcard = tempJobCard.filter((item, _) => item.id === id);
    console.log("filter", filteredJobcard);
    setGoldRows(
      JSON.parse(JSON.stringify(filteredJobcard[0]?.givenGold || []))
    );
    setItemRows(
      JSON.parse(JSON.stringify(filteredJobcard[0]?.deliveryItem || []))
    );
    setDeductionRows(
      JSON.parse(JSON.stringify(filteredJobcard[0]?.additionalWeight || []))
    );
    setReceived(
      JSON.parse(JSON.stringify(filteredJobcard[0]?.goldSmithReceived || []))
    );

    setGoldSmithWastage(
      Number(filteredJobcard[0]?.jobCardTotal[0].goldSmithWastage).toFixed(3) ||
        0
    );
    setCurrentJob(filteredJobcard[0]?.jobCardTotal[0].isFinished);
    console.log(
      "filterJobStatus",
      filteredJobcard[0]?.jobCardTotal[0].isFinished
    );

    let lastBalance = filteredJobcard[0]?.jobCardTotal[0].openBal;
    console.log("lastBalance", lastBalance);
    setOpeningBal(lastBalance);

    setopen(true);
    setEdit(true);
  };
  const handleUpdateJobCard = async (
    totalGoldWt,
    totalItemWt,
    totalDeductionWt,
    totalWastage,
    totalBalance,
    openBal,
    totalReceivedWeight
  ) => {
    console.log("update");

    const payload = {
      goldRows: goldRows,
      itemRow: itemRows,
      deductionRows: deductionRows,
      receivedAmount: received,
      goldSmithBalance: {
        id: goldSmith.goldSmithInfo.id,
        balance: totalBalance,
      },
      total: {
        id: jobCards[jobCardIndex]?.jobCardTotal[0]?.id,
        givenWt: roundTo3(totalGoldWt),
        itemWt: roundTo3(totalItemWt),
        stoneWt: roundTo3(totalDeductionWt),
        wastage: roundTo3(totalWastage),
        goldSmithWastage: roundTo3(goldSmithWastage),
        balance: roundTo3(totalBalance),
        openBal: roundTo3(openBal),
        receivedTotal: roundTo3(totalReceivedWeight),
      },
    };
    console.log("payload update", payload);

    try {
      const response = await axios.put(
        `${BACKEND_SERVER_URL}/api/job-cards/${goldSmith.goldSmithInfo.id}/${jobCardId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 400) {
        alert(response.data.message);
      }
      console.log("Response:", response.data.jobCards); // success response
      setJobCard(response.data.jobCards);
      setJobCardLength(response.data.jobCardLength);
      setGoldSmith((prev) => ({
        ...prev,
        goldSmithInfo: {
          ...prev.goldSmithInfo,
          balance: response.data.goldSmithBalance.balance,
        },
      }));
      setopen(false);
      setEdit(false);
      setGoldRows([{ username: localStorage.getItem("username"),itemName: "", weight: "", touch: "91.70" }]);
      setItemRows([{ weight: "", itemName: "" }]);
      setDeductionRows([{ type: "Stone", customType: "", weight: "" }]);
      setReceived([]);
      toast.success(response.data.message);
    } catch (err) {
      console.error("POST Error:", err.response?.data || err.message);
      toast.error(
        err.message || "An error occurred while creating the job card"
      );
    }
  };
  const handleSaveJobCard = async (
    totalGoldWt,
    totalItemWt,
    totalDeductionWt,
    totalWastage,
    totalBalance,
    openBal,
    totalReceivedWeight
  ) => {
    const payload = {
      goldsmithId: goldSmith.goldSmithInfo.id,
      goldRows: goldRows,
      receivedAmount: received,
      goldSmithBalance: {
        id: goldSmith.goldSmithInfo.id,
        balance: totalBalance,
      },
      total: {
        givenWt: roundTo3(totalGoldWt),
        itemWt: roundTo3(totalItemWt),
        stoneWt: roundTo3(totalDeductionWt),
        wastage: roundTo3(totalWastage),
        goldSmithWastage: roundTo3(goldSmithWastage),
        balance: roundTo3(totalBalance),
        openBal: roundTo3(openBal),
        receivedTotal: roundTo3(totalReceivedWeight),
      },
    };
    console.log("payload", payload);
    try {
      const response = await axios.post(
        `${BACKEND_SERVER_URL}/api/job-cards/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response:", response.data.goldSmithBalance); // success response
      setJobCard(response.data.jobCards);
      setJobCardLength(response.data.jobCardLength);
      setGoldSmith((prev) => ({
        ...prev,
        goldSmithInfo: {
          ...prev.goldSmithInfo,
          balance: response.data.goldSmithBalance.balance,
        },
      }));
      setGoldRows([{username: localStorage.getItem("username"), itemName: "", weight: "", touch: "91.70" }]);
      setItemRows([{ weight: "", itemName: "" }]);
      setDeductionRows([{ type: "Stone", customType: "", weight: "" }]);
      setReceived([]);
      setopen(false);
      toast.success(response.data.message);
    } catch (err) {
      console.error("POST Error:", err.response?.data || err.message);
      toast.error(
        err.message || "An error occurred while creating the job card"
      );
    }
  };

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_SERVER_URL}/api/job-cards/${id}` // this is GoldSmith Id from useParams
        );
        console.log(res.data);
        const goldSmithRes = res.data.goldsmith;
        const newGoldSmith = {
          goldSmithInfo: {
            id: goldSmithRes?.id || "",
            name: goldSmithRes?.name || "",
            phoneNo: goldSmithRes?.phoneNo || "",
            address: goldSmithRes?.address || "",
            wastage: goldSmithRes?.wastage || "",
            balance: goldSmithRes?.balance[0]?.balance,
          },
        };
        console.log("res", res.data);
        setGoldSmith(newGoldSmith);
        setJobCard(res.data.jobCards);
        console.log("res", res.data.jobCards);
        setJobCardLength(res.data.jobCardLength);
      } catch (err) {
        alert(err.message);
        toast.error("Something went wrong.");
      }
    };
    const fetchMasterItem = async () => {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/master-items`);
      setMasterItems(res.data);
    };
    const fetchMasterSealItem = async () => {
      const res = await axios.get(`${BACKEND_SERVER_URL}/api/masterseal`);
      setMasterSeal(res.data);
    };
    fetchJobCards();
    fetchMasterItem();
    fetchMasterSealItem();
  }, []);
  const handleClosePop = () => {
    setopen(false);
    setGoldRows([{username: localStorage.getItem("username"), itemName: "", weight: "", touch: "91.70" }]);
    setItemRows([{ weight: "", itemName: "" }]);
    setDeductionRows([{ type: "Stone", customType: "", weight: "" }]);
    setReceived([]);
  };
  const handleOpenJobCard = async () => {
    setopen(true);
    setEdit(false);
    console.log("goldSmith", goldSmith.goldSmithInfo.wastage);
    setGoldSmithWastage(goldSmith.goldSmithInfo.wastage);
    try {
      const res = await axios.get(
        `${BACKEND_SERVER_URL}/api/job-cards/${id}/lastBalance` // this id is GoldSmithId
      );

      res.data.status === "nobalance"
        ? setOpeningBal(res.data.balance)
        : setOpeningBal(res.data.balance);
    } catch (err) {
      alert(err.message);
      toast.error("Something went wrong.");
    }
  };

  return (
    <>
      <div className="jobCard">
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={true}
          closeOnClick
          pauseOnHover={false}
          draggable={false}
        />

        <div className="goldSmith">
          <h3 className="goldsmithhead">Gold Smith Information</h3>
          <div className="goldSmithInfo">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <p>
                <strong>Name:</strong> {goldSmith?.goldSmithInfo?.name}
              </p>
              <p>
                <strong>Phone Number:</strong>{" "}
                {goldSmith?.goldSmithInfo?.phoneNo}
              </p>
            </div>

            {jobCards.length > 0 &&
              jobCards.at(-1)?.jobCardTotal?.length > 0 && (
                <div>
                  {jobCards.at(-1).jobCardTotal[0].balance > 0 ? (
                    <p style={{ color: "green", fontWeight: "bolder" }}>
                      Gold Smith Should Given{" "}
                      {jobCards.at(-1).jobCardTotal[0].balance.toFixed(3)}g
                    </p>
                  ) : jobCards.at(-1).jobCardTotal[0].balance < 0 ? (
                    <p style={{ color: "red", fontWeight: "bolder" }}>
                      Owner Should Given{" "}
                      {jobCards.at(-1).jobCardTotal[0].balance.toFixed(3)} g
                    </p>
                  ) : (
                    <p style={{ color: "black", fontWeight: "bolder" }}>
                      Balance Nill:{" "}
                      {jobCards.at(-1).jobCardTotal[0].balance.toFixed(3)} g
                    </p>
                  )}
                </div>
              )}

            <button
              className="addbtn"
              onClick={() => {
                handleOpenJobCard();
              }}
            >
              Add New JobCard
            </button>
          </div>
        </div>

        <div className="jobcardTable">
          {paginatedData.length >= 1 ? (
            <table>
              <thead className="jobCardThead">
                <tr>
                  <th rowSpan={2}>S.No</th>
                  <th rowSpan={2}>Date</th>
                  <th rowSpan={2}>JobCard Id</th>
                  <th colSpan={5}>Given Wt</th>
                  <th colSpan={4}>Item Wt</th>
                  <th rowSpan={2}>Stone Wt</th>
                  <th rowSpan={2}>After Wastage</th>
                  <th rowSpan={2}>Balance</th>
                  <th colSpan={3}>ReceiveAmt</th>
                  <th rowSpan={2}>isFinished</th>
                  <th rowSpan={2}>Action</th>
                </tr>
                <tr>
                  <th>Issue Date</th>
                  <th>Name</th>
                  <th>Weight</th>
                  <th>GivenTotal</th>
                  <th>Touch</th>
                  <th>Dly Date</th>
                  <th>Name</th>
                  <th>Seal Name</th>
                  <th>Weight</th>
                  <th>Weight</th>
                  <th>Touch</th>
                  <th>ReceiveTotal</th>
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

                  return [...Array(maxRows)].map((_, i) => {
                    const g = given?.[i] || {};
                    const d = delivery?.[i] || {};
                    const r = receive?.[i] || {};
                    const total = job.jobCardTotal?.[0];

                    return (
                      <tr key={`${job.id}-${i}`}>
                        {i === 0 && (
                          <>
                            <td rowSpan={maxRows}> {jobIndex + 1}</td>
                            <td rowSpan={maxRows}>
                              {new Date(job.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td rowSpan={maxRows}>{job.id}</td>
                          </>
                        )}

                        <td>
                          {g?.createdAt
                            ? new Date(g?.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                        <td>{g?.itemName || "-"}</td>
                        <td>{Number(g?.weight)?.toFixed(3) || "-"}</td>
                        {i === 0 && (
                          <td rowSpan={maxRows}>{total?.givenWt || "-"}</td>
                        )}
                        <td>{g?.touch || "-"}</td>
                        <td>
                          {" "}
                          {d?.createdAt
                            ? new Date(d?.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                        <td>{d?.itemName || "-"}</td>
                        <td>{d?.sealName || "-"}</td>
                        <td>{Number(d?.weight)?.toFixed(3) || "-"}</td>

                        {i === 0 && (
                          <>
                            <td rowSpan={maxRows}>
                              {(total?.stoneWt).toFixed(3) ?? "-"}
                            </td>
                            <td rowSpan={maxRows}>
                              {(total?.wastage).toFixed(3) ?? "-"}
                            </td>
                            <td rowSpan={maxRows}>
                              {(total?.balance).toFixed(3) ?? "-"}
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
                              {total?.isFinished === "true" ? (
                                <FaCheck />
                              ) : (
                                <GrFormSubtract size={30} />
                              )}
                            </td>

                            <td rowSpan={maxRows}>
                              <button
                                style={{
                                  color: "white",
                                  backgroundColor: "green",
                                  fontSize: "18px",
                                }}
                                onClick={() =>
                                  handleFilterJobCard(job.id, jobIndex)
                                }
                              >
                                View
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  });
                })}
              </tbody>

              <tfoot className="totalOfJobCard">
                <tr>
                  <td colSpan={5}>
                    <b>Total</b>
                  </td>
                  <td>
                    <b> {currentPageTotal.givenWt?.toFixed(3)}</b>
                  </td>
                  <td colSpan={5}></td>
                  <td>
                    <b>{currentPageTotal?.itemWt?.toFixed(3)}</b>
                  </td>
                  <td>
                    <b>{currentPageTotal?.stoneWt?.toFixed(3)}</b>
                  </td>
                  <td>
                    <b>{currentPageTotal?.wastage?.toFixed(3)}</b>
                  </td>
                  <td colSpan={3}></td>
                  <td>
                    <b>{currentPageTotal?.receive?.toFixed(3)}</b>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <span className="noJobCard">No JobCard For this GoldSmith</span>
          )}
          {jobCards.length >= 1 && (
            <TablePagination
              component="div"
              count={jobCards.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </div>
      </div>
      {open && (
        <NewJobCard
          name={goldSmith?.goldSmithInfo?.name}
          goldSmithWastage={goldSmithWastage}
          setGoldSmithWastage={setGoldSmithWastage}
          balance={openingBal}
          goldRows={goldRows}
          setGoldRows={setGoldRows}
          itemRows={itemRows}
          setItemRows={setItemRows}
          deductionRows={deductionRows}
          setDeductionRows={setDeductionRows}
          received={received}
          setReceived={setReceived}
          masterItems={masterItems}
          masterSeal={masterSeal}
          handleSaveJobCard={handleSaveJobCard}
          handleUpdateJobCard={handleUpdateJobCard}
          jobCardLength={jobCardLength}
          jobCardId={jobCardId}
          lastJobCardId={jobCards?.at(-1)?.jobCardTotal[0]?.jobcardId}
          lastIsFinish={jobCards?.at(-1)?.jobCardTotal[0]?.isFinished}
          isFinished={currentJob}
          open={open}
          onclose={() => handleClosePop()}
          edit={edit}
        ></NewJobCard>
      )}
    </>
  );
};
export default SrJobCard;
