import React, { useState } from 'react';
import background from "../../assets/images/recover.png";
import logo from "../../assets/images/logo.png";
import { FaStar } from "react-icons/fa6";
import { FaEnvelope, FaCheckCircle, FaEye, FaLock, FaUser, FaUserCheck, FaQuestionCircle } from 'react-icons/fa';
import emailAnimation from "../../assets/email.json";
import Lottie from "lottie-react";
import axios from 'axios';
import Loading from '../App/Reusable/Loading';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
function Recover() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const handleContinue = () => {
        setStep(2);
    };

    return (
        <div className='flex h-full w-full items-center justify-center'>
            {step === 1 ? <FormRecover onContinue={handleContinue} email={email} setEmail={setEmail} /> : <EmailSent email={email} />}
            <Review />
        </div>
    );
}
function FormRecover({ onContinue, email, setEmail }) {

    const [isLoading, setIsLoading] = useState(false); // Estado para el indicador de carga
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Comienza el estado de carga

        try {
            const response = await axios.post(`${API_URL}/clientesAuth/recuperarContrasenaPasoUno`, { email });
            console.log('Respuesta del servidor:', response.data);

            const emailResponse = await axios.post(`${API_URL}/clientesAuth/enviarEmail`, { name: response.data.nombreCompleto, email });
            console.log('Respuesta de enviarEmail:', emailResponse.data);

            onContinue();
        } catch (error) {
            console.error('Error al enviar solicitud de recuperación:', error);
            toast.error("El correo electrónico ingresado no está asociado a ninguna cuenta")
        } finally {
            setIsLoading(false); // Termina el estado de carga
        }
    };

    return (
        <div className='bg-black h-screen w-full'>
            <Toaster position='top-center' richColors />
            <div className="flex justify-center items-center min-h-screen bg-[#FBFBFB]">
                <div className="max-w-sm w-full">
                    {/* Logo */}
                    <div className="flex mb-6">
                        <img src={logo} alt="DocTIC" className="w-32 h-auto bg-contain" />
                    </div>

                    {/* Título */}
                    <h2 className="text-3xl font-bold text-[#262626] mb-1">Recuperar Contraseña</h2>
                    <p className="text-[#000000] mb-5">
                        Restablece tu contraseña
                    </p>

                    {/* Formulario */}
                    <form className='mt-10' onSubmit={handleSubmit}>
                        <div className="mb-4 ">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="email">
                                Correo electrónico
                            </label>
                            <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                                <FaEnvelope className="text-gray-500" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className="flex-1 ml-3 h-10 outline-none text-gray-700"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Botón de continuar */}
                        <button

                            type="submit"
                            className={`w-full bg-[#4B3DE3] text-white py-4 rounded-lg text-base  font-semibold mt-8 ${!email ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-[#3D33AE] transition duration-300'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!email || isLoading}
                        >
                            {isLoading ? <Loading /> : 'Continuar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}


function EmailSent({ email }) {
    const navigate = useNavigate();
    return (
        <div className='bg-black h-screen w-full'>
            <div className="flex justify-center items-center min-h-screen bg-[#FBFBFB]">
                <div className="max-w-sm w-full">
                    {/* Logo */}
                    <div className="flex mb-6">
                        <img src={logo} alt="DocTIC" className="w-32 h-auto bg-contain" />
                    </div>

                    {/* Título */}
                    <h2 className="text-3xl font-bold text-[#262626] mb-1">Revisa tu email</h2>
                    <p className="text-[#000000] mb-5 mt-5 text-justify">Te hemos enviado un correo electrónico a <b>{email}</b> con el enlace para que puedas crear una nueva contraseña. Si no te ha llegado en unos minutos, revisa la carpeta de correos no deseados</p>
                    <div className='flex justify-center'>
                        <Lottie animationData={emailAnimation} className='w-48' loop={true} />;
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        type="submit"
                        className="w-full bg-[#4B3DE3] text-white py-4 rounded-lg text-base hover:bg-[#3D33AE] transition duration-300 font-semibold mt-8"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}

function Review() {
    return <div className='relative h-screen w-full bg-cover' style={{ backgroundImage: `url(${background})` }}>
        <div className='absolute bottom-10 left-20 '>
            <div className='relative p-4 border-4 border-[#6FDCE3] w-[90%]'>
                <p className='text-2xl font-bold text-white'>
                    DocTIC siempre ofrece contenido que me inspira a explorar más en el ámbito tecnológico. Es un recurso valioso para cualquiera que quiera estar al tanto.
                </p>

                {/* Esquinas cuadradas fuera del contenedor */}
                <span className="absolute top-[-8px] left-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute top-[-8px] right-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute bottom-[-8px] left-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute bottom-[-8px] right-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
            </div>
            <div className='flex items-center justify-between w-[90%]'>
                <p className='font-bold text-2xl text-white mt-10'>Camila Guzman</p>
                <div className='flex gap-1 mt-10'>
                    <FaStar className='text-white text-2xl' />
                    <FaStar className='text-white text-2xl' />
                    <FaStar className='text-white text-2xl' />
                    <FaStar className='text-white text-2xl' />
                    <FaStar className='text-white text-2xl' />
                </div>
            </div>

        </div>

    </div>
}

export default Recover