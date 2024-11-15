import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoHome, GoFile, GoPerson, GoSignOut, } from "react-icons/go";
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

import { LuUpload, LuFile, LuTrash } from "react-icons/lu";
import { Toaster, toast } from 'sonner'

import UploadDocument from "./Upload/UploadDocument";
import MyDocuments from "./Documents/MyDocuments";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Profile/Profile";
import { decryptUserData } from "../../encryption";
function Layout({ setValidate }) {
    const [file, setFile] = useState(null);
    const [upload, setUpload] = useState(false);
    return (
        <div className="flex">
            <Sidebar setValidate={setValidate} />
            <div className="flex-1">
                <Navbar file={file} setFile={setFile} setUpload={setUpload} />
                <div className='bg-[#F8F9FB] h-full'>
                    {upload ? (
                        <UploadDocument file={file} setFile={setFile} />
                    ) : (
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/documents" element={<MyDocuments />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    )}
                </div>
            </div>
        </div>
    );
}
function Sidebar({ setValidate }) {
    const WEB_URL = import.meta.env.VITE_WEB_URL;

    return (
        <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex mt-5 items-center pl-6 pt-5">
                <a href={`${WEB_URL}/dashboard`}> <img src={logo} alt="DocTIC" className="w-32 h-auto" /></a>
            </div>

            {/* Navegación */}
            <nav className="flex-grow ml-2 mt-10">
                <ul className="flex flex-col h-full justify-between pl-4 mt-5">
                    <div>
                        <NavItem icon={<GoHome />} text="Home" to={`${WEB_URL}/dashboard`} exactMatch />
                        <NavItem icon={<GoFile />} text="Mis Documentos" to={`${WEB_URL}/dashboard/documents`} />
                        <NavItem icon={<GoPerson />} text="Perfil" to={`${WEB_URL}/dashboard/profile`} />
                    </div>
                    <div>
                        <li className="flex items-center py-3 transition-all duration-200 cursor-pointer text-[#8A8A8A] hover:text-[#4B3DE3] mb-10">
                            <div onClick={() => {
                                localStorage.removeItem("sam12mdqow");
                                setValidate(null);
                            }} className="flex items-center w-full">
                                <span className="mr-2 text-2xl"><GoSignOut /></span>
                                <span>Cerrar sesión</span>
                            </div>
                        </li>
                    </div>
                </ul>
            </nav>
        </div>
    );
}

function NavItem({ icon, text, to, exactMatch = false }) {
    const location = useLocation(); // Obtiene la ruta actual

    // Verifica si el item es activo
    const isActive = exactMatch
        ? location.pathname === new URL(to).pathname // Para coincidencia exacta, como para el Home
        : location.pathname.startsWith(new URL(to).pathname); // Para subrutas, como documentos o perfil

    return (
        <li className={`flex items-center py-3 transition-all duration-200 cursor-pointer ${isActive ? 'text-[#4B3DE3] font-semibold' : 'text-[#8A8A8A] hover:text-[#4B3DE3]'}`}>
            <a href={to} className="flex items-center w-full">
                <span className="mr-2 text-2xl">{icon}</span>
                <span>{text}</span>
            </a>
        </li>
    );
}
function Navbar({ file, setFile, setUpload }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const encryptedUserData = localStorage.getItem("sam12mdqow");
    const userData = decryptUserData(encryptedUserData);
    const [isUploading, setIsUploading] = useState(false);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];

        // Solo permite archivos PDF
        if (droppedFile && droppedFile.type === "application/pdf") {
            setFile(droppedFile);
        } else {
            toast.error('Solo puedes subir archivos PDF', {
                duration: 3000,
            });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        // Solo permite archivos PDF
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            toast.error('Solo puedes subir archivos PDF', {
                duration: 3000,
            });
        }
    };

    const triggerFileInput = () => {
        document.getElementById('fileInput').click();
    };



    return (
        <>
            <div className="flex items-center justify-end p-4 bg-white border-b border-gray-200">

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center text-[#4B3DE3] font-medium hover:underline transition duration-200 mr-10"
                >
                    <LuUpload className='mr-2 text-xl' />
                    Cargar Documento
                </button>

                <div className="flex items-center mr-5">
                    <div className="flex items-center">
                        <img

                            src={`https://ui-avatars.com/api/?name=${userData.nickName}&size=40&background=4891E0&color=fff `}
                            alt="Avatar"
                            className="w-10 h-10 mr-2 rounded-full border border-gray-300"
                        />
                        <div className='flex flex-col items-start'>
                            <span className="ml-2 text-black font-semibold">{userData.nombreCompleto}</span>
                            <span className="ml-2 text-gray-500 text-sm">@{userData.nickName}</span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-lg p-8 w-[500px] shadow-lg"
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Cargar Documento</h2>
                                <button
                                    className="text-gray-500 hover:text-black transition"
                                    onClick={closeModal}
                                >
                                    ✕
                                </button>
                            </div>

                            {!file && (
                                <div
                                    className={`border-2 ${dragging ? 'border-[#4B3DE3]' : 'border-gray-300'} border-dashed rounded-lg h-40 flex flex-col items-center justify-center text-gray-500 cursor-pointer `}
                                    style={{ zIndex: 10 }}
                                    onClick={triggerFileInput}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <LuUpload className={`text-3xl ${dragging ? 'text-[#4B3DE3]' : 'text-gray-500'}`} />
                                    <p className={`${dragging ? 'text-[#4B3DE3]' : 'text-gray-500'}`}>
                                        Cargar documento aquí o haz clic para seleccionar
                                    </p>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="application/pdf"
                                    />
                                </div>
                            )}
                            {file && (
                                <div className="mt-4 flex items-center w-full bg-[#F5F5F5] px-5 py-6 rounded-[15px] justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-[#E9E9E9] p-3 mr-3 rounded-md">
                                            <LuFile className="text-2xl text-[#717171]" />
                                        </div>
                                        <p className="text-[#717171]">{file.name}</p>
                                    </div>
                                    <LuTrash className="cursor-pointer text-[#717171] text-2xl mr-2" onClick={() => setFile(null)} />
                                </div>
                            )}


                            {file ? (
                                <button
                                    className={`mt-6 w-full font-semibold py-2 text-sm ${isUploading ? 'bg-gray-400' : 'bg-[#4B3DE3]'} text-white rounded-md hover:bg-[#483AD8] transition`}
                                    onClick={() => {
                                        setUpload(true)
                                        closeModal()
                                    }}
                                >
                                    Subir Documento
                                </button>
                            ) : (
                                <button
                                    onClick={closeModal}
                                    className="mt-6 w-full py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                >
                                    Cancelar
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


export default Layout;
