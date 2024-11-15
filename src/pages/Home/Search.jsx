import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FiSearch } from 'react-icons/fi';
import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { encryptId } from '../../encryption';
import languagesArray from '../../data/languages';
import { useLocation } from 'react-router-dom';
import { decryptUserData } from '../../encryption';
import { FaDownload, FaEye, FaStar, } from 'react-icons/fa6';
import { FaRegEdit, FaRegTrashAlt, FaRegStar, FaRegCommentDots, FaRegSadCry } from "react-icons/fa";
export default function Search() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const [userData, setUserData] = useState(null)
    // Inicializar title con valor vacío
    const [title, setTitle] = useState(queryParams.get('title') || '');

    const [filters, setFilters] = useState({
        categorias: [],
        subcategoria: null,
        autor: '',
        idioma: null,
        titulo: title,
    });
    useEffect(() => {
        const encryptedUserData = localStorage.getItem("sam12mdqow");
        if (encryptedUserData) {
            const userDataLocal = decryptUserData(encryptedUserData);
            setUserData(userDataLocal)
        } else {
            setUserData(null)
        }
    }, [])

    // useEffect para actualizar los filtros cuando cambia title
    useEffect(() => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            titulo: title,
        }));
    }, [title]); // Ejecutar cada vez que title cambia


    useEffect(() => {
        const titleParam = queryParams.get('title');
        setTitle(titleParam || '');
    }, [location.search]); // Ejecutar cada vez que location.search cambia

    return (
        <div className='h-screen overflow-y-scroll w-full bg-[#FBFBFB]'>
            <Navbar title={title} setTitle={setTitle} userData={userData} />
            <Filters setFilters={setFilters} />
            <Results filters={filters} title={title} />
        </div>
    );
}
function Navbar({ title, setTitle, userData }) {
    return (
        <div className='w-full pt-10 px-20 flex items-center justify-between'>
            <Link to='/'>
                <img src={logo} className='w-32 h-auto' />
            </Link>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full max-w-lg bg-white">
                <input
                    type="text"
                    placeholder="Buscar documentos"
                    className="w-full outline-none bg-white text-black placeholder-gray-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <FiSearch className='text-[#4B3DE3] text-xl' />
            </div>
            {!userData ? <div>
                <Link to={'/login'} className='text-[#404040] shadow-md rounded-[12px] bg-white px-4 py-2'>Iniciar sesión</Link>
                <Link to={'/signup'} className='ml-5 text-white bg-[#4B3DE3] px-4 py-2 rounded-[12px]'>Crear Cuenta</Link>
            </div> : <Link to={'/dashboard'} className="flex items-center">
                <img

                    src={`https://ui-avatars.com/api/?name=${userData.nickName}&size=40&background=4891E0&color=fff `}
                    alt="Avatar"
                    className="w-10 h-10 mr-2 rounded-full border border-gray-300"
                />
                <div className='flex flex-col items-start'>
                    <span className="ml-2 text-black font-semibold">{userData.nombreCompleto}</span>
                    <span className="ml-2 text-gray-500 text-sm">@{userData.nickName}</span>
                </div>
            </Link>}
        </div>
    );
}
function Filters({ setFilters }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [authorInput, setAuthorInput] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [selectedSorting, setSelectedSorting] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    const languages = languagesArray.map(language => ({
        value: language,
        label: language
    }));

    const sortingOptions = [
        { value: "mas_vistos", label: "Más vistos" },
        { value: "menos_vistos", label: "Menos vistos" },
        { value: "mejor_valorados", label: "Mejor valorados" },
        { value: "menos_valorados", label: "Menos valorados" },
        { value: "menos_recientes", label: "Menos recientes" },
        { value: "mas_recientes", label: "Más recientes" },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/categorias/listarCategorias`);
                const formattedCategories = response.data.map(category => ({
                    value: category.nombre,
                    label: category.nombre,
                    subcategorias: category.subcategoria || []
                }));
                setCategories(formattedCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [API_URL]);

    const handleCategoryChange = (selectedOption) => {
        setSelectedCategory(selectedOption);
        setSelectedSubcategory(null);
        const combinedSubcategories = selectedOption ? selectedOption.subcategorias : [];
        setSubcategories(combinedSubcategories);
    };

    const clearAllFilters = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setAuthorInput('');
        setSelectedLanguage(null);
        setSelectedSorting(null);
        setFilters({
            categorias: null,
            subcategoria: null,
            autor: null,
            idioma: null,
            orden: null
        });
    };

    const applyFilters = () => {
        setFilters({
            categorias: selectedCategory ? selectedCategory.value : null,
            subcategoria: selectedSubcategory ? selectedSubcategory.value : null,
            autor: authorInput,
            idioma: selectedLanguage ? selectedLanguage.value : null,
            orden: selectedSorting ? selectedSorting.value : null
        });
    };

    return (
        <div className="w-full pt-10 px-5 md:px-10 lg:px-20 flex flex-wrap items-center gap-3">
            <div className="w-full md:w-40">
                <Select
                    options={categories}
                    placeholder="Categoría"
                    className="basic-single"
                    classNamePrefix="select"
                    onChange={handleCategoryChange}
                    value={selectedCategory}
                />
            </div>
            {subcategories.length > 0 && (
                <div className="w-full md:w-40">
                    <Select
                        id="subcategory"
                        options={subcategories.map(sub => ({
                            value: sub.categoriaId,
                            label: sub.nombre,
                        }))}
                        value={selectedSubcategory}
                        onChange={setSelectedSubcategory}
                        className="mt-1"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            menu: base => ({
                                ...base,
                                maxHeight: 200,
                                overflowY: 'auto',
                            }),
                        }}
                        placeholder="Subcategoría"
                        isDisabled={!selectedCategory}
                        isSearchable
                    />
                </div>
            )}
            <div className="w-full md:w-32">
                <input
                    type="text"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    placeholder="Autor"
                    className="rounded px-2 py-2 border border-[#CCCCCC] w-full"
                />
            </div>

            <div className="w-full md:w-40">
                <Select
                    options={languages}
                    placeholder="Idioma"
                    className="basic-single"
                    classNamePrefix="select"
                    onChange={setSelectedLanguage}
                    value={selectedLanguage}
                />
            </div>

            <div className="w-full md:w-40">
                <Select
                    options={sortingOptions}
                    placeholder="Ordenar por"
                    className="basic-single"
                    classNamePrefix="select"
                    onChange={setSelectedSorting}
                    value={selectedSorting}
                />
            </div>
            <p className='text-[#4B3DE3] font-medium cursor-pointer' onClick={applyFilters}>Aplicar Filtros</p>
            <p className='text-[#8A91A0] font-medium cursor-pointer' onClick={clearAllFilters}>Borrar todo</p>
        </div>
    );
}
function Results({ filters, title }) {
    const [resultsDocuments, setResultsDocuments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const API_URL = import.meta.env.VITE_API_URL;

    const sortDocuments = (documents, orden) => {
        switch (orden) {
            case 'mas_vistos':
                return documents.sort((a, b) => b.numVisualizaciones - a.numVisualizaciones);
            case 'menos_vistos':
                return documents.sort((a, b) => a.numVisualizaciones - b.numVisualizaciones);
            case 'mejor_valorados':
                return documents.sort((a, b) =>
                    (b.valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / b.valoraciones.length || 0) -
                    (a.valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / a.valoraciones.length || 0)
                );
            case 'menos_valorados':
                return documents.sort((a, b) =>
                    (a.valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / a.valoraciones.length || 0) -
                    (b.valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / b.valoraciones.length || 0)
                );
            case 'mas_recientes':
                return documents.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
            case 'menos_recientes':
                return documents.sort((a, b) => new Date(a.fechaPublicacion) - new Date(b.fechaPublicacion));
            default:
                return documents;
        }
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const { categorias, subcategoria, idioma, autor, orden } = filters;
                const response = await axios.get(`${API_URL}/documentos/buscar`, {
                    params: {
                        page: currentPage,
                        limit: 10,
                        categoriaNombre: categorias,
                        subCategoriaNombre: subcategoria,
                        idioma,
                        nombreAutor: autor,
                        titulo: title
                    },
                });

                let sortedDocuments = response.data.data;
                if (orden) {
                    sortedDocuments = sortDocuments(sortedDocuments, orden);
                }

                setResultsDocuments(sortedDocuments);
                setTotalPages(response.data.totalPages || 1);
            } catch (error) {
                console.error('Error fetching documents:', error);
                setResultsDocuments([]);
            }
        };

        fetchDocuments();
    }, [filters, API_URL, currentPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPageNumbers = () => {
        const pageButtons = [];
        for (let i = 1; i <= totalPages; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded ${i === currentPage ? 'bg-[#4B3DE3] text-white' : 'bg-gray-200 text-black'}`}
                >
                    {i}
                </button>
            );
        }
        return pageButtons;
    };

    return (
        <div className="w-full overflow-auto flex-col pt-10 px-20 flex items-start justify-start gap-5">
            {resultsDocuments && resultsDocuments.length > 0 ? (
                <>
                    <p className='text-[#596280]'>
                        Página {currentPage} de {totalPages} resultados para "{filters.titulo || ''}"
                    </p>
                    <div className="flex flex-wrap mt-10 gap-10">
                        {resultsDocuments.map((document) => {
                            const author = Array.isArray(document.infoAutores)
                                ? document.infoAutores[0]?.nickName
                                : document.infoAutores.nickName;
                            const nombreCompleto = Array.isArray(document.infoAutores)
                                ? document.infoAutores[0]?.nombreCompleto
                                : document.infoAutores.nombreCompleto;
                            return (
                                <DocumentCard
                                    key={document._id}
                                    id={document._id}
                                    thumbnail={document.portadaUrl}
                                    title={document.titulo}
                                    author={author}
                                    fecha={document.fechaPublicacion}
                                    nombreCompleto={nombreCompleto}
                                    numVisualizaciones={document.numVisualizaciones}
                                    numDescargas={document.numDescargas}
                                    valoraciones={document.valoraciones}
                                    numValoraciones={document.valoraciones.length}
                                />
                            );
                        })}
                    </div>
                    <div className="flex mb-20 w-full items-center justify-center mt-5">
                        {renderPageNumbers()}
                    </div>
                </>
            ) : (
                <p className='text-[#596280]'>No se encontraron documentos.</p>
            )}
        </div>
    );
}

const DocumentCard = ({ id, thumbnail, title, author, numVisualizaciones, numDescargas, valoraciones, numValoraciones, nombreCompleto, fecha }) => {

    const encryptedId = encryptId(id);
    const formattedDate = new Date(fecha).toISOString().split("T")[0];

    const promedioPuntuacion = numValoraciones > 0
        ? (valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / numValoraciones).toFixed(1)
        : '0';
    return (
        <Link to={`http://localhost:5173/document/${encryptedId}`}>
            <div className='mt-5'>
                <div className='h-[22rem] relative w-56 bg-white rounded-[39px]'>
                    <div className='bg-[#F4EEFF] h-40 rounded-t-[39px]' />
                    <div className='bg-[#4B3DE3] absolute h-52 w-32 top-0 right-12 overflow-hidden'>
                        <img src={thumbnail} alt="Thumbnail" className="h-full w-full object-fit" />
                    </div>
                    <div className='mt-14 pl-5'>
                        <p title={title} className='text-[#16171B] font-semibold text-lg line-clamp-1'>{title}</p>
                        <p className='text-[#596280] font-semibold'>
                            Autor: <Link to={`/author/${author}/${nombreCompleto}`} className='text-[#4B3DE3] underline'>{nombreCompleto}</Link>
                        </p>
                    </div>
                    <div className='flex ml-5 mt-5 gap-2 text-[#596280]'>
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
                    </div>
                    <p className='flex items-end justify-end mr-5 mt-4 text-gray-500'>{formattedDate}</p>
                </div>
            </div>
        </Link>
    );
};
