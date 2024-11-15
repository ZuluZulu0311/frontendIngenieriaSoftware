import React, { useEffect, useState } from 'react';
import logo from '../../assets/images/logo.png'
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import loadingAnimation from '../../assets/loading.json'
import Lottie from 'lottie-react';
import { toast, Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Loading from '../App/Reusable/Loading';
function PasswordRecoveryPage() {
    const [step, setStep] = useState('securityQuestion');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState(0); // Contador de intentos fallidos
    const [isBlocked, setIsBlocked] = useState(false); // Para bloquear el email después de 3 intentos fallidos
    const securityQuestion = '¿Cuál es tu color favorito?';

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const API_URL = import.meta.env.VITE_API_URL;

    // Verificar si el email está bloqueado al cargar la página
    useEffect(() => {
        const blockedData = localStorage.getItem(email);
        if (blockedData) {
            const { blockedAt, attempts } = JSON.parse(blockedData);
            const currentTime = new Date().getTime();

            // Si han pasado menos de 5 minutos desde el bloqueo, bloqueamos el acceso
            if (currentTime - blockedAt < 5 * 60 * 1000) {
                setIsBlocked(true);
            } else {
                // Si han pasado más de 5 minutos, reiniciamos el bloqueo
                localStorage.removeItem(email);
                setIsBlocked(false);
            }
        }
    }, [email]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${API_URL}/clientesAuth/recuperarContrasenaPasoUno`, { email });
                console.log('Respuesta del servidor:', response.data);
                setInfo(response.data);
            } catch (error) {
                console.error('Error al recuperar la contraseña:', error);
                setInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [email]);

    const handleSecuritySubmit = () => {
        if (isBlocked) {
            toast.error('Tu cuenta ha sido bloqueada temporalmente debido a intentos fallidos.');
            return;
        }

        if (answer === info.respuesta) {
            setStep('updatePassword');
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 3) {
                // Bloquear el email y guardar el tiempo de bloqueo
                const currentTime = new Date().getTime();
                const blockedData = { blockedAt: currentTime, attempts: newAttempts };
                localStorage.setItem(email, JSON.stringify(blockedData));
                setIsBlocked(true);
                toast.error('Has superado el número máximo de intentos. Tu cuenta ha sido bloqueada temporalmente.');
            } else {
                toast.error('Respuesta incorrecta');
            }
        }
    };


    if (loading) {
        return (
            <div className='flex justify-center items-center'>
                <Lottie animationData={loadingAnimation} className='w-48 h-48' loop={true} />
            </div>
        );
    }

    return (
        info && <div className='bg-[#FBFBFB] min-h-screen flex justify-center items-center'>
            <Toaster richColors position='top-center' />
            <div className="max-w-md w-full bg-white p-6 shadow-lg rounded-lg">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="DocTIC" className="w-32 h-auto" />
                </div>
                {step === 'securityQuestion' ? (
                    <SecurityQuestionStep
                        onAnswerSubmit={handleSecuritySubmit}
                        securityQuestion={info.preguntaAutenticacion}
                        answer={answer}
                        setAnswer={setAnswer}
                    />
                ) : (
                    <UpdatePasswordStep

                        newPassword={newPassword}
                        answer={answer}
                        setNewPassword={setNewPassword}
                        email={email}
                    />
                )}
            </div>
        </div>
    );
}

// Componente para la pregunta de seguridad
const SecurityQuestionStep = ({ onAnswerSubmit, securityQuestion, answer, setAnswer }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onAnswerSubmit();
    };

    const isAnswerValid = answer.trim().length > 0; // Verificar si la respuesta no está vacía

    return (
        <>
            <h2 className="text-3xl font-bold text-[#262626] mb-2">Pregunta de seguridad</h2>
            <p className="text-[#000000] mb-4">Responde la pregunta de seguridad para continuar.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="question">
                        Pregunta de seguridad
                    </label>
                    <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-2 py-2">
                        <input
                            id="question"
                            type="text"
                            value={securityQuestion}
                            readOnly
                            className="flex-1 h-10 outline-none text-gray-700 bg-transparent"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="answer">
                        Respuesta
                    </label>
                    <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                        <input
                            id="answer"
                            type="text"
                            placeholder="Tu respuesta"
                            className="flex-1 h-10 outline-none text-gray-700"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isAnswerValid} // Deshabilitar el botón si la respuesta está vacía
                    className={`w-full py-4 rounded-lg text-base font-semibold mt-4 transition duration-300 ${isAnswerValid ? 'bg-[#4B3DE3] text-white hover:bg-[#3D33AE]' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                >
                    Continuar
                </button>
            </form>
        </>
    );
};

// Componente para actualizar la contraseña
const UpdatePasswordStep = ({ onPasswordUpdate, newPassword, email, setNewPassword, answer, setAnswer }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)
    // Validar si la nueva contraseña tiene al menos 8 caracteres
    const isPasswordValid = newPassword.length >= 8;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const API_URL = import.meta.env.VITE_API_URL;
        setIsLoading(true)
        // Verificamos si la respuesta y la nueva contraseña están presentes
        if (!newPassword || !answer) {
            toast.error('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/clientesAuth/recuperarContra`, {
                correo: email,
                respuestaSeguridad: answer,
                nuevaContrasenia: newPassword,
            });

            console.log('Respuesta del servidor:', response.data);
            toast.success('Contraseña actualizada con éxito.');
            setIsLoading(true)
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Error al actualizar la contraseña:', error);
            toast.error('Hubo un error al actualizar la contraseña.');
            setIsLoading(false)
        }

    };

    return (
        <>
            <h2 className="text-3xl font-bold text-[#262626] mb-2">Actualizar Contraseña</h2>
            <p className="text-[#000000] mb-4">Ingresa tu nueva contraseña y la respuesta de la pregunta de seguridad.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="password">
                        Nueva contraseña
                    </label>
                    <div className="flex items-center bg-white border border-[#D6D6D6] rounded-lg mt-1 px-3 py-2">
                        <input
                            id="password"
                            type="password"
                            placeholder="Nueva contraseña"
                            className="flex-1 ml-3 h-10 outline-none text-gray-700"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isPasswordValid || !answer} // El botón está deshabilitado si no es válida la contraseña o si no hay respuesta
                    className={`w-full py-4 rounded-lg text-base font-semibold mt-4 transition duration-300 ${isPasswordValid ? 'bg-[#4B3DE3] text-white hover:bg-[#3D33AE]' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                >
                    {isLoading ? <Loading /> : 'Actualizar Contraseña'}
                </button>
            </form>
        </>
    );
};


export default PasswordRecoveryPage;
