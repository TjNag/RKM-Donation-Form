import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaTrash, FaPrint, FaSync } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';
import logo from '../../assets/logo.png'; // Make sure the path is correct according to your project structure

const Admin = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchColumn, setSearchColumn] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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

    useEffect(() => {
        if (isLoggedIn) {
            fetchRecords();
        }
    }, [isLoggedIn, searchColumn, searchTerm]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:8081/api/records`, {
                params: {
                    column: searchColumn,
                    value: searchTerm,
                },
            });
            setRecords(data);
        } catch (error) {
            toast.error('Failed to fetch records');
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`http://localhost:8081/api/delete-record/${id}`);
                setRecords(records.filter(record => record.id !== id));
                toast.success('Record deleted successfully');
            } catch (error) {
                toast.error('Failed to delete record');
            }
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:8081/api/login`, { username, password });
            if (response.data.success) {
                setIsLoggedIn(true);
                toast.success('Logged in successfully');
            } else {
                toast.error('Invalid credentials');
            }
        } catch (error) {
            toast.error('Login failed, please try again');
        }
    };

    const handleDownloadCsv = () => {
        const csvRows = [];
        const headers = columns.map(col => col.label).join(',');
        csvRows.push(headers);

        records.forEach(record => {
            const values = columns.map(col => `"${record[col.value]}"`).join(',');
            csvRows.push(values);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        saveAs(blob, 'records.csv');
    };

    if (!isLoggedIn) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                    <h2 className="text-2xl font-semibold text-center mb-6">Admin Login</h2>
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
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-center items-center mb-4">
                <img src={logo} alt="Logo" className="w-24 h-24" />
            </div>
            <h1 className="text-2xl font-semibold text-center mb-4">Admin Dashboard</h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="border p-2 rounded w-full"
                    onKeyPress={(e) => e.key === 'Enter' && fetchRecords()}
                />
                <select
                    value={searchColumn}
                    onChange={(e) => setSearchColumn(e.target.value)}
                    className="border p-2 rounded"
                >
                    {columns.map(column => (
                        <option key={column.value} value={column.value}>{column.label}</option>
                    ))}
                </select>
                <button onClick={fetchRecords} className="bg-teal-500 hover:bg-teal-700 text-white p-2 rounded">
                    <FaSync />
                </button>
                <button onClick={handleDownloadCsv} className="bg-green-500 hover:bg-green-700 text-white p-2 rounded">
                    Download
                </button>
            </div>
            {isLoading ? (
                <p className="text-center">Loading...</p>
            ) : (
                <table className="min-w-full table-auto text-center">
                    <thead className="bg-gradient-to-r from-teal-500 to-green-500 text-white">
                        <tr>
                            {columns.map(column => (
                                <th key={column.value} className="px-4 py-2">{column.label}</th>
                            ))}
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            <tr key={record.id} className="bg-white border-b hover:bg-gray-100">
                                {columns.map(column => (
                                    <td key={column.value} className="px-4 py-2">{record[column.value]}</td>
                                ))}
                                <td className="px-4 py-2 flex justify-center space-x-2">
                                    <button onClick={() => console.log('Print functionality not implemented')} className="bg-green-500 hover:bg-green-700 text-white p-1 rounded">
                                        <FaPrint />
                                    </button>
                                    <button onClick={() => handleDelete(record.id)} className="bg-red-500 hover:bg-red-700 text-white p-1 rounded">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <ToastContainer />
        </div>
    );
};

export default Admin;
