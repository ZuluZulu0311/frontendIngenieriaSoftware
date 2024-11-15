import { useState, useEffect, useMemo, useRef } from 'react'
import logo from "../../assets/images/logo.png"
import { FiSearch } from "react-icons/fi";
import { FaRegStar, FaRegCommentDots, FaUnlock, FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading.json'
import { Link } from 'react-router-dom';
import { encryptId } from '../../encryption';
import { createAutocomplete } from '@algolia/autocomplete-core';
import { decryptUserData } from '../../encryption';
function Author() {
    const { nickName, nombreCompleto } = useParams();
    console.log(nombreCompleto)
    const [userData, setUserData] = useState(null)
    useEffect(() => {
        const encryptedUserData = localStorage.getItem("sam12mdqow");
        if (encryptedUserData) {
            const userDataLocal = decryptUserData(encryptedUserData);
            setUserData(userDataLocal)
        } else {
            setUserData(null)
        }
    }, [])

    return (
        <div className='h-screen overflow-y-scroll w-full  bg-[#FBFBFB]'>
            <Navbar userData={userData} />
            <AuthorProfile nombreCompleto={nombreCompleto} nickName={nickName} />
            <Docs nombreCompleto={nombreCompleto} nickName={nickName} />
            <br />
            <br />
        </div>
    )
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
        placeholder: "Buscar documentos" // Placeholder agregado
    });

    return (
        <div className='w-full pt-10 px-20 flex items-center justify-between'>
            <Link to='/'>
                <img src={logo} className='w-32 h-auto' alt="Logo" />
            </Link>

            <div className="relative flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full max-w-lg bg-white">
                <form ref={formRef} className="relative w-full" {...formProps}>
                    <input
                        ref={inputRef}
                        className="w-full outline-none bg-white text-black placeholder-gray-500"
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
function AuthorProfile({ nombreCompleto, nickName }) {
    return <div className='w-full  pb-20 flex flex-col items-start pl-72 pt-20 justify-center bg-[#4B3DE3] h-72 mt-20'>

        <div className='flex items-center'>
            <img
                src={`https://ui-avatars.com/api/?name=${nickName}&size=40&background=4891E0&color=fff `}
                alt="Avatar"
                className="w-32 h-32 mr-2 rounded-full border-4 border-white "
            />
            <div className='ml-10'>
                <p className='text-white text-4xl font-bold'>{nombreCompleto}</p>
                <p className='text-gray-400 text-2xl font-bold'>@{nickName}</p>
            </div>
        </div>

    </div>
}

function Docs({ nombreCompleto, nickName }) {
    const [authorDocuments, setAuthorDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Función para obtener documentos
        const fetchDocuments = async () => {
            try {
                const response = await axios.get(`${API_URL}/documentos/verOtrosDocumentos/${nickName}`);
                setAuthorDocuments(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchDocuments();

    }, [nickName]); // Ejecutar la consulta cuando nickName cambie

    if (loading) {
        return <Lottie animationData={loadingAnimation} className='w-48' loop={true} />
    }

    if (error) {
        return <div>Error: {error.message}</div>; // Manejo de errores
    }

    return (
        <div className="w-full flex-col pt-10 px-72 flex items-start justify-start gap-5">
            <p className='text-[#00162F] font-semibold text-3xl'>Documentos publicados</p>
            {authorDocuments && <div className="flex flex-wrap mt-3 gap-10">
                {authorDocuments.map((document) => (
                    <DocumentCard
                        key={document._id}
                        id={document._id}
                        title={document.titulo}
                        thumbnail={document.portadaUrl}
                        nombreCompleto={nombreCompleto}
                        author={document.infoAutores.nickName}
                        rating={0}
                        comments={0}
                    />
                ))}
            </div>}

        </div>
    );
}

const DocumentCard = ({ id, title, thumbnail, nombreCompleto, author, rating, comments }) => {
    const encryptedId = encryptId(id);
    return (
        <Link to={`http://localhost:5173/document/${encryptedId}`}>
            <div className='mt-5'>
                <div className='h-[21rem] relative w-56 bg-white rounded-[39px]'>
                    <div className='bg-[#F4EEFF] h-40 rounded-t-[39px]' />
                    <div className='bg-[#4B3DE3] absolute h-52 w-32 top-0 right-12 overflow-hidden'>
                        <img src={thumbnail} alt="Thumbnail" className="h-full w-full object-fit" />
                    </div>
                    <div className='mt-14 pl-5'>
                        <p className='text-[#16171B] font-semibold text-lg'>{title}</p>
                        <p className='text-[#596280] font-semibold'>
                            Autor: <Link to={`/author/${author}/${nombreCompleto}`} className='text-[#4B3DE3] underline'>{nombreCompleto}</Link>
                        </p>
                    </div>
                    <div className='flex pl-5 justify-between pr-10'>
                        <div className='flex items-center mt-5'>
                            <FaRegStar className='text-[#596280]' />
                            <p className='text-[#596280] ml-1'>{rating}</p>
                        </div>
                        <div className='flex items-center mt-5'>
                            <FaRegCommentDots className='text-[#596280]' />
                            <p className='text-[#596280] ml-1'>{comments}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
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
export default Author