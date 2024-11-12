import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsExclamationCircle, BsSearch } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import Modal from "react-modal";
import TestPrint from "./TestPrint";
import logo from "../../assets/logo.png";
import rkmgtemple from "../../assets/rkmgtemple.png";
import "./Form.css";
import { HashLoader } from "react-spinners";

Modal.setAppElement("#root");

const Form = () => {
  const url = "http://192.168.0.238:8081";

  const initialState = {
    submittedby_user: "",
    name: "",
    address: "",
    district: "",
    city: "",
    state: "",
    pinCode: "",
    mobileNo: "",
    altMobileNo: "",
    email: "",
    idType: "",
    idNo: "",
    purposeOfDonation: "",
    donationMethod: "",
    amount: "",
    specifyPurpose: "",
    chequeNo: "",
    dated: "",
    onBank: "",
  };

  const initialErrors = {
    submittedby_user: "",
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    mobileNo: "",
    altMobileNo: "",
    email: "",
    idNo: "",
    purposeOfDonation: "",
    donationMethod: "",
    amount: "",
    specifyPurpose: "",
    chequeNo: "",
    dated: "",
    onBank: "",
  };

  const [showSearchModal, setShowSearchModal] = useState(true); // Show on form load
  const [searchMobileNo, setSearchMobileNo] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrors);
  const [showPreview, setShowPreview] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem("loggedInUser") || ""
  );
  const [showLoginModal, setShowLoginModal] = useState(!loggedInUser);
  const [userOptions, setUserOptions] = useState([]);
  const [buttonText, setButtonText] = useState("Confirm Submission");
  const billRef = useRef(null);
  const [reportData, setReportData] = useState([]);
  const [showReportDataModal, setShowReportDataModal] = useState(false);
  const [subTotal, setSubTotal] = useState(0); // State to hold the Sub Total
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleLogout();
        window.location.reload();
        toast.warning("Logged out due to inactivity.");
      }, 600000); // 10 minutes in milliseconds
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);

    resetTimer(); // Initialize the timer when the component mounts

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
    };
  }, [loggedInUser]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("loggedInUser");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loggedInUser]);

  useEffect(() => {
    fetch(url + "/api/get-users")
      .then((response) => response.json())
      .then((data) => setUserOptions(data))
      .catch((error) => toast.error("Failed to fetch users"));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoading(true);
      try {
        const response = await fetch(url + "/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
          setLoggedInUser(username);
          localStorage.setItem("loggedInUser", username);
          setShowLoginModal(false);
          toast.success("Login successful!");
        } else {
          toast.error("Invalid credentials");
        }
      } catch (error) {
        toast.error("Network Error. Please try again later.");
      }
      setIsLoading(false);
    } else {
      toast.error("Please enter your credentials");
    }
  };

  const handleLogout = () => {
    toast.success(loggedInUser + " logged out successfully!");
    setLoggedInUser("");
    localStorage.removeItem("loggedInUser");
    setShowLoginModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setFormErrors((prevState) => ({ ...prevState, [name]: "" }));
  };

  const handlePurposeChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      purposeOfDonation: value,
      specifyPurpose: "",
    }));
    setFormErrors((prevState) => ({
      ...prevState,
      purposeOfDonation: "",
      specifyPurpose: "",
    }));
  };

  const handleSearch = async () => {
    if (!/^\d{10}$/.test(searchMobileNo)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${url}/api/search-by-mobile?mobileNo=${searchMobileNo}`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          setSearchResults(result.data);
        } else {
          setSearchResults([]);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to fetch records.");
      }
    } catch (error) {
      toast.error("Network Error. Please try again later.");
    }
    setIsSearching(false);
  };

  const handleAddUser = (user) => {
    setFormData({
      ...formData,
      name: user.name || "",
      address: user.address || "",
      district: user.district || "",
      city: user.city || "",
      state: user.state || "",
      pinCode: user.pinCode || "",
      mobileNo: user.mobileNo || "",
      altMobileNo: user.altMobileNo || "",
      email: user.email || "",
      idType: user.idType || "",
      idNo: user.idNo || "",
      // Retain other form fields as is
    });
    setShowSearchModal(false);
    toast.success("Form pre-filled with selected user data.");
  };

  const handleProceedWithoutSearch = () => {
    setFormData({
      ...formData,
      mobileNo: searchMobileNo,
    });
    setShowSearchModal(false);
  };

  const validateFormData = () => {
    let errors = { ...initialErrors };
    let hasError = false;

    if (!formData.name.trim()) {
      errors.name = "Please enter a valid name.";
      hasError = true;
    }
    if (!formData.address.trim()) {
      errors.address = "Please enter a valid address.";
      hasError = true;
    }
    if (!formData.city.trim()) {
      errors.city = "Please enter a valid city.";
      hasError = true;
    }
    if (!formData.state.trim()) {
      errors.state = "Please enter a valid state.";
      hasError = true;
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      errors.pinCode = "Please enter a valid 6-digit pin code.";
      hasError = true;
    }
    if (!/^\d{10}$/.test(formData.mobileNo)) {
      errors.mobileNo = "Please enter a valid 10-digit mobile number.";
      hasError = true;
    }
    if (formData.altMobileNo && !/^\d{10}$/.test(formData.altMobileNo)) {
      errors.altMobileNo =
        "Please enter a valid 10-digit alternate mobile number.";
      hasError = true;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
      hasError = true;
    }
    if (!formData.idNo.trim()) {
      errors.idNo = "Please enter a valid ID number.";
      hasError = true;
    }
    if (!formData.purposeOfDonation.trim()) {
      errors.purposeOfDonation = "Please select a purpose of donation.";
      hasError = true;
    } else if (
      formData.purposeOfDonation.includes("(Please Specify)") &&
      !formData.specifyPurpose.trim()
    ) {
      errors.specifyPurpose = "Please specify the purpose of donation.";
      hasError = true;
    }
    if (!formData.donationMethod.trim()) {
      errors.donationMethod = "Please select a donation method.";
      hasError = true;
    }
    if (formData.donationMethod === "Cheque") {
      if (!/^\d{6}$/.test(formData.chequeNo)) {
        errors.chequeNo = "Please enter a valid 6-digit cheque number.";
        hasError = true;
      }
      if (!formData.dated.trim()) {
        errors.dated = "Please select a valid date.";
        hasError = true;
      }
      if (!formData.onBank.trim()) {
        errors.onBank = "Please enter the bank name.";
        hasError = true;
      }
    }
    if (parseFloat(formData.amount) <= 0) {
      errors.amount = "Donation amount should be greater than zero.";
      hasError = true;
    }

    setFormErrors(errors);

    if (hasError) {
      const firstErrorField = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      toast.error("Please correct the highlighted errors.");
    }

    return !hasError;
  };

  const handleGenerateBill = (e) => {
    e.preventDefault();
    if (validateFormData()) {
      setShowPreview(true);
      setButtonText("Confirm Submission");
    }
  };

  const handleConfirmSubmit = async () => {
    if (validateFormData()) {
      setIsSubmitting(true);
      let finalPurpose = formData.purposeOfDonation;
      if (formData.purposeOfDonation.includes("(Please Specify)")) {
        finalPurpose = formData.purposeOfDonation.replace(
          "(Please Specify)",
          `(${formData.specifyPurpose})`
        );
      }

      // Determine the isAccepted value
      const isAccepted =
        formData.donationMethod === "Cheque" ||
        formData.donationMethod === "Bank Transfer (PoS)"
          ? 1
          : 0;

      try {
        // Submit the form and get the new record id and date
        const response = await fetch(url + "/api/submit-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            purposeOfDonation: finalPurpose,
            submittedby_user: loggedInUser,
            isAccepted,
          }),
        });

        if (response.ok) {
          toast.success("Form submitted successfully!");
          const result = await response.json();

          // Generate the receiptId
          const dateObj = new Date(result.date);
          const financialYear =
            dateObj.getMonth() >= 3
              ? `${dateObj.getFullYear() % 100}${
                  (dateObj.getFullYear() + 1) % 100
                }`
              : `${(dateObj.getFullYear() - 1) % 100}${
                  dateObj.getFullYear() % 100
                }`;
          let receiptPrefix;

          // Determine the prefix based on the donation method
          if (formData.donationMethod.toLowerCase() === "cash") {
            receiptPrefix = "C";
          } else if (
            formData.donationMethod.toLowerCase() === "cheque" ||
            formData.donationMethod.toLowerCase() === "bank transfer (pos)"
          ) {
            receiptPrefix = "D";
          } else {
            receiptPrefix = formData.donationMethod.toUpperCase(); // fallback to using the full method name in uppercase if it doesn't match specific cases
          }

          // Generate the receiptId using the appropriate prefix
          const receiptId = `${financialYear}/${receiptPrefix}/${result.id
            .toString()
            .padStart(10, "0")}`;

          // Update the receiptId in the database
          await fetch(url + `/api/update-receipt-id`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: result.id, receiptId }),
          });

          // Update the formData with the receiptId and display the preview
          setFormData((prevState) => ({
            ...prevState,
            id: result.id,
            date: new Date(result.date).toLocaleDateString("en-IN"),
            receiptId,
          }));
          setButtonText("Print Receipt");
          setShowPreview(true);
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to submit form");
        }
      } catch (error) {
        toast.error(error.message || "An error occurred!");
      }
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData(initialState);
    setFormErrors(initialErrors);
    setButtonText("Confirm Submission"); // Reset button text to initial state
    setShowPreview(false);
  };

  const handlePrint = () => {
    const printContent = billRef.current;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Print Receipt</title>");
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
      handleClear();
    };
  };

  const handleReportRequest = async () => {
    setIsReportLoading(true);
    try {
      // const formattedStartTime = startTime || '00:00'; // Default to 00:00 if not provided
      // const formattedEndTime = endTime || '23:59'; // Default to 23:59 if not provided
      const response = await fetch(
        url +
          `/api/records?column=submittedby_user&value=${loggedInUser}&showUnaccepted=1`
      );
      // const response = await fetch(url + `/api/unaccepted-records`);
      if (response.ok) {
        const data = await response.json();
        // Calculate the Sub Total
        const total = data.reduce(
          (acc, row) => acc + parseFloat(row.amount),
          0
        );
        setSubTotal(total);
        setReportData(data);
        setShowReportDataModal(true); // Show the report data modal
        console.log("Report data modal should be visible now.");
        toast.success("Report fetched successfully!");
      } else {
        toast.error("Failed to fetch the report.");
      }
    } catch (error) {
      toast.error("Error fetching the report.");
    }
    setIsReportLoading(false);
  };

  // Function to close the Report Data Modal
  const closeReportDataModal = () => setShowReportDataModal(false);

  // Function to download the report as CSV
  const downloadCSV = () => {
    const csvHeader = [
      "Receipt ID",
      "Name",
      "Mobile No",
      "ID Type",
      "ID No",
      "Purpose",
      "Method",
      "Amount",
      "Date/Time",
    ];
    const csvRows = reportData.map((row) => [
      row.receiptId,
      row.name,
      row.mobileNo,
      row.idType,
      row.idNo,
      row.purposeOfDonation,
      row.donationMethod,
      row.amount,
      (() => {
        const date = new Date(row.submissionDateTime);
        date.setHours(date.getHours() + 5); // Add 5 hours
        date.setMinutes(date.getMinutes() + 30); // Add 30 minutes
        return date
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
          .replace(",", ""); // Removes the comma between date and time
      })(),
    ]);

    // Add Sub Total row at the end
    csvRows.push([
      "Sub Total",
      "",
      "",
      "",
      "",
      "",
      "",
      subTotal.toFixed(2),
      "",
    ]);

    const csvContent = [
      csvHeader.join(","),
      ...csvRows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report download started.");
  };

  return (
    <>
      <div
        className="no-scroll"
        style={{
          backgroundImage: `url(${rkmgtemple})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)", // Apply the blur effect
          height: "100vh", // Ensure it covers the full viewport height
          width: "100vw", // Ensure it covers the full viewport width
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: "-1", // Place it behind all other content
        }}
      />
      <div className="container mx-auto p-4 bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 opacity-80 shadow-lg rounded-lg max-w-3xl no-scrollbar h-screen overflow-y-scroll">
        {/* Header with View Report and Logged-in User */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            // onClick={openReportModal}
            onClick={handleReportRequest}
            disabled={isReportLoading}
          >
            {isReportLoading ? (
              <HashLoader size={18} color={"#FFFFFF"} />
            ) : (
              "View Report"
            )}
          </button>
          <div className="flex items-center">
            <span className="text-gray-700 font-semibold mr-4">
              Logged in as: {loggedInUser}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-6">
          <img src={logo} alt="RKMG Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-semibold mb-6 text-center">
            Ramakrishna Mission Ashrama Donation Form
          </h1>
        </div>

        {!showSearchModal && (
          <form
            onSubmit={handleGenerateBill}
            className="space-y-6 px-4 sm:px-8"
          >
            {[
              { label: "Name", id: "name", type: "text", required: true },
              { label: "Address", id: "address", type: "text", required: true },
              {
                label: "District",
                id: "district",
                type: "text",
                required: true,
              },
              { label: "City", id: "city", type: "text", required: true },
              { label: "State", id: "state", type: "text", required: true },
              {
                label: "Pin Code",
                id: "pinCode",
                type: "text",
                required: true,
              },
              {
                label: "Mobile No",
                id: "mobileNo",
                type: "text",
                required: true,
              },
              { label: "Alternate Mobile No", id: "altMobileNo", type: "text" },
              { label: "Email", id: "email", type: "email" },
              {
                label: "ID Type",
                id: "idType",
                type: "select",
                required: true,
                options: [
                  "Aadhar Card",
                  "PAN Card",
                  "Driving Licence",
                  "Voter Card",
                  "Passport",
                ],
              },
              { label: "ID Number", id: "idNo", type: "text", required: true },
              {
                label: "Purpose of Donation",
                id: "purposeOfDonation",
                type: "select",
                required: true,
                options: [
                  "Thakur Seva",
                  "Sadhu Seva",
                  "Monthly",
                  "Durga Puja",
                  "Kali Puja",
                  "Saraswati Puja",
                  "Shadoshi Puja",
                  "Tithi - Thakur",
                  "Tithi - Maa",
                  "Tithi - Swamiji",
                  "Development Fund (Please Specify)",
                  "Permanent Fund (Please Specify)",
                  "Others (Please Specify)",
                ],
              },
              {
                label: "Donation Method",
                id: "donationMethod",
                type: "select",
                required: true,
                options: ["Cash", "Cheque", "Bank Transfer (PoS)"],
              },
              { label: "Amount", id: "amount", type: "number", required: true },
            ].map((field) =>
              field.type !== "select" ? (
                <div key={field.id} className="flex flex-col">
                  <label
                    htmlFor={field.id}
                    className="mb-2 font-medium flex items-center"
                  >
                    {field.label}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <div className="flex items-center">
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      value={formData[field.id]}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label}`}
                      className={`w-full p-2 border ${
                        formErrors[field.id]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700`}
                      required={field.required}
                      aria-label={field.label}
                    />
                    {formErrors[field.id] && (
                      <BsExclamationCircle className="text-red-500 text-3xl ml-2 animate-pulse" />
                    )}
                  </div>
                  {formErrors[field.id] && (
                    <span className="text-red-500 text-sm mt-1">
                      {formErrors[field.id]}
                    </span>
                  )}
                </div>
              ) : (
                <div key={field.id} className="flex flex-col">
                  <label
                    htmlFor={field.id}
                    className="mb-2 font-medium flex items-center"
                  >
                    {field.label}
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center">
                    <select
                      id={field.id}
                      name={field.id}
                      value={formData[field.id]}
                      onChange={
                        field.id === "purposeOfDonation"
                          ? handlePurposeChange
                          : handleChange
                      }
                      className={`w-full p-2 border ${
                        formErrors[field.id]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700`}
                      required={field.required}
                      aria-label={field.label}
                    >
                      <option value="">Select</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {formErrors[field.id] && (
                      <BsExclamationCircle className="text-red-500 text-3xl ml-2 animate-pulse" />
                    )}
                  </div>
                  {formErrors[field.id] && (
                    <span className="text-red-500 text-sm mt-1">
                      {formErrors[field.id]}
                    </span>
                  )}
                  {field.id === "purposeOfDonation" &&
                    formData.purposeOfDonation.includes("(Please Specify)") && (
                      <div className="flex flex-col mt-2">
                        <label
                          htmlFor="specifyPurpose"
                          className="mb-2 font-medium flex items-center"
                        >
                          Please Specify
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            id="specifyPurpose"
                            name="specifyPurpose"
                            value={formData.specifyPurpose}
                            onChange={handleChange}
                            placeholder="Enter the specific purpose"
                            className={`w-full p-2 border ${
                              formErrors.specifyPurpose
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700`}
                            aria-label="Specify Purpose"
                          />
                          {formErrors.specifyPurpose && (
                            <BsExclamationCircle className="text-red-500 text-3xl ml-2 animate-pulse" />
                          )}
                        </div>
                        {formErrors.specifyPurpose && (
                          <span className="text-red-500 text-sm mt-1">
                            {formErrors.specifyPurpose}
                          </span>
                        )}
                      </div>
                    )}
                </div>
              )
            )}

            {formData.donationMethod === "Cheque" && (
              <div className="flex space-x-4">
                <div className="flex flex-col">
                  <label htmlFor="chequeNo" className="mb-2 font-medium">
                    Cheque No <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="chequeNo"
                    name="chequeNo"
                    value={formData.chequeNo}
                    onChange={handleChange}
                    placeholder="Enter Cheque No"
                    className={`w-full p-2 border ${
                      formErrors.chequeNo ? "border-red-500" : "border-gray-300"
                    } rounded`}
                    required
                    pattern="\d{6}" // Ensure that chequeNo is 6 digits
                  />
                  {formErrors.chequeNo && (
                    <span className="text-red-500 text-sm mt-1">
                      {formErrors.chequeNo}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="dated" className="mb-2 font-medium">
                    Dated <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    id="dated"
                    name="dated"
                    value={formData.dated}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      formErrors.dated ? "border-red-500" : "border-gray-300"
                    } rounded`}
                    required
                  />
                  {formErrors.dated && (
                    <span className="text-red-500 text-sm mt-1">
                      {formErrors.dated}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="onBank" className="mb-2 font-medium">
                    On Bank <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="onBank"
                    name="onBank"
                    value={formData.onBank}
                    onChange={handleChange}
                    placeholder="Enter Bank Name"
                    className={`w-full p-2 border ${
                      formErrors.onBank ? "border-red-500" : "border-gray-300"
                    } rounded`}
                    required
                  />
                  {formErrors.onBank && (
                    <span className="text-red-500 text-sm mt-1">
                      {formErrors.onBank}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
              >
                Preview Receipt
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
              >
                Clear All
              </button>
            </div>
          </form>
        )}
        <ToastContainer />

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full max-w-lg">
              {/* The receipt preview is rendered without a surrounding white box */}
              <div
                ref={billRef}
                style={{ backgroundColor: "transparent", margin: "0 auto" }}
              >
                <TestPrint formData={formData} />
              </div>

              {/* A separate white box surrounding only the buttons */}
              <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
                <div className="flex justify-around">
                  {buttonText === "Confirm Submission" ? (
                    <>
                      <button
                        onClick={handleConfirmSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <HashLoader size={18} color={"#FFFFFF"} />
                        ) : (
                          "Confirm Submission"
                        )}
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handlePrint}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Print Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        <Modal
          isOpen={showLoginModal}
          onRequestClose={() => {}}
          shouldCloseOnOverlayClick={false}
          contentLabel="Login Modal"
          ariaHideApp={false}
          className="fixed inset-0 flex items-center justify-center z-50 transform transition-transform duration-300 ease-out scale-100"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40 transition-opacity duration-300 ease-out opacity-100"
          style={{
            transition: "opacity 0.3s ease-out",
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-4 transform transition-transform duration-300 ease-out scale-100">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 animate-fadeIn">
              Login
            </h2>
            <form onSubmit={handleLogin}>
              <div className="mb-5 animate-fadeInUp">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <select
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                >
                  <option value="">Select User</option>
                  {userOptions.map((user) => (
                    <option key={user.username} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5 animate-fadeInUp delay-75">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded w-full transform transition-transform duration-300 ease-out hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <HashLoader size={18} color={"#FFFFFF"} className="p-0 m-0" />
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </Modal>

        {/* Search Modal */}
        <Modal
          isOpen={showSearchModal}
          onRequestClose={() => {}} // Disable closing by clicking outside
          shouldCloseOnOverlayClick={false}
          contentLabel="Search Existing Records"
          className="fixed inset-0 flex items-center justify-center z-50 bg-transparent"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Search Existing Records
            </h2>
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Enter Mobile Number"
                value={searchMobileNo}
                onChange={(e) => setSearchMobileNo(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Mobile Number"
              />
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-r"
                aria-label="Search"
                disabled={isSearching}
              >
                {isSearching ? (
                  <HashLoader size={18} color="#FFFFFF" />
                ) : (
                  <BsSearch />
                )}
              </button>
            </div>
            {searchResults.length > 0 && (
              <table className="min-w-full border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((user, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">{user.name}</td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleAddUser(user)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {searchResults.length === 0 && !isSearching && (
              <p className="text-center text-gray-600 mt-4">
                No records found. You can proceed to fill the form.
              </p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleProceedWithoutSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Proceed Without Search
              </button>
            </div>
          </div>
        </Modal>

        {/* Report Data Modal */}
        <Modal
          isOpen={showReportDataModal}
          onRequestClose={closeReportDataModal}
          contentLabel="Report Data Modal"
          className="fixed inset-0 flex items-center justify-center z-50 transform transition-transform duration-300 ease-out scale-100"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40 transition-opacity duration-300 ease-out opacity-100"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-4 w-full max-w-7xl mx-4 transform transition-transform duration-300 ease-out scale-100 no-scrollbar"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <div className="flex justify-end">
              <AiOutlineClose
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                size={24}
                onClick={closeReportDataModal} // This function will close the modal
              />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Report Results
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-4">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Receipt ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Mobile No</th>
                    <th className="px-4 py-2">ID Type</th>
                    <th className="px-4 py-2">ID No</th>
                    <th className="px-4 py-2">Purpose</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Date/Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? (
                    reportData.map((row, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{row.receiptId}</td>
                        <td className="border px-4 py-2">{row.name}</td>
                        <td className="border px-4 py-2">{row.mobileNo}</td>
                        <td className="border px-4 py-2">{row.idType}</td>
                        <td className="border px-4 py-2">{row.idNo}</td>
                        <td className="border px-4 py-2">
                          {row.purposeOfDonation}
                        </td>
                        <td className="border px-4 py-2">
                          {row.donationMethod}
                        </td>
                        <td className="border px-4 py-2">{row.amount}</td>
                        <td className="border px-4 py-2">
                          {(() => {
                            const date = new Date(row.submissionDateTime);
                            date.setHours(date.getHours() + 5); // Add 5 hours
                            date.setMinutes(date.getMinutes() + 30); // Add 30 minutes
                            return date
                              .toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              })
                              .replace(",", ""); // Removes the comma between date and time
                          })()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center p-4">
                        No data found for the selected date/time range.
                      </td>
                    </tr>
                  )}
                  {/* Sub Total Row */}
                  {reportData.length > 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-right font-bold px-4 py-2"
                      >
                        Sub Total
                      </td>
                      <td className="font-bold px-4 py-2">
                        {subTotal.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={downloadCSV}
              >
                Download Report
              </button>
            </div>
          </div>
        </Modal>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 opacity-80 shadow-lg py-6 mt-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Developed By Section */}
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-xl font-semibold">Developed By</h3>
                <p>Tirthajyoti Nag</p>
                <p className="text-sm">Phone : 74395 25958</p>
                <p className="text-sm">
                  E-mail : tirthajyotinag.2001@gmail.com
                </p>
                <p>Debanjan Pan</p>
                <p className="text-sm">Phone : 96418 66597</p>
                <p className="text-sm">E-mail : debanjanpan2@gmail.com</p>
              </div>

              {/* Organization Contact Details */}
              <div className="text-center md:text-right">
                <h3 className="text-xl font-semibold">Contact Us</h3>
                <p>Ramakrishna Mission Ashrama</p>
                <p className="text-xs">
                  &#40;A Branch Centre of Ramakrishna Mission,
                </p>
                <p className="text-xs">
                  PO-Belur Math, Dist-Howrah, West Bengal, 711202&#41;
                </p>
                <p className="text-sm">Ramakrishna Mission Road, Ulubari,</p>
                <p className="text-sm">Guwahati, Assam 781007, India</p>
                <p className="text-sm">Phone : 95314 34681, 95314 34682</p>
                <p className="text-sm">E-mail : guwahati@rkmm.org</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Form;
