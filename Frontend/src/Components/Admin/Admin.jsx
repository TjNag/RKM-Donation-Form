import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaTrash, FaSync } from "react-icons/fa";
import { VscVerified } from "react-icons/vsc";
import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";
import logo from "../../assets/logo.png";
import Modal from "react-modal";
import { debounce } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Admin = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchColumn, setSearchColumn] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date('September 7, 2001'));
  const [endDate, setEndDate] = useState(new Date());
  const [showUnaccepted, setShowUnaccepted] = useState(false);
  const [modalData, setModalData] = useState({
    newUsername: "",
    newPassword: "",
    userType: "user",
    isUpdate: false,
    updateUser: "",
  });
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    { label: "Cashier", value: "submittedby_user" },
    { label: "Receipt ID", value: "receiptId" },
    { label: "Name", value: "name" },
    { label: "Mobile No.", value: "mobileNo" },
    { label: "ID Type", value: "idType" },
    { label: "ID Number", value: "idNo" },
    { label: "Purpose of Donation", value: "purposeOfDonation" },
    { label: "Donation Method", value: "donationMethod" },
    { label: "Amount", value: "amount" },
    { label: "Date/Time", value: "submissionDateTime" },
  ];

  const columnsReport = [
    { label: "Cashier", value: "submittedby_user" },
    { label: "Receipt ID", value: "receiptId" },
    { label: "Name", value: "name" },
    { label: "Address", value: "address" },
    { label: "District", value: "district" },
    { label: "City", value: "city" },
    { label: "State", value: "state" },
    { label: "Pin Code", value: "pinCode" },
    { label: "Mobile No.", value: "mobileNo" },
    { label: "Alternate Mobile No.", value: "altMobileNo" },
    { label: "Email", value: "email" },
    { label: "ID Type", value: "idType" },
    { label: "ID Number", value: "idNo" },
    { label: "Purpose of Donation", value: "purposeOfDonation" },
    { label: "Donation Method", value: "donationMethod" },
    { label: "Amount", value: "amount" },
    { label: "Cheque No", value: "chequeNo" },
    { label: "Dated", value: "dated" },
    { label: "On Bank", value: "onBank" },
    { label: "Date/Time", value: "submissionDateTime" },
  ];

  const url = "http://localhost:8081"

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data } = await axios.get(
          url + "/api/check-login"
        );
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        toast.error("Failed to check login status");
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      debouncedFetchRecords();
    }
    return () => {
      debouncedFetchRecords.cancel();
    };
  }, [
    isLoggedIn,
    searchColumn,
    searchTerm,
    startDate,
    endDate,
    showUnaccepted,
  ]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(url + `/api/records`, {
        params: {
          column: searchColumn,
          value: searchTerm,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          showUnaccepted: showUnaccepted ? 1 : 0,
        },
      });
      setRecords(data);
    } catch (error) {
      toast.error("Failed to fetch records");
    }
    setIsLoading(false);
  };

  const debouncedFetchRecords = useCallback(debounce(fetchRecords, 300), [
    searchColumn,
    searchTerm,
    startDate,
    endDate,
    showUnaccepted,
  ]);

  const debouncedFetchUnacceptedRecords = useCallback(
    debounce(() => {
      setShowUnaccepted(true);
      fetchRecords();
    }, 300),
    [searchColumn, searchTerm, startDate, endDate]
  );

  const handleAcceptRecord = async (id) => {
    try {
      const response = await axios.post(
        url + `/api/update-acceptance`,
        { id }
      );
      if (response.data.success) {
        toast.success("Record accepted successfully");
        // Update the local state to reflect the change
        setRecords(
          records.map((record) =>
            record.id === id ? { ...record, isAccepted: 1 } : record
          )
        );
      } else {
        toast.error("Failed to accept the record");
      }
    } catch (error) {
      toast.error("An error occurred while accepting the record");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(url + `/api/delete-record/${id}`);
        setRecords(records.filter((record) => record.id !== id));
        toast.success("Record deleted successfully");
      } catch (error) {
        toast.error("Failed to delete record");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete the selected records?")
    ) {
      try {
        await axios.delete(url + `/api/delete-records`, {
          data: { ids: selectedRows },
        });
        setRecords(
          records.filter((record) => !selectedRows.includes(record.id))
        );
        setSelectedRows([]);
        toast.success("Records deleted successfully");
      } catch (error) {
        toast.error("Failed to delete records");
      }
    }
  };

  const handleBulkAccept = async () => {
    try {
      await Promise.all(
        selectedRows.map(async (id) => {
          const response = await axios.post(
            url + `/api/update-acceptance`,
            { id }
          );
          if (!response.data.success) {
            throw new Error("Failed to accept record");
          }
        })
      );
      setRecords(
        records.map((record) =>
          selectedRows.includes(record.id)
            ? { ...record, isAccepted: 1 }
            : record
        )
      );
      setSelectedRows([]);
      toast.success("Records accepted successfully");
    } catch (error) {
      toast.error("Failed to accept records");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        url + `/api/adminlogin`,
        { username, password }
      );
      if (response.data.success) {
        setIsLoggedIn(true);
        toast.success("Logged in successfully");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed, please try again");
    }
  };

  const handleDownloadCsv = () => {
    const csvRows = [];
    const headers = columnsReport.map((col) => col.label).join(",");
    csvRows.push(headers);

    records.forEach((record) => {
      const values = columnsReport
        .map((col) => `"${record[col.value]}"`)
        .join(",");
      csvRows.push(values);
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "records.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openModal = () => {
    setModalData({
      newUsername: "",
      newPassword: "",
      userType: "user",
      isUpdate: false,
      updateUser: "",
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const { newUsername, newPassword, userType, isUpdate, updateUser } =
      modalData;
    try {
      if (isUpdate) {
        await axios.post(url + `/api/update-user`, {
          username: updateUser,
          newUsername,
          newPassword,
          userType,
        });
        toast.success("User updated successfully");
      } else {
        await axios.post(url + `/api/add-user`, {
          username: newUsername,
          password: newPassword,
          userType,
        });
        toast.success("User added successfully");
      }
      setIsModalOpen(false);
      debouncedFetchRecords();
    } catch (error) {
      toast.error("Failed to save user data");
    }
  };

  const openUpdateModal = (user) => {
    setModalData({
      newUsername: user.username,
      newPassword: "",
      userType: user.userType,
      isUpdate: true,
      updateUser: user.username,
    });
    setIsModalOpen(true);
  };

  const handleRadioChange = (e) => {
    const value = e.target.value;
    if (value === "unaccepted") {
      debouncedFetchUnacceptedRecords();
    } else {
      setShowUnaccepted(false);
      debouncedFetchRecords();
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(url + `/api/get-users`);
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    if (isViewUserModalOpen) {
      fetchUsers();
    }
  }, [isViewUserModalOpen]);

  const handleDeleteUser = async (username) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(
          url + `/api/delete-user/${username}`
        );
        if (response.data.success) {
          setUsers(users.filter((user) => user.username !== username));
          toast.success("User deleted successfully");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Admin Login
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mb-4 p-2 w-full border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mb-4 p-2 w-full border rounded"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-center items-center">
          <img src={logo} alt="Logo" className="w-24 h-24" />
        </div>
        <div className="flex justify-center items-center">
          {isLoggedIn ? (
            <p className="text-green-500">User is logged in</p>
          ) : (
            <p className="text-red-500">User is not logged in</p>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-center mb-4">
        Admin Dashboard
      </h1>
      <div className="flex items-center justify-center space-x-2">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          className="border p-2 rounded"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="border p-2 rounded w-full"
          onKeyPress={(e) => e.key === "Enter" && debouncedFetchRecords()}
        />
        <select
          value={searchColumn}
          onChange={(e) => setSearchColumn(e.target.value)}
          className="border p-2 rounded"
        >
          {columns.map((column) => (
            <option key={column.value} value={column.value}>
              {column.label}
            </option>
          ))}
        </select>
        <button
          onClick={debouncedFetchRecords}
          className="bg-teal-500 hover:bg-teal-700 text-white p-2 rounded"
        >
          <FaSync />
        </button>
        <button
          onClick={handleDownloadCsv}
          className="bg-green-500 hover:bg-green-700 text-white p-2 rounded"
        >
          Report
        </button>
      </div>
      <br />
      <div className="mb-4 flex items-center space-x-10">
        <button
          onClick={() => setIsViewUserModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded"
        >
          View Users
        </button>
        <button
          onClick={handleBulkDelete}
          disabled={selectedRows.length === 0}
          className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
        >
          Delete Selected
        </button>
        <button
          onClick={handleBulkAccept}
          disabled={selectedRows.length === 0}
          className="bg-green-500 hover:bg-green-700 text-white p-2 rounded"
        >
          Accept Selected
        </button>
        <div className="mt-2 flex items-center">
          <label className="mr-4">
            <input
              type="radio"
              name="filter"
              value="all"
              defaultChecked
              onChange={handleRadioChange}
            />
            Show all
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              value="unaccepted"
              onChange={handleRadioChange}
            />
            Show only unaccepted
          </label>
        </div>
      </div>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <table className="min-w-full table-auto text-center">
          <thead className="bg-gradient-to-r from-teal-500 to-green-500 text-white">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedRows.length === records.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(records.map((record) => record.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </th>
              {columns.map((column) => (
                <th key={column.value} className="px-4 py-2">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="bg-white border-b hover:bg-gray-100"
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(record.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows([...selectedRows, record.id]);
                      } else {
                        setSelectedRows(
                          selectedRows.filter((id) => id !== record.id)
                        );
                      }
                    }}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.value} className="px-4 py-2">
                    {column.value === "submissionDateTime"
                      ? (() => {
                          const date = new Date(record[column.value]);
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
                        })() // Removes the comma between date and time
                      : record[column.value]}
                  </td>
                ))}
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="bg-red-500 hover:bg-red-700 text-white p-1 rounded"
                  >
                    <FaTrash />
                  </button>
                  {record.isAccepted === 0 && (
                    <button
                      onClick={() => handleAcceptRecord(record.id)}
                      className="bg-green-500 hover:bg-green-700 text-white p-1 rounded"
                    >
                      <VscVerified />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={isViewUserModalOpen}
        onRequestClose={() => setIsViewUserModalOpen(false)}
        contentLabel="View Users"
        ariaHideApp={false}
        className="modal bg-white rounded-lg p-6 max-w-lg mx-auto mt-24 shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Admin Users</h2>
        <button
          onClick={openModal}
          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded"
        >
          Add User
        </button>
        <table className="min-w-full table-auto text-center mt-4">
          <thead className="bg-gradient-to-r from-teal-500 to-green-500 text-white">
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.username}
                className="bg-white border-b hover:bg-gray-100"
              >
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => handleDeleteUser(user.username)}
                    className="bg-red-500 hover:bg-red-700 text-white p-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => setIsViewUserModalOpen(false)}
          className="mt-4 bg-gray-500 hover:bg-gray-700 text-white p-2 rounded"
        >
          Close
        </button>
      </Modal>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Add/Update User"
        ariaHideApp={false}
        className="modal bg-white rounded-lg p-6 max-w-lg mx-auto mt-24 shadow-lg z-50"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          {modalData.isUpdate ? "Update User" : "Add New User"}
        </h2>
        <form onSubmit={handleModalSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Username</label>
            <input
              type="text"
              value={modalData.newUsername}
              onChange={(e) =>
                setModalData({ ...modalData, newUsername: e.target.value })
              }
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={modalData.newPassword}
              onChange={(e) =>
                setModalData({ ...modalData, newPassword: e.target.value })
              }
              required
              className="w-full p-2 border rounded"
            />
          </div>
          {/* <div className="mb-4">
                        <label className="block mb-2">User Type</label>
                        <select
                            value={modalData.userType}
                            onChange={(e) => setModalData({ ...modalData, userType: e.target.value })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div> */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              {modalData.isUpdate ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Admin;
