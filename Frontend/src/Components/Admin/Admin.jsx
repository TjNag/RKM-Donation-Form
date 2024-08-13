import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';
import { FaTrash, FaPrint } from 'react-icons/fa';

const Admin = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchColumn, setSearchColumn] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRecords, setSelectedRecords] = useState([]);

    const columns = [
        { label: 'Name', value: 'name' },
        { label: 'Address', value: 'address' },
        { label: 'District', value: 'district' },
        { label: 'City', value: 'city' },
        { label: 'State', value: 'state' },
        { label: 'Pin Code', value: 'pinCode' },
        { label: 'Mobile Number', value: 'mobileNo' },
        { label: 'Alt Mobile Number', value: 'altMobileNo' },
        { label: 'Email', value: 'email' },
        { label: 'ID Type', value: 'idType' },
        { label: 'ID Number', value: 'idNo' },
        { label: 'Purpose of Donation', value: 'purposeOfDonation' },
        { label: 'Amount', value: 'amount' },
    ];

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get('http://localhost:8081/api/records', {
                params: {
                    column: searchColumn,
                    value: searchTerm,
                },
            });
            setRecords(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch records:', error);
            toast.error('Failed to fetch records');
            setIsLoading(false);
        }
    };

    const downloadExcel = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/download-records', {
                params: {
                    column: searchColumn,
                    value: searchTerm,
                },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'records.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download Excel file:', error);
            toast.error('Failed to download Excel file');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`http://localhost:8081/api/delete-record/${id}`);
                setRecords(records.filter(record => record.id !== id));
                toast.success('Record deleted successfully');
            } catch (error) {
                console.error('Failed to delete record:', error);
                toast.error('Failed to delete record');
            }
        }
    };

    const handlePrint = (record) => {
        const printContents = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <div style="text-align: center;">
                    <img src="${window.location.origin}/path-to-your-logo.png" alt="Logo" style="width: 100px;"/>
                    <h2>Ramakrishna Mission Guwahati</h2>
                    <p>Bishnu Rabha Nagar, Ulubari, Guwahati, Assam 781007</p>
                    <h3>${record.purposeOfDonation} Donation Receipt</h3>
                </div>
                <hr style="margin: 20px 0;">
                <div style="margin-bottom: 20px;">
                    <p><strong>Receipt #:</strong> ___________________</p>
                    <p><strong>Date:</strong> ${new Date(record.submissionDateTime).toLocaleDateString()}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <p><strong>Amount:</strong> Rs. ${record.amount}</p>
                    <p><strong>Donation Type:</strong> ${record.purposeOfDonation}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <p><strong>Donor Name:</strong> ${record.name}</p>
                    <p><strong>Contact:</strong> ${record.mobileNo}</p>
                    <p><strong>ID Type:</strong> ${record.idType}</p>
                    <p><strong>ID No:</strong> ${record.idNo}</p>
                </div>
                <div style="text-align: right; margin-top: 50px;">
                    <p>______________________________</p>
                    <p>Authorized Signature</p>
                    <p>Place Stamp Here</p>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <p><strong>ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्</strong></p>
                </div>
            </div>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Receipt</title>
                </head>
                <body>
                    ${printContents}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    const handleSelectRecord = (id) => {
        setSelectedRecords(prev => {
            if (prev.includes(id)) {
                return prev.filter(recordId => recordId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedRecords.length === 0) {
            toast.warn('No records selected');
            return;
        }
        if (window.confirm('Are you sure you want to delete selected records?')) {
            try {
                await axios.delete('http://localhost:8081/api/delete-records', {
                    data: { ids: selectedRecords }
                });
                setRecords(records.filter(record => !selectedRecords.includes(record.id)));
                setSelectedRecords([]);
                toast.success('Selected records deleted successfully');
            } catch (error) {
                console.error('Failed to delete selected records:', error);
                toast.error('Failed to delete selected records');
            }
        }
    };

    const handleLoadData = () => {
        fetchRecords();
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchRecords();
        }
    }, [isLoggedIn, searchColumn, searchTerm]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            setIsLoggedIn(true);
        } else {
            toast.error('Invalid credentials');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                    <h2 className="text-2xl font-semibold text-center mb-6">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block font-medium mb-2">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block font-medium mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-150"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (isLoading) return <div className="text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-xl font-semibold text-center my-4">Admin Dashboard - Records Management</h1>

            {/* Search Input */}
            <div className="mb-4 flex items-center justify-between">
                <select 
                    value={searchColumn}
                    onChange={e => setSearchColumn(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                >
                    {columns.map(col => (
                        <option key={col.value} value={col.value}>{col.label}</option>
                    ))}
                </select>
                <input 
                    type="text" 
                    placeholder={`Search by ${searchColumn.replace(/([A-Z])/g, ' $1')}`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="ml-4 px-4 py-2 border border-gray-300 rounded-md w-full"
                />
                <button 
                    onClick={downloadExcel}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                    Download Excel
                </button>
                <button 
                    onClick={handleLoadData}
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded-md"
                >
                    Load Data
                </button>
            </div>

            <div className="mb-4">
                <button 
                    onClick={handleDeleteSelected}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                    Delete Selected
                </button>
            </div>

            {records.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-300">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="px-6 py-3">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRecords(records.map(record => record.id));
                                            } else {
                                                setSelectedRecords([]);
                                            }
                                        }}
                                        checked={selectedRecords.length === records.length}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mobile Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Purpose of Donation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Submission Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {records.map((record, index) => (
                                <tr key={index} className="bg-gray-100">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectRecord(record.id)}
                                            checked={selectedRecords.includes(record.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">{record.name}</td>
                                    <td className="px-6 py-4">{record.mobileNo}</td>
                                    <td className="px-6 py-4">{record.idType}</td>
                                    <td className="px-6 py-4">{record.idNo}</td>
                                    <td className="px-6 py-4">{record.purposeOfDonation}</td>
                                    <td className="px-6 py-4">{record.amount}</td>
                                    <td className="px-6 py-4">{new Date(record.submissionDateTime).toLocaleString()}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => handleDelete(record.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded flex items-center justify-center"
                                        >
                                            <FaTrash />
                                        </button>
                                        <button
                                            onClick={() => handlePrint(record)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded flex items-center justify-center"
                                        >
                                            <FaPrint />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-xl">No records found.</div>
            )}
        </div>
    );
};

export default Admin;
