import React, { useState } from 'react';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setFormData(initialState); // Reset form after successful submission
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
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 opacity-80 shadow-lg rounded-lg max-w-3xl">
      <div className="flex flex-col items-center py-6">
        <img src={logo} alt="RKMG Logo" className="w-24 h-24 mb-4"/>
        <h1 className="text-3xl font-semibold mb-6">RKMG Billing Form</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 px-8">
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
            Submit
          </button>
          <button type="button" onClick={handleClear} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Clear All
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Form;
