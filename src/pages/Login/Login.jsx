import { useState } from 'react'
import background from "../../assets/images/login.png";
import logo from "../../assets/images/logo.png"
import { FaStar } from "react-icons/fa6";
import { FaEnvelope, FaCheckCircle, FaEye, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import Loading from '../App/Reusable/Loading';
import { encryptUserData } from '../../encryption';
function Login({ setValidate }) {
    return (
        <div className='flex  h-full w-full items-center justify-center'>
            <FormLogin setValidate={setValidate} />
            <Review />
        </div>
    )
}


function FormLogin({ setValidate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            registro: {
                correo: email,
                contrasenia: password,
            },
        };

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/clientesAuth/login`, data);
            console.log(response)
            console.log(response.data.cliente.nickName)
            const userData = {
                id: response.data.cliente._id,
                nickName: response.data.cliente.nickName,
                nombreCompleto: response.data.cliente.nombreCompleto
            }

            const encryptedUserData = encryptUserData(userData);
            localStorage.setItem("sam12mdqow", encryptedUserData);
            setValidate(encryptUserData)

            navigate('/dashboard');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            toast.error('Error al iniciar sesión. Por favor, verifica tus datos.');
        } finally {
            setLoading(false);
        }
    };

    // Verifica si los campos están vacíos
    const isDisabled = !email || !password;

    return (
        <div className="bg-black h-screen w-full">
            <Toaster richColors position="top-center" />
            <div className="flex justify-center items-center min-h-screen bg-[#FBFBFB]">
                <div className="max-w-sm w-full">
                    {/* Logo */}
                    <div className="flex mb-6">
                        <img src={logo} alt="DocTIC" className="w-32 h-auto bg-contain" />
                    </div>

                    {/* Título */}
                    <h2 className="text-3xl font-bold text-[#262626] mb-1">Bienvenido de nuevo</h2>
                    <p className="text-[#000000] mb-5">
                        ¿Nuevo en DocTIC?{' '}
                        <Link to="/signup" className="text-[#4B3DE3] font-semibold hover:underline">
                            Crea una cuenta
                        </Link>
                    </p>

                    {/* Formulario */}
                    <form className="mt-10" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="mb-4">
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

                        {/* Contraseña */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="password">
                                Contraseña
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg mt-1 px-3 py-2">
                                <FaLock className="text-gray-500" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="***********"
                                    className="flex-1 ml-3 h-10 outline-none text-gray-700"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Enlace para recuperar contraseña */}
                        <div className="flex justify-start mb-6">
                            <Link to="/recover" className="text-sm text-[#4B3DE3] hover:underline font-medium">
                                ¿Olvidaste la contraseña?
                            </Link>
                        </div>

                        {/* Botón de inicio de sesión */}
                        <button
                            type="submit"
                            className={`w-full text-white py-4 rounded-lg text-base font-semibold transition duration-300 
                                ${isDisabled ? 'bg-gray-400  text-white cursor-not-allowed' : 'bg-[#4B3DE3] hover:bg-[#3D33AE] text-white'}`}
                            disabled={isDisabled}
                        >
                            {loading ? <Loading /> : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function Review() {
    return <div className=' bg-yellow-50 relative h-screen w-full bg-contain' style={{ backgroundImage: `url(${background})` }}>
        <div className='absolute bottom-10 left-20 '>
            <div className='relative p-4 border-4 border-[#6FDCE3] w-[90%]'>
                <p className='text-2xl font-bold text-white'>
                    Los artículos de DocTIC me han ayudado a aprender mucho más sobre tecnología y a expandir mi conocimiento en este campo. ¡Gracias!
                </p>

                {/* Esquinas cuadradas fuera del contenedor */}
                <span className="absolute top-[-8px] left-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute top-[-8px] right-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute bottom-[-8px] left-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
                <span className="absolute bottom-[-8px] right-[-8px] border-2 border-[#6FDCE3] w-4 h-4 bg-white"></span>
            </div>
            <div className='flex items-center justify-between w-[90%]'>
                <p className='font-bold text-2xl text-white mt-10'>Paula Andrea</p>
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

export default Login