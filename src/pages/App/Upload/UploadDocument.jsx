import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MdTextFields, MdFormatAlignCenter, MdContentCopy } from 'react-icons/md';
import { uploadFile } from '@uploadcare/upload-client'

import axios from 'axios';
import { Toaster, toast } from 'sonner'
import Select from 'react-select';
import Loading from '../Reusable/Loading';
import { motion } from 'framer-motion';

import Lottie from 'lottie-react';
import loadingAnimation from "../../../assets/loading.json";
import { encryptId, decryptUserData } from '../../../encryption';
import { Link } from 'react-router-dom';
import PdfToPngConverter from './convertPdfToPng';
import convertPdfToPng from './convertPdfToPng';
import languagesArray from '../../../data/languages';
import { createAutocomplete } from '@algolia/autocomplete-core';
function UploadDocument({ file, setFile }) {
    const [page, setPage] = useState(0);
    const [pdfUrl, setPdfUrl] = useState('');
    const [linkDoc, setLinkDoc] = useState('')
    useEffect(() => {
        if (file) {
            // Crea una URL de objeto para el archivo PDF
            const url = URL.createObjectURL(file);
            setPdfUrl(url);

            // Limpia la URL del objeto cuando el componente se desmonte o el archivo cambie
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);



    return (
        <div className="flex gap-8">
            <div className="w-[277px] h-[421px] bg-gray-400 ml-20 mt-5">
                {/* Muestra el PDF usando un iframe */}
                {pdfUrl && (
                    <iframe
                        src={`${pdfUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full"

                        title="PDF Preview"
                    />
                )}
            </div>
            {page === 0 ? (
                <FormInfoDoc setPage={setPage} file={file} setFile={setFile} setLinkDoc={setLinkDoc} />
            ) : (
                <LinkShare linkDoc={linkDoc} />
            )}
        </div>
    );
}

function FormInfoDoc({ setPage, file, setFile, setLinkDoc }) {
    const [checkboxChecked, setCheckboxChecked] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const API_URL = import.meta.env.VITE_API_URL;
    const UPLOAD_KEY = import.meta.env.VITE_UPLOAD_KEY
    const encryptedUserData = localStorage.getItem("sam12mdqow")
    const userData = decryptUserData(encryptedUserData);
    const [authors, setAuthors] = useState([{
        autorId: userData.id,
        nombreCompleto: userData.nombreCompleto,
        nickName: userData.nickName,
        tipo: 'AutorPublica',
        registrado: true,
    }])

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');


    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);


    const [selectedLanguage, setSelectedLanguage] = useState("");

    const handleChange = (event) => {
        setSelectedLanguage(event.target.value);
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
            console.log(result);
            const fileUrl = `${result.cdnUrl}${result.name}`;
            const id = result.uuid;
            return { fileUrl, id };
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            throw error;
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
            console.log(result);
            const imageUrl = `${result.cdnUrl}${result.name}`;

            return { imageUrl };
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        } finally {
            setIsUploading(false); // Asegúrate de desactivar el estado de carga al final
        }
    };


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/categorias/listarCategorias`);
                console.log('Categorías:', response.data);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Manejar el cambio de categoría
    const handleCategoryChange = (categories) => {
        setSelectedCategories(categories);
        setSelectedSubcategory(null);

        const combinedSubcategories = categories.flatMap(cat => cat.subcategoria || []);
        setSubcategories(combinedSubcategories);
    };

    const handleCheckboxChange = () => {
        setCheckboxChecked((prev) => !prev);
    };


    const handleSubmit = async () => {
        try {
            const result = await handleFileUpload();
            const PDF_API_URL = import.meta.env.VITE_PDF_API_URL;
            const thumbnail = await convertPdfToPng(result.fileUrl, PDF_API_URL)
            const { imageUrl } = await handleImageUpload(thumbnail)




            const data = {
                titulo: title,
                descripcion: description,
                URL: result.fileUrl,
                idioma: selectedLanguage,
                categoria: selectedCategories.map(cat => {
                    let subcategory = ''
                    if (selectedSubcategory) {
                        subcategory = selectedSubcategory.find(
                            sub => sub.value === cat.value
                        );
                    }

                    return {
                        categoriaId: cat.value,
                        categoriaNombre: cat.label,
                        subCategoriaNombre: subcategory ? subcategory.label : "",
                    };
                }),
                visibilidad: checkboxChecked ? 'Privado' : 'Publico',
                fechaPublicacion: new Date().toISOString().split('T')[0],
                infoAutores: [
                    ...authors
                ],
                numDescargas: 0,
                numVisualizaciones: 0,
                fechaUltimaModificacion: new Date().toISOString().split('T')[0],

                valoraciones: [],
                portadaUrl: imageUrl
            };

            const response = await axios.post(`${API_URL}/documentos/crearDocumento`, data);
            toast.success('Documento publicado exitosamente', {
                duration: 3000,
            });


            const idDoc = response.data._id;


            const encryptedId = encryptId(idDoc);


            console.log('ID Doc encriptado:', encryptedId);

            setLinkDoc(`http://localhost:5173/document/${encryptedId}`)
            setPage(1)

        } catch (error) {
            toast.error('Error al subir el documento', {
                duration: 3000,
            });
            console.error('Error al enviar los datos:', error);
        } finally {
            setIsUploading(false);
        }
    };


    useEffect(() => {
        console.log(authors)
    }, [authors])


    const WEB_URL = import.meta.env.VITE_WEB_URL;

    const openModal = () => {
        setIsModalOpen(true);
    };


    const closeModal = () => {
        setIsModalOpen(false);
    };
    const isFormValid = title && description && selectedCategories && selectedLanguage ? true : false
    return (
        <div className='w-[50%] mt-5 ml-8 '>
            <p className='text-2xl text-[#00162F] font-semibold mb-5'>Información del documento</p>
            <Toaster richColors position="top-center" />

            <div className="mb-3">
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="title">
                    Título
                </label>
                <div className="flex items-center bg-white border border-gray-300 rounded-lg mt-1 px-3 py-2">
                    <MdTextFields className="text-gray-500" />
                    <input
                        id="title"
                        type="text"
                        placeholder="Artículo de javascript"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 ml-3 h-10 outline-none text-gray-700"
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="description">
                    Descripción
                </label>
                <div className="flex items-center bg-white border border-gray-300 rounded-lg mt-1 px-3 py-2">
                    <MdFormatAlignCenter className="text-gray-500" />
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ resize: 'none' }}
                        rows={3}
                        className="flex-1 ml-3 outline-none text-gray-700"
                    />
                </div>
            </div>

            {categories.length > 0 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="category">
                        Categoría
                    </label>
                    <Select
                        id="category"
                        options={categories.map(category => ({
                            value: category._id, // Asegúrate de usar la clave correcta
                            label: category.nombre,
                            subcategoria: category.subcategoria, // Presumiendo que tus categorías tienen subcategorías
                        }))}
                        placeholder="Seleccionar categoria"
                        value={selectedCategories}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999, overflowY: 'hidden' }),
                            menu: base => ({ ...base, maxHeight: 200, overflowY: 'auto' }), // Limitar altura del menú
                        }}
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
                            value: sub.categoriaId, // Asegúrate de usar la clave correcta
                            label: sub.nombre,
                        }))}
                        value={selectedSubcategory}
                        onChange={setSelectedSubcategory}
                        className="mt-1"
                        isMulti
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            menu: base => ({
                                ...base,
                                maxHeight: 200,
                                overflowY: 'auto', // Permite el desplazamiento vertical si el contenido es más grande que el menú

                            }),
                        }}
                        placeholder="Seleccionar subcategorias"
                        isDisabled={selectedCategories.length === 0}
                        isSearchable
                    />
                </div>
            )}
            <div className="mb-3">
                <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="description">
                    Idioma
                </label>
                <select
                    className=" flex items-center bg-white border border-gray-300 rounded-lg mt-1 px-3 py-2 h-10 outline-none text-gray-700 w-full"

                    value={selectedLanguage}
                    onChange={handleChange}
                >
                    <option value="" disabled>Seleccionar un idioma</option>
                    {languagesArray.map((language, index) => (
                        <option key={index} value={language}>
                            {language}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4 mt-5 flex items-center">
                <input
                    type="checkbox"
                    id="checkboxDefault"
                    checked={checkboxChecked}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 border-[#D6D6D6] accent-[#4B3DE3] rounded focus:ring-[#4B3DE3] checked:bg-[#4B3DE3] checked:border-[#4B3DE3]"
                />
                <label
                    className="ml-2 block text-sm font-semibold text-[#57617A]"
                    htmlFor="checkboxDefault"
                >
                    Marcar este documento como privado
                </label>
            </div>

            <div className='flex items-center justify-between w-[100%] mt-5'>
                <p onClick={() => openModal()} className='cursor-pointer text-sm font-semibold text-[#4B3DE3]'>Agregar otros autores</p>
                <div className='flex items-center gap-5'>
                    <p onClick={() => {
                        window.location.href = `${WEB_URL}/dashboard/documents`
                    }} className='text-[#E33D3D] cursor-pointer font-semibold'>Eliminar</p>
                    <button
                        className={`${isFormValid ? 'bg-[#4B3DE3]' : 'bg-gray-400 cursor-not-allowed'}  px-6 py-3 font-semibold text-white rounded-[15px]`}
                        onClick={handleSubmit}
                        disabled={isUploading || !isFormValid}

                    >
                        {isUploading ? <Loading /> : 'Publicar'}
                    </button>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} setAuthors={setAuthors} authors={authors} />


        </div>
    );
}

function LinkShare({ linkDoc }) {
    return (
        linkDoc !== '' ? (
            <div className='w-[50%] mt-10 ml-8'>
                <div className="mb-4 flex items-center">
                    <div className='w-[80%]'>
                        <label className="block text-sm font-medium text-[#6F6F6F]" htmlFor="title">
                            Link
                        </label>
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg mt-1 px-3 py-2">
                            <MdContentCopy className="text-gray-500" />
                            <input
                                id="title"
                                type="text"
                                value={linkDoc}
                                className="flex-1 ml-3 h-10 outline-none text-black font-semibold"
                                readOnly
                            />
                        </div>
                    </div>
                    <Link to={linkDoc} className='bg-[#4B3DE3] px-12 ml-8 py-4 mt-5 font-semibold text-white rounded-[15px]'>
                        Ver
                    </Link>
                </div>
                <p className='text-[#57617A] font-semibold'>
                    Ver todos <Link to='/dashboard/documents' className='font-semibold text-[#4B3DE3] underline cursor-pointer'>Mis documentos</Link>
                </p>
            </div>
        ) : (
            <div className="flex items-center justify-center h-screen">
                <Lottie animationData={loadingAnimation} className='w-48' loop={true} />
            </div>
        )
    );
}
const Modal = ({ isOpen, onClose, setAuthors, authors, props }) => {
    if (!isOpen) return null;
    const API_URL = import.meta.env.VITE_API_URL;
    const [isAdded, setIsAdded] = useState(false);
    const inputRef = useRef(null);
    const panelRef = useRef(null);
    const formRef = useRef(null);
    const [autocompleteState, setAutocompleteState] = useState({ isOpen: false, collections: [] });

    const autocomplete = useMemo(() => createAutocomplete({
        onStateChange: ({ state }) => {
            setAutocompleteState(state);
        },
        getSources: () => [{
            sourceId: 'authors',
            getItems: async ({ query }) => {
                if (query) {
                    try {
                        const res = await fetch(`${API_URL}/clientes/listarUsuarios`);
                        const data = await res.json();
                        const filteredItems = data.filter(author =>
                            (author.nickName.toLowerCase().includes(query.toLowerCase()) ||
                                author.nombreCompleto.toLowerCase().includes(query.toLowerCase())) &&
                            !authors.some(selected => selected.nickName === author.nickName)
                        ).map(author => ({
                            nickName: author.nickName,
                            nombreCompleto: author.nombreCompleto,
                        }));
                        return filteredItems;
                    } catch (error) {
                        console.error('Error fetching authors:', error);
                        return [];
                    }
                }
                return [];
            }
        }],
        ...props
    }), [props, authors]);

    const inputProps = autocomplete.getInputProps({
        inputElement: inputRef.current,
    });
    const formProps = autocomplete.getFormProps({
        inputElement: inputRef.current
    });

    const addManualAuthor = () => {
        if (inputRef.current.value.trim() !== "") {
            const newAuthor = {
                nombreCompleto: inputRef.current.value.trim(),
                nickName: inputRef.current.value.trim(),
                tipo: "AutorExtra",
                registrado: false, // Indica que el autor no está registrado
            };
            setAuthors(prevAuthors => [...prevAuthors, newAuthor]);
            inputRef.current.value = ""; // Limpiar el campo de entrada
            setIsAdded(true); // Habilita el botón de agregar
        }
    };

    const removeAuthor = (nickName) => {
        setAuthors(prevAuthors => prevAuthors.filter(author => author.nickName !== nickName));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
            >
                <motion.div
                    className="bg-white p-4 rounded-lg w-[30rem] z-50"
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                >
                    <h2 className="text-xl font-semibold mb-4">Agregar Autores</h2>
                    <p className='mb-2 text-gray-500'>Busca y selecciona los autores por su nickName o nombre completo, o agrégalo manualmente</p>
                    <form ref={formRef} className="relative w-full" {...formProps}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Buscar o ingresar nombre del autor"
                            {...inputProps}
                            className="border border-gray-300 rounded p-2 mb-4 w-full"
                        />
                        {
                            autocompleteState.isOpen && (
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
                                                    <ul className='overflow-auto' {...autocomplete.getListProps()}>
                                                        {
                                                            items.map(item => (
                                                                <AutocompleteItem
                                                                    key={item.nickName}
                                                                    {...item}
                                                                    setAuthors={setAuthors}
                                                                    inputRef={inputRef}
                                                                    setAutocompleteState={setAutocompleteState}
                                                                    setIsAdded={setIsAdded}
                                                                />
                                                            ))
                                                        }
                                                    </ul>
                                                )}
                                            </section>
                                        );
                                    })}
                                </div>
                            )
                        }
                    </form>
                    <button
                        onClick={addManualAuthor}
                        className="w-full mb-4 py-2 bg-[#4B3DE3] text-white rounded-md transition"
                    >
                        Agregar Autor No Registrado
                    </button>
                    {authors.length > 1 ? (
                        <div>
                            <h3 className="mb-2 text-gray-500">Autores seleccionados:</h3>
                            <ul className='space-y-2'>
                                {authors.slice(1).map((author, index) => (
                                    <li key={index} className="flex justify-between items-center text-gray-700">
                                        <div className='flex gap-1 items-center'>
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${author.nickName}&size=40&background=4891E0&color=fff `}
                                                alt="Avatar"
                                                className="w-10 h-10 mr-2 rounded-full border border-gray-300"
                                            />
                                            <div className='flex flex-col'>
                                                <span>{author.nombreCompleto}</span>
                                                <span className='text-sm'>@{author.nickName}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeAuthor(author.nickName)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onClose}
                            className={`mt-6 w-full font-semibold py-2 text-sm ${!isAdded ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4B3DE3] hover:bg-[#483AD8]'} text-white rounded-md transition`}
                            disabled={!isAdded}
                        >
                            Agregar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
const AutocompleteItem = ({ id, nickName, nombreCompleto, setAuthors, inputRef, setAutocompleteState, setIsAdded }) => {
    const addAuthor = () => {
        let newAuthor = {
            nombreCompleto: nombreCompleto,
            nickName: nickName,
            tipo: "AutorExtra",
            registrado: true,
        };
        setAuthors(prevAuthors => [...prevAuthors, newAuthor]);

        // Limpiar el input y cerrar el autocomplete
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setAutocompleteState(prevState => ({ ...prevState, isOpen: false }));
        setIsAdded(true)
    };

    return (
        <li className='cursor-pointer' onClick={addAuthor}>
            <div>
                <a className='flex items-center mb-2 hover:bg-blue-300  gap-4 p-4'>
                    <img

                        src={`https://ui-avatars.com/api/?name=${nickName}&size=40&background=4891E0&color=fff `}
                        alt="Avatar"
                        className="w-10 h-10 mr-2 rounded-full border border-gray-300"
                    />
                    <div>
                        <p>{nombreCompleto}</p>
                        <h3 className='text-sm font-semibold'>@{nickName}</h3>
                    </div>
                </a>
            </div>
        </li>
    );
};
export default UploadDocument;
