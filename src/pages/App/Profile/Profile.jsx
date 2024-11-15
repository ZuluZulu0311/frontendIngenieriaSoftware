import React, { useState, useEffect } from 'react'
import { FaEnvelope, FaRegUser, FaQuestionCircle, FaUserCheck, FaFileMedical, FaFileDownload, FaFileAlt } from 'react-icons/fa';
import { decryptUserData } from '../../../encryption';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../assets/loading.json'
import { toast, Toaster } from 'sonner';
import Loading from '../Reusable/Loading';
import axios from 'axios';
function Profile() {
    const [page, setPage] = useState(0);
    const [userCompleteData, setUserCompleteData] = useState({});
    const [estadisticas, setEstadisticas] = useState({});
    const encryptedUserData = localStorage.getItem("sam12mdqow");
    const userData = decryptUserData(encryptedUserData);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_URL}/clientes/buscarUsuario/${userData.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserCompleteData(data);
                } else {
                    console.error('Error fetching user data:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (userData && userData.id) {
            fetchUserData(); // Llamada a la API para datos del usuario
        }
    }, [userData, page]);

    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                const response = await fetch(`${API_URL}/clientes/estadisticas/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: userData.id }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setEstadisticas(data);

                } else {
                    console.error('Error fetching statistics:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        if (userData && userData.id) {
            fetchEstadisticas(); // Llamada a la API para estadísticas
        }
    }, []);


    if (Object.keys(userCompleteData).length === 0) {
        return (
            <div className='pt-6'>
                <Lottie animationData={loadingAnimation} className='w-48' loop={true} />
            </div>
        );
    }

    // Si hay datos, mostrar el contenido del perfil
    return (
        <div className='pt-6'>
            <MyProfile userData={userData} />
            <div className='ml-10 mt-6 flex'>
                {page === 0 ? (
                    <ShowInfo userCompleteData={userCompleteData} userData={userData} estadisticas={estadisticas} setPage={setPage} />
                ) : (
                    <EditProfile userData={userData} setPage={setPage} userCompleteData={userCompleteData} />
                )}
                {/* Aquí puedes usar `estadisticas` como desees */}
                <div className='w-1/2 ml-20'>
                    <div className='w-[85%] flex items-center px-10 py-5 shadow-xl bg-white rounded-[30px]'>
                        <div className='bg-[#D9FAF2] p-5 rounded-[14PX] mr-7'>
                            <FaFileMedical className='text-3xl text-[#01DDA5]' />
                        </div>
                        <div>
                            <div className='text-black text-lg font-semibold'>
                                Documentos subidos
                            </div>
                            <div className='text-[#00162F] text-3xl font-bold'>
                                {estadisticas.documentosSubidos || 0}
                            </div>
                        </div>
                    </div>
                    <div className='w-[85%] mt-3 flex items-center px-10 py-5 shadow-xl bg-white rounded-[30px]'>
                        <div className='bg-[#FFF4E0] p-5 rounded-[14PX] mr-7'>
                            <FaFileAlt className='text-3xl text-[#FFB731]' />
                        </div>
                        <div>
                            <div className='text-black text-lg font-semibold'>
                                Documentos vistos
                            </div>
                            <div className='text-[#00162F] text-3xl font-bold'>
                                {estadisticas.documentosVistos || 0}
                            </div>
                        </div>
                    </div>
                    <div className='w-[85%] mt-3 flex items-center px-10 py-5 shadow-xl bg-white rounded-[30px]'>
                        <div className='bg-[#FEE7E3] p-5 rounded-[14PX] mr-7'>
                            <FaFileDownload className='text-3xl text-[#F85B43]' />
                        </div>
                        <div>
                            <div className='text-black text-lg font-semibold'>
                                Documentos descargados
                            </div>
                            <div className='text-[#00162F] text-3xl font-bold'>
                                {estadisticas.documentosDescargados || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MyProfile({ userData }) {

    return <div className='w-[90%] h-[184px] ml-10 bg-gradient-to-r from-[#4B3DE3] to-[#C67AFD] rounded-[25px] pl-20 py-5'>
        <div className='flex items-center'>
            <img
                src={`https://ui-avatars.com/api/?name=${userData.nickName}&size=40&background=4891E0&color=fff `}
                alt="Avatar"
                className="w-32 h-32 mr-2 rounded-[21px] border-4 border-white "
            />
            <div className='ml-10'>
                <p className='text-white text-lg font-medium'>Mi perfil</p>
                <p className='text-white text-3xl font-bold'>{userData.nombreCompleto}</p>
            </div>
        </div>
    </div>
}

function ShowInfo({ userCompleteData, setPage, userData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const WEB_URL = import.meta.env.VITE_WEB_URL;

    const handleDeleteAccount = async () => {
        try {
            await axios.post(`${API_URL}/clientesAuth/eliminar`, {
                userId: userData.id
            });
            setIsModalOpen(false);
            toast.success("Cuenta eliminada exitosamente");
            localStorage.removeItem("sam12mdqow");

            // Esperar 2 segundos antes de redirigir
            setTimeout(() => {
                window.location.href = WEB_URL;
            }, 2000);

        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
            alert('Hubo un error al intentar eliminar la cuenta.');
        }
    };
    return (
        <div className='w-1/2 px-10 pt-5 shadow-xl bg-white rounded-[30px]'>
            <Toaster richColors position='top-center' />
            <p className='text-[#00162F] font-semibold text-2xl'>Información de la cuenta</p>
            <div className='mt-5'>
                <p className='text-black font-semibold'>Nombre Completo</p>
                <p className='text-[#596280] font-medium'>{userCompleteData.nombreCompleto}</p>
            </div>
            <div className='mt-5'>
                <p className='text-black font-semibold'>Correo electrónico</p>
                <p className='text-[#596280] font-medium'>{userCompleteData.registro.correo || ''}</p>
            </div>
            <div className='mt-5'>
                <p className='text-black font-semibold'>Contraseña</p>
                <p className='text-[#596280] font-medium'>****************</p>
            </div>
            <div className='mt-5'>
                <p className='text-black font-semibold'>Pregunta de seguridad</p>
                <p className='text-[#596280] font-medium'>{userCompleteData.registro.infoPregunta.preguntaAutenticacion}</p>
            </div>
            <div className='w-full flex justify-end pr-5 pb-5 gap-6 cursor-pointer' >
                <p className='underline text-[#4B3DE3] font-medium' onClick={() => { setPage(1) }}>Editar</p>
                <p
                    className='underline text-[#FF2A2A] font-medium'
                    onClick={() => setIsModalOpen(true)}
                >
                    Eliminar cuenta
                </p>
            </div>

            {/* Modal de Confirmación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Confirmar Eliminación</h2>
                        <p className="mb-4 text-gray-700">¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y borrara todos tus documentos publicados.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function EditProfile({ setPage, userData, userCompleteData }) {
    const [innerPage, setInnerPage] = useState(0)
    return <div className='w-1/2 px-10 pt-5 shadow-xl bg-white rounded-[30px]'>
        <p className='text-[#00162F] font-semibold text-2xl'>Editar Perfil</p>
        <div className='flex gap-5 mt-3'>
            {innerPage !== 0 && (
                <p className='underline text-[#4B3DE3] font-medium cursor-pointer' onClick={() => setInnerPage(0)}>
                    Cambiar Nombre y Correo
                </p>
            )}

            {innerPage !== 1 && (
                <p className='underline text-[#4B3DE3] font-medium cursor-pointer' onClick={() => setInnerPage(1)}>
                    Cambiar Contraseña
                </p>
            )}

            {innerPage !== 2 && (
                <p className='underline text-[#4B3DE3] font-medium cursor-pointer' onClick={() => setInnerPage(2)}>
                    Cambiar Pregunta de Seguridad
                </p>
            )}
        </div>
        <div className='w-[100%] pb-10'>

            {innerPage === 0 && <EditNameEmail setPage={setPage} userData={userData} userCompleteData={userCompleteData} />}
            {innerPage === 1 && <EditPassword setPage={setPage} userData={userData} />}
            {innerPage === 2 && <EditQuestion setPage={setPage} userData={userData} />}
        </div>
    </div>


}
function EditNameEmail({ setPage, userData, userCompleteData }) {
    const [nombreCompleto, setNombreCompleto] = useState(userCompleteData.nombreCompleto);
    const [email, setEmail] = useState(userCompleteData.registro.correo);
    const [isLoading, setIsloading] = useState(false)
    const API_URL = import.meta.env.VITE_API_URL;

    const handleUpdate = async () => {
        setIsloading(true)
        const data = {
            userId: userData.id, // ID de usuario de ejemplo
            nombreCompleto,
            email
        };
        try {
            const response = await fetch(`${API_URL}/clientesAuth/actualizarNombre`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                setPage(0)
                toast.success("Datos actualizados correctamente")
            } else {

                alert('Error al actualizar los datos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al realizar la solicitud');
        }
        setIsloading(false)
    };

    const isButtonDisabled = !nombreCompleto || !email;

    return (
        <>
            <div className='mt-5'>
                <Toaster richColors position='top-center' />
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="nombreCompleto">
                    Nombre Completo
                </label>
                <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                    <FaRegUser className="text-gray-500" />
                    <input
                        id="nombreCompleto"
                        type="text"
                        placeholder="Alfonso Murillo"
                        className="flex-1 ml-3 h-10 outline-none text-gray-700"
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                    />
                </div>
            </div>
            <div className='mt-5'>
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="email">
                    Correo electrónico
                </label>
                <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                    <FaEnvelope className="text-gray-500" />
                    <input
                        id="email"
                        value={email}
                        type="email"
                        placeholder="alfonso@uao.edu.co"
                        className="flex-1 ml-3 h-10 outline-none text-gray-700"

                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>
            <button
                type="button"
                className={`w-full py-4 rounded-lg text-base font-semibold mt-10 transition duration-300 ${isButtonDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#4B3DE3] text-white hover:bg-[#3D33AE]'}`}
                onClick={handleUpdate}
                disabled={isButtonDisabled}
            >
                {isLoading ? <Loading /> : 'Actualizar'}
            </button>
        </>
    );
}

function EditPassword({ setPage, userData }) {
    const [contraseniaActual, setContraseniaActual] = useState('');
    const [nuevaContrasenia, setNuevaContrasenia] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;
    const [isLoading, setIsloading] = useState(false)
    const handleChangePassword = async () => {
        setIsloading(true)
        const data = {
            userId: userData.id,
            contraseniaActual,
            nuevaContrasenia
        };
        try {
            const response = await fetch(`${API_URL}/clientesAuth/cambiarContrasenia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast.success('Contraseña actualizada correctamente');
            } else {
                toast.error('Error al actualizar la contraseña');
            }
            setPage(0);
        } catch (error) {
            console.error('Error:', error);
            toast.error(error)
        }
        setIsloading(false)
    };

    const isButtonDisabled = !contraseniaActual || !nuevaContrasenia || contraseniaActual.length < 8 || nuevaContrasenia.length < 8;

    return (
        <>
            <div className='mt-5'>
                <Toaster richColors position='top-center' />
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="contraseniaActual">
                    Actual Contraseña
                </label>
                <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                    <input
                        id="contraseniaActual"
                        type="password"
                        placeholder="**************"
                        minLength="8"
                        required
                        className="flex-1 ml-3 h-10 outline-none text-gray-700"
                        value={contraseniaActual}
                        onChange={(e) => setContraseniaActual(e.target.value)}
                    />
                </div>
            </div>
            <div className='mt-5'>
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="nuevaContrasenia">
                    Nueva Contraseña
                </label>
                <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                    <input
                        id="nuevaContrasenia"
                        type="password"
                        placeholder="**************"
                        minLength="8"
                        required
                        className="flex-1 ml-3 h-10 outline-none text-gray-700"
                        value={nuevaContrasenia}
                        onChange={(e) => setNuevaContrasenia(e.target.value)}
                    />
                </div>
            </div>
            <button
                type="button"
                className={`w-full py-4 rounded-lg text-base font-semibold mt-10 transition duration-300 ${isButtonDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#4B3DE3] text-white hover:bg-[#3D33AE]'}`}
                onClick={handleChangePassword}
                disabled={isButtonDisabled}
            >
                {isLoading ? <Loading /> : 'Actualizar'}
            </button>
        </>
    );
}

function EditQuestion({ setPage, userData }) {
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;
    const [isLoading, setIsloading] = useState(false)
    const handleUpdateQuestion = async () => {
        setIsloading(true)
        const data = {
            userId: userData.id,
            nuevaPregunta: selectedQuestion,
            nuevaRespuesta: answer
        };
        try {
            const response = await fetch(`${API_URL}/clientesAuth/cambiarPregunta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                toast.success('Pregunta de seguridad actualizada correctamente');
            } else {
                toast.error('Error al actualizar la pregunta de seguridad');
            }
            setPage(0);
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al realizar la solicitud');
        }
        setIsloading(false)
    };

    const isButtonDisabled = !selectedQuestion || !answer;

    return (
        <>
            <div className='mt-5'>
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="security-question">
                    Pregunta de seguridad
                </label>
                <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                    <FaQuestionCircle className="text-gray-500 text-2xl" />
                    <select
                        id="security-question"
                        className="w-[100%] ml-2 h-10 outline-none text-gray-700 bg-white"
                        value={selectedQuestion}
                        onChange={(e) => setSelectedQuestion(e.target.value)}
                    >
                        <option value="">Selecciona una pregunta</option>
                        <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
                        <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
                        <option value="¿Cuál fue tu primer empleo?">¿Cuál fue tu primer empleo?</option>
                    </select>
                </div>
            </div>
            <div className='mt-5'>
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="security-answer">
                    Respuesta
                </label>
                <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                    <FaUserCheck className="text-gray-500" />
                    <input
                        id="security-answer"
                        type="text"
                        placeholder="Escribe tu respuesta"
                        className="flex-1 ml-3 h-10 outline-none text-gray-700"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </div>
            </div>
            <button
                type="button"
                className={`w-full py-4 rounded-lg text-base font-semibold mt-10 transition duration-300 ${isButtonDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#4B3DE3] text-white hover:bg-[#3D33AE]'}`}
                onClick={handleUpdateQuestion}
                disabled={isButtonDisabled}
            >
                {isLoading ? <Loading /> : 'Actualizar'}
            </button>
        </>
    );
}
export default Profile