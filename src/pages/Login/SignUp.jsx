import React, { useState } from 'react';


import background from "../../assets/images/signup.png";
import logo from "../../assets/images/logo.png";
import { FaStar } from "react-icons/fa6";
import { FaEnvelope, FaLock, FaUser, FaUserCheck, FaQuestionCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner'
import Loading from '../App/Reusable/Loading';
function SignUp() {

    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(false); // Estado de carga
    const [formData, setFormData] = useState({ nombreCompleto: '', correo: '', contrasenia: '' }); // Datos del primer formulario
    const [securityData, setSecurityData] = useState({ nickName: '', preguntaAutenticacion: '', respuesta: '' }); // Datos del segundo formulario
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const handleContinue = () => {
        setUserData((prev) => ({ ...prev, ...formData }));
        setStep(2);
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        const finalData = {
            nombreCompleto: userData.nombreCompleto,
            nickName: securityData.nickName,
            registro: {
                correo: userData.correo,
                fechaRegistro: new Date().toISOString().split('T')[0], // Fecha actual
                infoPregunta: {
                    preguntaAutenticacion: securityData.preguntaAutenticacion,
                    respuesta: securityData.respuesta
                }
            },
            numDocumentosPublicados: 0,
            contrasenias: [
                {
                    contrasenia: userData.contrasenia,
                    estado: "Activa"
                }
            ]
        };
        console.log('Final Data:', finalData);
        setLoading(true); // Iniciar el estado de carga

        try {
            const response = await axios.post(`${API_URL}/clientesAuth/registrar`, finalData);
            if (response.status === 201) {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error('El correo electrónico ingresado ya está registrado. Por favor, intenta con uno diferente.');
            console.log(error)
        } finally {
            setLoading(false); // Finalizar el estado de carga
        }
    };

    return (
        <div className='flex h-full w-full items-center justify-center'>
            <Toaster richColors position="top-center" />
            {step === 1 ? (
                <FormSignUp
                    formData={formData}
                    setFormData={setFormData}
                    onContinue={handleContinue}
                />
            ) : (
                <FormQuestion
                    securityData={securityData}
                    setSecurityData={setSecurityData}
                    onSubmit={handleSignUp}
                    loading={loading}
                />
            )}
            <Review />
        </div>
    );
}

function FormSignUp({ formData, setFormData, onContinue }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const isFormValid = () => {
        return (
            formData.nombreCompleto.trim() !== '' &&
            formData.correo.trim() !== '' &&
            formData.contrasenia.trim() !== ''
        );
    };

    return (
        <div className='bg-black h-screen w-full'>
            <div className="flex justify-center items-center min-h-screen bg-[#FBFBFB]">
                <div className="max-w-sm w-full">
                    {/* Logo */}
                    <div className="flex mb-6">
                        <img src={logo} alt="DocTIC" className="w-32 h-auto bg-contain" />
                    </div>

                    {/* Título */}
                    <h2 className="text-3xl font-bold text-[#262626] mb-1">Crear cuenta</h2>
                    <p className="text-[#000000] mb-5">
                        ¿Nuevo en DocTIC?{' '}
                        <Link to="/login" className="text-[#4B3DE3] font-semibold hover:underline">
                            ¿Ya tienes una cuenta en DocTIC?
                        </Link>
                    </p>

                    {/* Formulario */}
                    <form className='mt-10' onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="name">
                                Nombre y apellidos
                            </label>
                            <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                                <FaUser className="text-gray-500" />
                                <input
                                    id="name"
                                    name="nombreCompleto"
                                    type="text"
                                    placeholder="Alfonso Murillo"
                                    className="flex-1 ml-3 h-10 outline-none text-gray-700"
                                    value={formData.nombreCompleto}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="email">
                                Correo electrónico
                            </label>
                            <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                                <FaEnvelope className="text-gray-500" />
                                <input
                                    id="email"
                                    name="correo"
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className="flex-1 ml-3 h-10 outline-none text-gray-700"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="password">
                                Contraseña
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg mt-1 px-3 py-2">
                                <FaLock className="text-gray-500" />
                                <input
                                    id="password"
                                    name="contrasenia"
                                    type="password"
                                    placeholder="***********"
                                    className="flex-1 ml-3 h-10 outline-none text-gray-700"
                                    value={formData.contrasenia}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Botón de continuar */}
                        <button
                            type="submit"
                            className={`w-full py-4 rounded-lg text-base font-semibold mt-8 transition duration-300 ${isFormValid() ? 'bg-[#4B3DE3] hover:bg-[#3D33AE] text-white' : 'bg-gray-400 text-white '}`}

                            disabled={!isFormValid()}
                        >
                            Continuar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function FormQuestion({ securityData, setSecurityData, onSubmit, loading }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSecurityData((prev) => ({ ...prev, [name]: value }));
    };

    // Función para verificar si todos los campos están llenos
    const isFormValid = () => {
        return (
            securityData.nickName.trim() !== '' &&
            securityData.preguntaAutenticacion.trim() !== '' &&
            securityData.respuesta.trim() !== ''
        );
    };

    return (
        <div className='bg-black h-screen w-full'>
            <div className="flex justify-center items-center min-h-screen bg-[#FBFBFB]">
                <div className="max-w-sm w-full">
                    {/* Logo */}
                    <div className="flex mb-6">
                        <img src={logo} alt="DocTIC" className="w-32 h-auto bg-contain" />
                    </div>

                    {/* Título */}
                    <h2 className="text-3xl font-bold text-[#262626] mb-1">Pregunta de seguridad</h2>
                    <p className="text-[#000000] mb-5">Selecciona una pregunta de seguridad</p>

                    {/* Formulario */}
                    <form className='mt-10' onSubmit={onSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="nickname">
                                Nickname
                            </label>
                            <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                                <FaUser className="text-gray-500" />
                                <input
                                    id="nickname"
                                    name="nickName"
                                    type="text"
                                    placeholder="Alf_DK"
                                    className="flex-1 ml-3 h-10 outline-none text-gray-700"
                                    value={securityData.nickName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="security-question">
                                Pregunta de seguridad
                            </label>
                            <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                                <FaQuestionCircle className="text-gray-500 text-2xl" />
                                <select
                                    id="preguntaAutenticacion"
                                    name="preguntaAutenticacion"
                                    className="w-[100%] ml-2 h-10 outline-none text-gray-700 bg-white"
                                    value={securityData.preguntaAutenticacion}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecciona una pregunta</option>
                                    <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
                                    <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
                                    <option value="¿Cuál fue tu primer empleo?">¿Cuál fue tu primer empleo?</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="answer">
                                Respuesta
                            </label>
                            <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                                <FaLock className="text-gray-500" />
                                <input
                                    id="answer"
                                    name="respuesta"
                                    type="text"
                                    placeholder="Tu respuesta"
                                    className="flex-1 ml-3 h-10 outline-none text-gray-700"
                                    value={securityData.respuesta}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Botón de continuar */}
                        <button
                            type="submit"
                            className={`w-full ${loading ? 'bg-gray-400' : isFormValid() ? 'bg-[#4B3DE3]' : 'bg-gray-400'} text-white py-4 rounded-lg text-base font-semibold mt-8 transition duration-300 hover:bg-[#3D33AE]`}
                            disabled={loading || !isFormValid()}
                        >
                            {loading ? <Loading /> : 'Crear cuenta'}
                        </button>
                    </form>
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
                    El contenido de DocTIC ha sido clave para mantenerme al día en el mundo de la tecnología. Las publicaciones son siempre interesantes.
                </p>

                {/* Esquinas cuadradas fuera del contenedor */}
                <span className="absolute top-[-8px] left-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute top-[-8px] right-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute bottom-[-8px] left-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute bottom-[-8px] right-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
            </div>
            <div className='flex items-center justify-between w-[90%]'>
                <p className='font-bold text-2xl text-white mt-10'>Pablo Escobar</p>
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



export default SignUp