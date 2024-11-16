import { useState, useEffect, useMemo, useRef } from 'react'
import { FiSearch } from "react-icons/fi";
import { FaDownload, FaEye, FaStar, } from 'react-icons/fa6';
import { FaRegEdit, FaRegTrashAlt, FaRegStar, FaRegCommentDots, FaRegSadCry } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/loading.json";
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { decryptId, decryptUserData } from '../../encryption';
import { createAutocomplete } from '@algolia/autocomplete-core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Loading from '../App/Reusable/Loading';
import { MdReport } from 'react-icons/md';

function Document() {
    const { id } = useParams();
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const idDocument = decryptId(id)
    console.log(idDocument)
    const [userData, setUserData] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL;


    useEffect(() => {
        const encryptedUserData = localStorage.getItem("sam12mdqow");
        let userDataLocal = null;
        if (encryptedUserData) {
            userDataLocal = decryptUserData(encryptedUserData);
            setUserData(userDataLocal);
        } else {
            setUserData(null);
        }

        const fetchDocument = async () => {
            try {
                setLoading(true);
                const response = await axios.post(`${API_URL}/documentos/verDocumento/${id}`, {
                    userId: userDataLocal?.id || null
                });
                setDocumentData(response.data);
            } catch (err) {
                console.error("Error fetching document data:", err);
                setError("No se pudo cargar el documento. Intente nuevamente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchDocument();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Lottie animationData={loadingAnimation} className="w-48" loop={true} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">{error}</div>
        );
    }

    return (
        documentData ? (
            <div className="h-screen w-full bg-[#FBFBFB]">
                <Navbar userData={userData} />
                <div className="flex h-screen mt-5">
                    <Sidebar documentData={documentData[0]} userData={userData} />
                    <div className="flex-grow">
                        <DocumentViewer
                            title={documentData[0].titulo}
                            documentUrl={documentData[0].URL}
                            userData={userData}
                            fileId={idDocument}
                        />
                    </div>
                    <Comments idDocument={idDocument} userData={userData} />
                </div>
            </div>
        ) : null
    );
}

function Navbar({ userData }) {
    const API_URL = import.meta.env.VITE_API_URL;
    const [autocompleteState, setAutocompleteState] = useState({
        collections: [],
        isOpen: false
    });

    const autocomplete = useMemo(() => createAutocomplete({
        onStateChange: ({ state }) => setAutocompleteState(state),
        getSources: () => [{
            sourceId: 'documents',
            getItems: async ({ query }) => {
                if (!!query) {
                    try {
                        const res = await fetch(`${API_URL}/documentos/documentosPaginados?page=1&limit=100`);
                        const data = await res.json();
                        const filteredItems = data.data.filter(document =>
                            document.titulo.toLowerCase().includes(query.toLowerCase())
                        );

                        return filteredItems;
                    } catch (error) {
                        console.error('Error fetching documents:', error);
                        return [];
                    }
                }
                return [];
            }
        }],
    }), [API_URL]);

    const formRef = useRef(null);
    const inputRef = useRef(null);
    const panelRef = useRef(null);

    const formProps = autocomplete.getFormProps({
        inputElement: inputRef.current
    });
    const inputProps = autocomplete.getInputProps({
        inputElement: inputRef.current,
        placeholder: "Buscar documentos"
    });

    return (
        <div className='w-full pt-10 px-20 flex items-center justify-between'>
            <Link to={'/'}>
                <img src={logo} className='w-32 h-auto' alt="Logo" />
            </Link>

            <div className="relative flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full max-w-lg bg-white">
                <form ref={formRef} className="relative w-full" {...formProps}>
                    <input
                        ref={inputRef}
                        className="w-full outline-none bg-white text-black placeholder-gray-500"
                        placeholder="Buscar documentos"
                        {...inputProps}
                    />
                    {autocompleteState.isOpen && (
                        <div
                            className="absolute left-0 right-0 mt-2 border border-gray-100 bg-white rounded-lg shadow-lg z-10"
                            ref={panelRef}
                            {...autocomplete.getPanelProps()}
                        >
                            {autocompleteState.collections.map((collection, index) => {
                                const { items } = collection;
                                return (
                                    <section key={`section-${index}`}>
                                        {items.length > 0 && (
                                            <ul {...autocomplete.getListProps()}>
                                                {items.map(item => (
                                                    <AutocompleteItem key={item.id} {...item} />
                                                ))}
                                            </ul>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </form>
                {inputRef && (
                    <Link to={`/search?title=${inputRef.current?.value}`}>
                        <FiSearch className='text-[#4B3DE3] text-xl ml-2' />
                    </Link>
                )}
            </div>

            {!userData ? (
                <div>
                    <Link to={'/login'} className='text-[#404040] shadow-md rounded-[12px] bg-white px-4 py-2'>
                        Iniciar sesión
                    </Link>
                    <Link to={'/signup'} className='ml-5 text-white bg-[#4B3DE3] px-4 py-2 rounded-[12px]'>
                        Crear Cuenta
                    </Link>
                </div>
            ) : (
                <Link to={'/dashboard'} className="flex items-center">
                    <img
                        src={`https://ui-avatars.com/api/?name=${userData.nickName}&size=40&background=4891E0&color=fff`}
                        alt="Avatar"
                        className="w-10 h-10 mr-2 rounded-full border border-gray-300"
                    />
                    <div className='flex flex-col items-start'>
                        <span className="ml-2 text-black font-semibold">{userData.nombreCompleto}</span>
                        <span className="ml-2 text-gray-500 text-sm">@{userData.nickName}</span>
                    </div>
                </Link>
            )}
        </div>
    );
}
function Sidebar({ documentData, userData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const authors = documentData.infoAutores || [];
    const authorCount = authors.length;
    const numVisualizaciones = documentData.numVisualizaciones || 0;
    const numDescargas = documentData.numDescargas || 0;
    const numValoraciones = documentData.valoraciones ? documentData.valoraciones.length : 0;

    const promedioPuntuacion = numValoraciones > 0
        ? (documentData.valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / numValoraciones).toFixed(1)
        : "0";

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className="w-1/4 pl-10 pr-14 pt-12 bg-white">
            <Toaster richColors position="top-center" />
            <div className="flex gap-2 text-[#596280]">
                <div className="flex items-center justify-center gap-1">
                    <FaEye />
                    {numVisualizaciones}
                </div>
                <div className="flex items-center justify-center gap-1">
                    <FaDownload />
                    {numDescargas}
                </div>
                <div className="flex items-center justify-center gap-1">
                    <FaRegCommentDots />
                    {numValoraciones}
                </div>
                <div className="flex items-center justify-center gap-1">
                    <FaRegStar />
                    {promedioPuntuacion}
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">{documentData.titulo || "Sin título"}</h2>
            {authorCount > 0 && (
                <p className="text-sm text-[#596280] font-semibold">
                    {authorCount === 1 ? "Autor: " : "Autores: "}
                    {authors.map((author, index) => (
                        <span key={index}>
                            {author.registrado ? (
                                <Link to={`/author/${author.nickName}/${author.nombreCompleto}`} className="text-[#4B3DE3] underline">
                                    {author.nombreCompleto}
                                </Link>
                            ) : (
                                <span>{author.nombreCompleto}</span>
                            )}
                            {index < authorCount - 1 && ", "}
                        </span>
                    ))}
                </p>
            )}
            <p className="text-sm text-[#596280] font-medium mt-2">
                Cargado el {new Date(documentData.fechaPublicacion).toLocaleDateString() || "Fecha desconocida"}
            </p>
            <p className="text-sm text-[#596280] font-medium mt-2">
                Última modificación: {new Date(documentData.fechaUltimaModificacion).toLocaleDateString() || "Fecha desconocida"}
            </p>
            <div className="my-4">
                <h3 className="text-lg font-semibold text-black">Descripción</h3>
                <p className="text-sm text-gray-700">
                    {documentData.descripcion.length > 100
                        ? `${documentData.descripcion.slice(0, 100)}...`
                        : documentData.descripcion || "No hay descripción disponible."}
                </p>
                <p
                    className="text-[#4B3DE3] text-sm mt-2 block hover:underline font-medium cursor-pointer"
                    onClick={handleOpenModal}
                >
                    Ver descripción completa
                </p>
            </div>
            <div className="my-4">
                <h3 className="text-lg font-semibold text-black">Categoría</h3>
                <p className="text-sm text-gray-700 mt-2">
                    {documentData.categoria.map((cat, index) => (
                        <span key={index}>
                            {cat.categoriaNombre}
                            {index < documentData.categoria.length - 1 && ", "}
                        </span>
                    ))}
                </p>
            </div>
            {userData ? (
                <p className="text-[#4B3DE3] underline mt-48 flex items-center cursor-pointer">
                    <MdReport className="mr-2 text-lg" /> Reportar documento
                </p>
            ) : null}

            {isModalOpen && (
                <Modal
                    description={documentData.descripcion}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

function DocumentViewer({ title, documentUrl, fileId, userData }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false); // Nuevo estado para registrar si la descarga fue exitosa
    const API_URL = import.meta.env.VITE_API_URL;
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        toolbarPlugin: {
            downloadPlugin: {
                enableDownload: false,
            },
        },
    });
    console.log(fileId)


    const downloadFile = async () => {

        const response = await fetch(documentUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/pdf',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener el archivo PDF');
        }

        const blob = await response.blob();
        const urlBlob = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(urlBlob);

    };

    const handleDownload = async () => {
        setIsLoading(true);
        if (userData) {
            try {
                await downloadFile(); // Descargar el archivo
                setIsDownloaded(true);

                toast.success("La descarga ha comenzado");
            } catch (error) {
                console.error('Error en el proceso de descarga:', error);
                toast.error("Error al descargar el documento");
            }
        } else {
            toast.error("Debes iniciar sesión para descargar un documento");
            setIsDownloaded(false);
        }
        setIsLoading(false);
    };


    useEffect(() => {
        console.log("La descarga ya se hizo y downloaded es", isDownloaded)
        const registerDownload = async () => {
            try {
                console.log("Esta descargando")
                console.log(userData.id)
                const response = await fetch(`${API_URL}/documentos/descargar/${fileId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: userData.id })
                });

                if (!response.ok) {
                    throw new Error('No se pudo registrar la descarga');
                }

                console.log("Registro de descarga exitoso");
            } catch (error) {
                console.error('Error en el registro de descarga:', error);
                toast.error("Error al registrar la descarga");
            }
        };

        if (isDownloaded) {
            registerDownload();
        }


    }, [isDownloaded]);

    return (
        <div className="flex flex-col items-center justify-start bg-[#F0F2F9] w-full h-screen">
            <Toaster richColors position='top-center' />
            <div className="flex pl-10 py-4 bg-white items-start justify-start w-full">
                <button
                    className="bg-[#4B3DE3] text-white px-4 py-2 rounded"
                    onClick={handleDownload}
                    disabled={isLoading}
                >
                    {isLoading ? <Loading /> : 'Descargar'}
                </button>
            </div>

            <div className="flex-grow w-full bg-[#F0F2F9] p-5 flex justify-center items-center">
                <div className="w-full h-full" style={{ maxWidth: '800px', height: '90vh' }}>
                    <Viewer fileUrl={documentUrl} plugins={[defaultLayoutPluginInstance]} />
                </div>
            </div>
        </div>
    );
}



function Comments({ idDocument, userData }) {
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchRatings = async () => {
        try {
            const response = await fetch(`${API_URL}/documentos/listarValoraciones/${idDocument}`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, [idDocument]);

    const handleRatingClick = (rate) => {
        setRating(rate);
    };

    const handleCommentChange = (event) => {
        setCommentText(event.target.value);
    };

    const handleSubmitComment = async () => {
        if (rating < 1) {
            toast.error("Por favor, selecciona al menos una estrella.");
            return;
        }

        const newComment = {
            comentario: commentText,
            clienteId: userData.id,
            puntuacion: rating
        };

        try {
            const endpoint = isEditing
                ? `${API_URL}/documentos/editarValoracionDeDocumento/${idDocument}/${editingCommentId}`
                : `${API_URL}/documentos/crearValoracion/${idDocument}`;
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });

            if (response.ok) {
                toast.success(isEditing ? "Comentario actualizado exitosamente." : "Comentario añadido correctamente.");
                fetchRatings();
            } else {
                toast.error(isEditing ? "Error al actualizar el comentario." : "Ya has enviado un comentario. Solo se permite uno por usuario.");
            }

            setCommentText('');
            setRating(0);
            setShowRating(false);
            setEditingCommentId(null);
            setIsEditing(false);
        } catch (error) {
            console.error('Error creating or updating comment:', error);
            toast.error("Error en el servidor. Por favor, inténtalo de nuevo.");
        }
    };

    const handleDeleteComment = async () => {
        try {
            const response = await fetch(`${API_URL}/documentos/eliminarValoracion/${idDocument}/${commentToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setComments(comments.filter(comment => comment.id !== commentToDelete));
                toast.success("Comentario eliminado correctamente.");
                fetchRatings();
            } else {
                toast.error("Error al eliminar el comentario.");
            }
        } catch (error) {
            console.error("Error al eliminar el comentario:", error);
        } finally {
            setShowDeleteModal(false);
            setCommentToDelete(null);
        }
    };

    const confirmDeleteComment = (commentId) => {
        setCommentToDelete(commentId);
        setShowDeleteModal(true);
    };

    const handleEditComment = (comment) => {
        setCommentText(comment.comentario);
        setRating(comment.puntuacion);
        setEditingCommentId(comment.idValoracion);
        setShowRating(true);
        setIsEditing(true);
    };

    return (
        <div className="w-1/5 p-4 bg-white h-full flex flex-col">
            <Toaster richColors position='top-center' />

            {/* Comentario y calificación para usuarios autenticados */}
            {userData ? (
                <>
                    {showRating && (
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    onClick={() => handleRatingClick(star)}
                                    className={`cursor-pointer mt-14 text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                    )}
                    <textarea
                        className={`border border-[#D6D6D6] bg-white w-full ${showRating ? 'mt-1' : 'mt-14'} px-4 py-3 mb-2 rounded-[8px]`}
                        placeholder="Escribe tu comentario"
                        value={commentText}
                        onChange={handleCommentChange}
                        onFocus={() => setShowRating(true)}
                    />
                    <button
                        onClick={handleSubmitComment}
                        className="w-full text-white py-4 rounded-lg text-base font-semibold transition duration-300 
                                    bg-[#4B3DE3] hover:bg-[#3D33AE] h-10 mb-8 flex items-center justify-center"
                    >
                        {isEditing ? "Actualizar Comentario" : "Comentar"}
                    </button>
                </>
            ) : (
                <>
                    {/* Área de comentario deshabilitada para usuarios no autenticados */}
                    <textarea
                        className="border border-[#D6D6D6] bg-gray-100 w-full mt-14 px-4 py-3 mb-2 rounded-[8px] cursor-not-allowed"
                        placeholder="Inicia sesión para dejar un comentario"
                        disabled
                    />
                    <button
                        className="w-full text-white py-4 rounded-lg text-base font-semibold transition duration-300 
                                    bg-gray-300 cursor-not-allowed h-10 mb-8 flex items-center justify-center"
                        disabled
                    >
                        Comentar
                    </button>
                </>
            )}

            {/* Listado de comentarios */}
            <div className="overflow-y-auto flex-grow max-h-[calc(100vh-200px)] pb-16">
    {comments.length === 0 || (comments.length === 1 && Object.keys(comments[0]).length === 0) ? (
        <p className="text-left text-gray-500 mt-4">
            ¡Aún no se han publicado valoraciones! <br /> Sé el primero en dejar tu opinión.
        </p>
    ) : (
        comments.map((comment) => (
            <div key={comment.idValoracion} className="flex gap-5 mb-4">
                <img
                    src={`https://ui-avatars.com/api/?name=${comment.nombreCliente}&size=40&background=4891E0&color=fff`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                />
                <div className="shadow-md border border-[#E9E9E9] py-4 px-5 rounded-tr-[28px] rounded-b-[28px] relative w-56">
                    <h4 className="font-bold text-lg mb-2">{comment.nombreCliente}</h4>
                    <p className="text-sm text-gray-700">{comment.comentario || "No se proporcionó un comentario"}</p>
                    <span className="text-xs text-gray-500">
                        {new Date(comment.fecha).toLocaleDateString()}
                    </span>
                    <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                className={`text-lg ${star <= Number(comment.puntuacion) ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    {userData && comment.clienteId === userData.id && (
                        <div className="absolute top-2 right-2 flex gap-2">
                            <FaRegEdit
                                onClick={() => handleEditComment(comment)}
                                className="cursor-pointer text-xl text-blue-500 hover:text-blue-700"
                            />
                            <FaRegTrashAlt
                                onClick={() => confirmDeleteComment(comment.idValoracion)}
                                className="cursor-pointer text-xl text-red-500 hover:text-red-700"
                            />
                        </div>
                    )}
                </div>
            </div>
        ))
    )}
    {/* Espacio adicional al final para evitar que el último comentario se corte */}
    <div className="pb-16"></div>
</div>


            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
                        <p>¿Estás seguro de que deseas eliminar este comentario?</p>
                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={handleDeleteComment}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                            >
                                Eliminar
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-300 px-4 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}




function Modal({ description, onClose }) {
    // Variantes de animación
    const modalVariants = {
        hidden: { opacity: 0, y: "-50%" },
        visible: { opacity: 1, y: "0%" },
        exit: { opacity: 0, y: "50%" },
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <motion.div
                className="bg-white p-8 h-[400px] overflow-y-auto rounded shadow-md z-10 max-w-lg mx-auto"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={modalVariants}
                transition={{ duration: 0.3 }} // Ajusta la duración de la animación aquí
            >
                <h2 className="text-xl font-bold mb-4">Descripción Completa</h2>
                <p>{description}</p>
                <button
                    className="mt-4 bg-[#4B3DE3] text-white py-2 px-4 rounded"
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </motion.div>
        </div>
    );
}
const AutocompleteItem = ({ id, titulo }) => {
    return (
        <li>
            <Link to={`/search?title=${titulo}`}>
                <a className='hover:bg-blue-300 flex gap-4 p-4'>

                    <div>
                        <h3 className='text-sm font-semibold'>{titulo}</h3>
                    </div>
                </a>
            </Link>
        </li>
    )
}

export default Document 