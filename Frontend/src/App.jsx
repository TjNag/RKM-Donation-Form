import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Form from './components/Form/Form';
import Admin from './components/Admin/Admin';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/Admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
