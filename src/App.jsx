import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './pages/App/Layout';
import Author from './pages/Home/Author';
import Index from './pages/Home/Index';
import Search from './pages/Home/Search'
import Login from './pages/Login/Login';
import Recover from './pages/Login/Recover';
import SignUp from './pages/Login/SignUp';
import Document from './pages/Home/Document';
import { Worker } from '@react-pdf-viewer/core';
import { useEffect, useState } from 'react';
import PdfToPngConverter from './pages/App/Upload/convertPdfToPng';
import PasswordRecoveryPage from './pages/Login/PasswordReset';
import CategoryDashboard from './pages/Admin/Dashboard/adminDashboard';
import LoginAdmin from './pages/Admin/Dashboard/LoginAdmin';
function App() {
  const [validate, setValidate] = useState(localStorage.getItem("sam12mdqow") || '');
  const [validate2, setValidate2] = useState(localStorage.getItem("sam12mdqow2") || '');

  useEffect(() => {
    setValidate(localStorage.getItem("sam12mdqow"));
    setValidate2(localStorage.getItem("sam12mdqow2"));
  }, []);

  return (
    <Router>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <div>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login setValidate={setValidate} />} />
            <Route path="/recover" element={<Recover />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/prueba" element={<PdfToPngConverter pdfUrl={'https://ucarecdn.com/ab9e6513-eaeb-4d08-ba2a-6e41f139a2e5/2_iis_2023_250264.pdf'} apiKey={'rayogamestudio@gmail.com_9gnZ3a7ghOv0GRNMppgiCAHuWh7r3lOB4mHCnXD5UNvkq7VLEVXZ1q488YBVP6MX'} />} />
            <Route path='/passwordReset' element={<PasswordRecoveryPage />} />
            {/* Redirige a login si validate está vacío */}
            <Route path="/dashboard/*" element={validate ? <Layout setValidate={setValidate} /> : <Navigate to="/login" replace />} />
            <Route path="/search" element={<Search />} />
            <Route path="admin/dashboard/login" element={<LoginAdmin setValidate2={setValidate2} />} />
            <Route path="admin/dashboard/categories" element={<CategoryDashboard setValidate2={setValidate2} />} />
            <Route path="/author/:nickName/:nombreCompleto" element={<Author />} />
            <Route path="/document/:id" element={<Document />} />

          </Routes>
        </div>
      </Worker>
    </Router>
  );
}

export default App;
