import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Form/Form';
import Admin from './Components/Admin/Admin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  // Assuming you want the login page at the root
        <Route path="/admin" element={<Admin />} />  // Admin panel accessible at '/admin'
      </Routes>
    </Router>
  );
}
