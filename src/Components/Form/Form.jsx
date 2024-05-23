import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/logo.png';

const Form = () => {
  const initialState = {
    name: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    toast('Submission Successful!');
    setFormData(initialState);
  };

  const handleClear = () => {
    setFormData(initialState);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center">
        <img src={logo} alt="RKMG Logo" className="w-24 h-24 mb-4"/>
        <h1 className="text-2xl font-bold mb-4">RKMG Offline Donation Form</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(formData).map(([key, value]) => (
          <input
            type={key.includes('Email') ? 'email' : 'text'}
            name={key}
            value={value}
            onChange={handleChange}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
            className="w-full p-2 border border-gray-300 rounded"
          />
        ))}
        <select name="idType" value={formData.idType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select ID Type</option>
          <option value="aadharcard">Aadhar Card</option>
          <option value="pancard">PAN Card</option>
          <option value="drivinglicence">Driving Licence</option>
          <option value="votercard">Voter Card</option>
          <option value="rationcard">Ration Card</option>
        </select>
        <div className="flex justify-between space-x-4">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Submit
          </button>
          <button type="button" onClick={handleClear} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Clear All
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Form;
