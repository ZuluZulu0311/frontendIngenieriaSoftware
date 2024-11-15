import { useState, useEffect } from 'react'
import { MdCalendarToday } from "react-icons/md";
import { FaRegStar, FaRegCommentDots, FaUnlock, FaRegEdit, FaRegTrashAlt, FaLock } from "react-icons/fa";
import { FaDownload, FaEye, FaStar, } from 'react-icons/fa6';
import Loading from '../Reusable/Loading';
import axios from 'axios';
import { decryptUserData } from '../../../encryption';
import { motion } from 'framer-motion';
import Select from 'react-select'
import Lottie from 'lottie-react';
import loadingAnimation from "../../../assets/loading.json";
import { toast, Toaster } from 'sonner';
import { encryptId } from '../../../encryption';
import { Link } from 'react-router-dom';
import { uploadFile } from '@uploadcare/upload-client'
import convertPdfToPng from '../Upload/convertPdfToPng';
import languagesArray from '../../../data/languages';
function MyDocuments() {
    const [authorDocuments, setAuthorDocuments] = useState([]);
    const [viewedDocuments, setViewedDocuments] = useState([]);
    const [downloadedDocuments, setDownloadedDocuments] = useState([]);
    const [isUpdated, setIsUpdated] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    const encryptedUserData = localStorage.getItem("sam12mdqow");
    const userData = decryptUserData(encryptedUserData);
    const API_URL = import.meta.env.VITE_API_URL;
    const fetchAuthorDocuments = async () => {
        try {
            const response = await axios.get(`${API_URL}/documentos/verMisDocumentos/${userData.nickName}`);
            setAuthorDocuments(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err);
            console.error("Error fetching authored documents:", err);
            setLoading(false);
        }
    };
    useEffect(() => {


        const fetchHistory = async () => {
            try {
                const response = await axios.post(`${API_URL}/clientesAuth/historialCliente`, {
                    userId: userData.id,
                });
                setViewedDocuments(response.data.documentosVistos);
                setDownloadedDocuments(response.data.documentosDescargados);
                setLoading(false);
            } catch (err) {
                setError(err);
                console.error("Error fetching document history:", err);
                setLoading(false);
            }
        };

        fetchAuthorDocuments();
        fetchHistory();
    }, [isUpdated]);
    const handleUnlock = async (id, visibilidad) => {
        try {
            const nuevaVisibilidad = visibilidad === "Publico" ? "Privado" : "Publico";
            console.log(`Desbloqueado documento con ID: ${id}, cambiando visibilidad a: ${nuevaVisibilidad}`);

            await axios.patch(`${API_URL}/documentos/actualizarInfoDoc/${id}`, { visibilidad: nuevaVisibilidad });

            console.log(`Documento actualizado a visibilidad ${nuevaVisibilidad}.`);
            setIsUpdated((prev) => prev + 1); // Actualiza el estado para recargar los documentos
        } catch (error) {
            console.error("Error al actualizar la visibilidad del documento:", error);
        }
    };

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);

    const handleEdit = (document) => {
        if (document) {
            setCurrentDocument(document);
            setEditModalOpen(true);
        }
        fetchAuthorDocuments()
    };

    const handleSave = async (updatedDocument) => {
        try {
            await axios.patch(`${API_URL}/documentos/actualizarInfoDoc/${updatedDocument._id}`, updatedDocument);
            toast.success("Documento actualizado exitosamente");
            setIsUpdated(prev => prev + 1);
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    const confirmDelete = (document) => {
        setDocumentToDelete(document);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/documentos/eliminarDoc/${documentToDelete._id}`);
            toast.success("Documento eliminado exitosamente");
            setIsUpdated(prev => prev + 1);
        } catch (error) {
            console.error(`Error al eliminar el documento con ID: ${documentToDelete._id}`, error);
        } finally {
            setShowDeleteModal(false);
            setDocumentToDelete(null);
        }
    };


    useEffect(() => { console.log(authorDocuments) }, [authorDocuments])
    return (
        <div className="overflow-y-scroll h-screen">
            <Toaster richColors position="top-center" />
            <div className="flex pt-10 pl-20 justify-between w-[95%]">
                <div>
                    <p className="text-[#00162F] font-bold text-3xl">Mis documentos</p>
                    <p className="text-[#627183]">Tu Historial de Documentos Vistos, Descargados y Publicados</p>
                </div>
                <div className="flex items-center justify-center">
                    <p className="text-[#627183] mr-2">{getFormattedDate()}</p>
                </div>
            </div>

            {/* Author Documents Section */}
            <div className="pt-10 pl-20">
                <p className="text-[#383838] font-bold text-2xl">Documentos Subidos</p>
                <div className="flex flex-wrap mt-3 gap-10">
                    {error ? (
                        <p>No tienes documentos publicados</p>
                    ) : authorDocuments.length === 0 ? (
                        <Lottie animationData={loadingAnimation} className="w-48 h-48" loop={true} />
                    ) : (
                        authorDocuments.map((document) => (
                            <DocumentCard
                                key={document._id}
                                id={document._id}
                                title={document.titulo}
                                author={Array.isArray(document.infoAutores) ? document.infoAutores[0].nickName : document.infoAutores?.nickName}
                                nombreCompleto={Array.isArray(document.infoAutores) ? document.infoAutores[0].nombreCompleto : document.infoAutores?.nombreCompleto}
                                thumbnail={document.portadaUrl}
                                onUnlock={() => handleUnlock(document._id, document.visibilidad)}
                                onEdit={() => handleEdit(document)}
                                onDelete={() => confirmDelete(document)}
                                isMine={true}
                                visibilidad={document.visibilidad}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Viewed Documents Section */}
            <div className="pt-10 pl-20">
                <p className="text-[#383838] font-bold text-2xl">Documentos Vistos</p>
                <div className="flex flex-wrap mt-3 gap-10">
                    {loading ? (
                        <Lottie animationData={loadingAnimation} className="w-48 h-48" loop={true} />
                    ) : viewedDocuments.length === 0 ? (
                        <p>No tienes documentos vistos</p>
                    ) : (
                        viewedDocuments.map((document) => (
                            <DocumentCard
                                key={document._id}
                                id={document._id}
                                thumbnail={document.portadaUrl}
                                title={document.titulo}
                                author={document.infoAutores[0].nickName}
                                fecha={document.fechaPublicacion}
                                nombreCompleto={document.infoAutores[0].nombreCompleto}
                                numVisualizaciones={document.numVisualizaciones}
                                numDescargas={document.numDescargas}
                                valoraciones={document.valoraciones}
                                numValoraciones={document.valoraciones.length}
                                onUnlock={() => handleUnlock(document.id, document.visibilidad)}
                                onEdit={() => handleEdit(document)}
                                onDelete={() => confirmDelete(document)}
                                isMine={false}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Downloaded Documents Section */}
            <div className="pt-10 pl-20">
                <p className="text-[#383838] font-bold text-2xl">Documentos Descargados</p>
                <div className="flex flex-wrap mt-3 gap-10">
                    {loading ? (
                        <Lottie animationData={loadingAnimation} className="w-48 h-48" loop={true} />
                    ) : downloadedDocuments.length === 0 ? (
                        <p>No tienes documentos descargados</p>
                    ) : (
                        downloadedDocuments.map((document) => (
                            <DocumentCard
                                key={document._id}
                                id={document._id}
                                thumbnail={document.portadaUrl}
                                title={document.titulo}
                                author={document.infoAutores[0].nickName}
                                fecha={document.fechaPublicacion}
                                nombreCompleto={document.infoAutores[0].nombreCompleto}
                                numVisualizaciones={document.numVisualizaciones}
                                numDescargas={document.numDescargas}
                                valoraciones={document.valoraciones}
                                numValoraciones={document.valoraciones.length}
                                isMine={false}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <EditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    documentInfo={currentDocument}
                    onSave={handleSave}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
                        <p>¿Estás seguro de que deseas eliminar este documento?</p>
                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={handleDelete}
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

            <div className="h-40 w-full" />
        </div>
    );
}
const DocumentCard = ({ id, thumbnail, title, author, numVisualizaciones, numDescargas, valoraciones, numValoraciones, nombreCompleto, fecha, isMine, onUnlock, onEdit, onDelete, visibilidad }) => {
    const encryptedId = encryptId(id);

    const formattedDate = fecha ? new Date(fecha).toLocaleDateString() : "";

    const promedioPuntuacion = numValoraciones > 0
        ? (valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / numValoraciones).toFixed(1)
        : '0';
    return (

        <div className='mt-5' style={{ zIndex: 0 }}>

            <div className='h-96 relative w-56 bg-white rounded-[39px]'>
                <Link to={`http://localhost:5173/document/${encryptedId}`}>
                    <div className='bg-[#F4EEFF] h-40 rounded-t-[39px]' />
                    <div className='bg-[#4B3DE3] absolute h-52 w-32 top-0 right-12 overflow-hidden'>
                        <img src={thumbnail} alt="Thumbnail" className="h-full w-full object-fit" />
                    </div>
                    <div className='mt-14 pl-5'>
                        <p className='text-[#16171B] font-semibold text-lg line-clamp-1'>{title}</p>
                        <p className='text-[#596280] font-semibold'>
                            Autor: <Link to={`/author/${author}/${nombreCompleto}`} className='text-[#4B3DE3] underline'>{nombreCompleto}</Link>
                        </p>
                    </div>
                    {!isMine && <div className='flex ml-5 mt-5 gap-2 text-[#596280]'>
                        <div className='flex items-center justify-center gap-1'>
                            <FaEye className='' />
                            {numVisualizaciones}
                        </div>
                        <div className='flex items-center justify-center gap-1'>
                            <FaDownload className='' />
                            {numDescargas}
                        </div>
                        <div className='flex items-center justify-center gap-1'>
                            <FaRegCommentDots className='' />
                            {numValoraciones}
                        </div>
                        <div className='flex items-center justify-center gap-1'>
                            <FaRegStar className='' />
                            {promedioPuntuacion}
                        </div>
                    </div>}
                    <p className='flex items-end justify-end mr-5 mt-4 text-gray-500'>{formattedDate}</p>
                </Link>
                {isMine && <div className='flex w-full justify-end gap-3 pr-8 items-end pt-5'>
                    {visibilidad == "Privado" ? <FaLock className='text-[#8F929E] text-xl cursor-pointer' onClick={onUnlock} /> : <FaUnlock className='text-[#8F929E] text-xl cursor-pointer' onClick={onUnlock} />}

                    <FaRegEdit className='text-[#8F929E] text-xl cursor-pointer' onClick={onEdit} />
                    <FaRegTrashAlt className='text-[#8F929E] text-xl cursor-pointer' onClick={onDelete} />
                </div>}
            </div>
        </div>

    );
};


const EditModal = ({ isOpen, onClose, documentInfo, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [checkboxChecked, setCheckboxChecked] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const UPLOAD_KEY = import.meta.env.VITE_UPLOAD_KEY;
    const PDF_API_URL = import.meta.env.VITE_PDF_API_URL;
    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
        if (isOpen) {
            setTitle(documentInfo.titulo);
            setDescription(documentInfo.descripcion);
            setSelectedLanguage(documentInfo.idioma);
            setSelectedCategories(documentInfo.categoria.map(cat => ({
                value: cat.categoriaId,
                label: cat.categoriaNombre,
            })));
        }
    }, [isOpen, documentInfo]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/categorias/listarCategorias`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategories.length > 0) {
            const combinedSubcategories = selectedCategories.flatMap(cat => cat.subcategoria || []);
            setSubcategories(combinedSubcategories);
        } else {
            setSubcategories([]);
        }
    }, [selectedCategories]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            const result = await uploadFile(file, {
                publicKey: UPLOAD_KEY,
                store: 'auto',
                metadata: {
                    subsystem: 'js-client',
                    pet: 'cat',
                },
            });
            const fileUrl = `${result.cdnUrl}${result.name}`;
            const id = result.uuid;
            return { fileUrl, id };
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = async (thumbnail) => {
        if (!thumbnail) return;
        setIsUploading(true);
        try {
            const result = await uploadFile(thumbnail, {
                publicKey: UPLOAD_KEY,
                store: 'auto',
                metadata: {
                    subsystem: 'js-client',
                    pet: 'cat',
                },
            });
            const imageUrl = `${result.cdnUrl}${result.name}`;
            return { imageUrl };
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true)
        let fileUrl = documentInfo.URL;
        let portadaUrl = documentInfo.portadaUrl;

        if (file) {
            try {
                const uploadResult = await handleFileUpload();
                fileUrl = uploadResult.fileUrl;

                const thumbnail = await convertPdfToPng(fileUrl, PDF_API_URL);
                const imageUploadResult = await handleImageUpload(thumbnail);
                portadaUrl = imageUploadResult.imageUrl;
            } catch (error) {
                console.error('Error uploading file or generating thumbnail:', error);
                return;
            }
        }

        const updatedDocument = {
            _id: documentInfo._id,
            titulo: title,
            descripcion: description,
            idioma: selectedLanguage,
            URL: fileUrl,
            portadaUrl,
            categoria: selectedCategories.map(cat => {
                let subcategory = '';
                if (selectedSubcategory) {
                    subcategory = selectedSubcategory.find(sub => sub.value === cat.value);
                }
                return {
                    categoriaId: cat.value,
                    categoriaNombre: cat.label,
                    subCategoriaNombre: subcategory ? subcategory.label : "",
                };
            }),
        };
        setIsLoading(false)
        onSave(updatedDocument);
        onClose();

    };

    const handleCategoryChange = (categories) => {
        setSelectedCategories(categories);
        setSelectedSubcategory(null);

        const combinedSubcategories = categories.flatMap(cat => cat.subcategoria || []);
        setSubcategories(combinedSubcategories);
    };

    return (
        isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-xl font-semibold mb-4">Editar Documento</h2>
                    {categories.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="category">
                                Categoría
                            </label>
                            <Select
                                id="category"
                                options={categories.map(category => ({
                                    value: category._id,
                                    label: category.nombre,
                                    subcategoria: category.subcategoria,
                                }))}
                                placeholder="Seleccionar categoria"
                                value={selectedCategories}
                                isMulti
                                onChange={handleCategoryChange}
                                className="mt-1"
                                isSearchable
                            />
                        </div>
                    )}
                    {subcategories.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="subcategory">
                                Subcategoría
                            </label>
                            <Select
                                id="subcategory"
                                options={subcategories.map(sub => ({
                                    value: sub.categoriaId,
                                    label: sub.nombre,
                                }))}
                                value={selectedSubcategory}
                                onChange={setSelectedSubcategory}
                                className="mt-1"
                                isMulti
                                placeholder="Seleccionar subcategorias"
                                isDisabled={selectedCategories.length === 0}
                                isSearchable
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Título</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Idioma</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 w-full"
                        >
                            <option value="" disabled>Seleccionar un idioma</option>
                            {languagesArray.map((language, index) => (
                                <option key={index} value={language}>
                                    {language}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">PDF</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="border border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                    <div className="flex justify-end gap-5">
                        <button onClick={onClose} className="bg-gray-300 text-gray-700 rounded-md px-4 py-2">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="bg-[#4B3DE3] text-white rounded-md px-4 py-2">
                            {isLoading ? <Loading /> : 'Actualizar'}
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};
function getFormattedDate() {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const today = new Date();
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();

    return `${day} de ${month} del ${year}`;
}


export default MyDocuments