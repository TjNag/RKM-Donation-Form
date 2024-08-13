import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'tailwindcss/tailwind.css';

const Admin = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchColumn, setSearchColumn] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        fetchRecords();
    }, [searchColumn, searchTerm]);

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
            </div>

            {records.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-300">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mobile Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Purpose of Donation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Submission Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {records.map((record, index) => (
                                <tr key={index} className="bg-gray-100">
                                    <td className="px-6 py-4">{record.name}</td>
                                    <td className="px-6 py-4">{record.mobileNo}</td>
                                    <td className="px-6 py-4">{record.idType}</td>
                                    <td className="px-6 py-4">{record.idNo}</td>
                                    <td className="px-6 py-4">{record.purposeOfDonation}</td>
                                    <td className="px-6 py-4">{record.amount}</td>
                                    <td className="px-6 py-4">{new Date(record.submissionDateTime).toLocaleString()}</td>
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
