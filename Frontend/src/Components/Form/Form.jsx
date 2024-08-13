import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/logo.png';

const Form = () => {
  const initialState = {
    name: '',
    address: '',
    district: '',
    city: '',
    state: '',
    pinCode: '',
    mobileNo: '',
    altMobileNo: '',
    email: '',
    idType: '',
    idNo: '',
    purposeOfDonation: '',
    amount: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [showPreview, setShowPreview] = useState(false);
  const billRef = useRef(null); // Ref for the bill section

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleGenerateBill = (e) => {
    e.preventDefault();
    setShowPreview(true); // Show preview without saving to database
  };

  const handleConfirmSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/submit-form', { // Ensure the URL and port are correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Submission Successful!');
        setShowPreview(false); // Hide the preview after successful submission
        setTimeout(() => window.location.reload(), 1000); // Refresh the page after 1 second
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit form');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred!');
    }
  };

  const handleClear = () => {
    setFormData(initialState);
    setShowPreview(false);
  };

  const handlePrint = () => {
    const printContents = billRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bill</title>
        </head>
        <body onload="window.print();window.close();">
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 opacity-80 shadow-lg rounded-lg max-w-3xl">
      <div className="flex flex-col items-center py-6">
        <img src={logo} alt="RKMG Logo" className="w-24 h-24 mb-4"/>
        <h1 className="text-3xl font-semibold mb-6">RKMG Billing Form</h1>
      </div>
      <form onSubmit={handleGenerateBill} className="space-y-6 px-8">
        {[
          { label: 'Name', id: 'name', type: 'text', required: true },
          { label: 'Address', id: 'address', type: 'text', required: true },
          { label: 'District', id: 'district', type: 'text', required: true },
          { label: 'City', id: 'city', type: 'text', required: true },
          { label: 'State', id: 'state', type: 'text', required: true },
          { label: 'Pin Code', id: 'pinCode', type: 'text', required: true },
          { label: 'Mobile No', id: 'mobileNo', type: 'text', required: true },
          { label: 'Alternate Mobile No', id: 'altMobileNo', type: 'text' },
          { label: 'Email', id: 'email', type: 'email' },
          { label: 'ID Type', id: 'idType', type: 'select', required: true, options: ['Aadhar Card', 'PAN Card', 'Driving Licence', 'Voter Card', 'Ration Card'] },
          { label: 'ID Number', id: 'idNo', type: 'text', required: true },
          { label: 'Purpose of Donation', id: 'purposeOfDonation', type: 'text', required: true },
          { label: 'Amount', id: 'amount', type: 'number', required: true },
        ].map(field => field.type !== 'select' ? (
          <div key={field.id} className="flex flex-col">
            <label htmlFor={field.id} className="mb-2 font-medium">{field.label}{field.required && <span className="text-red-400">*</span>}</label>
            <input type={field.type} id={field.id} name={field.id} value={formData[field.id]} onChange={handleChange} placeholder={`Enter ${field.label}`} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700" required={field.required} />
          </div>
        ) : (
          <div key={field.id} className="flex flex-col">
            <label htmlFor={field.id} className="mb-2 font-medium">{field.label}<span className="text-red-400">*</span></label>
            <select id={field.id} name={field.id} value={formData[field.id]} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700" required={field.required}>
              <option value="">Select</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex justify-between mt-6">
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
            Generate Bill
          </button>
          <button type="button" onClick={handleClear} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Clear All
          </button>
        </div>
      </form>
      <ToastContainer />

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg text-center">
            <div ref={billRef} className="space-y-4">
              <div className="text-center">
                <img src={logo} alt="RKMG Logo" className="w-24 h-24 mx-auto"/>
                <h2 className="text-2xl font-bold">Ramakrishna Mission Guwahati</h2>
                <p>Bishnu Rabha Nagar, Ulubari, Guwahati, Assam 781007</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Time: {new Date().toLocaleTimeString()}</p>
              </div>
              <p className="text-lg text-center font-semibold">
                Mr./Ms./Mrs. <span className="font-bold">{formData.name}</span> donated Rs. <span className="font-bold">{formData.amount}</span> for <span className="font-bold">{formData.purposeOfDonation}</span>.
              </p>
              <p className="text-center">
                We are taking his/her donation as a blessing and we ensure that we will use that contribution as said. GOD BLESSED <span className="font-bold">{formData.name}</span> and his/her family.
              </p>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="font-medium">ID Type:</span>
                  <span>{formData.idType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">ID No:</span>
                  <span>{formData.idNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>
                  <span>{formData.mobileNo}</span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <div className="text-center">
                  <p className="text-gray-500">______________________________</p>
                  <p className="font-medium">Authorized Signature</p>
                  <p className="text-gray-500">Place Stamp Here</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="font-bold">ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्</p>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Print Bill
              </button>
              <button onClick={handleConfirmSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Confirm Submission
              </button>
              <button onClick={() => setShowPreview(false)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
