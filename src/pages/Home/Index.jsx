import { useState, useEffect, useMemo, useRef } from 'react'
import logo from "../../assets/images/logo.png"
import { FiSearch } from "react-icons/fi";
import { IoLogoJavascript, IoAnalyticsSharp } from "react-icons/io5";
import { FaDatabase } from "react-icons/fa";
import { FaCode, FaPython } from "react-icons/fa6";
import { LuBrain } from "react-icons/lu";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { createAutocomplete } from '@algolia/autocomplete-core';
import { decryptUserData } from '../../encryption';
function Index() {
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
            <Hero />
            <Categories />
            <Stats />
            <br />
            <br />
            <br />

        </div>
    )
}

function Navbar({ userData }) {
    return <div className='w-full pt-10 px-20 flex justify-between'>
        <img src={logo} className='w-32 h-auto' />
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
}
function Hero(props) {
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

                        return filteredItems
                    } catch (error) {
                        console.error('Error fetching documents:', error);
                        return [];
                    }
                }
                return [];
            }
        }],
        ...props
    }), [props]);

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
        <div className='flex flex-col pt-10 px-20 h-1/2 items-center mt-32 w-full'>
            <div className='flex items-center justify-center'>
                <p className='text-5xl mr-3'>Tu Portal de</p>
                <div className='relative border-2 flex justify-center px-2 py-4 border-[#4B3DE3] w-96'>
                    <p className='text-5xl text-[#4B3DE3]'>Documentación</p>
                    <span className="absolute top-[-8px] left-[-8px] border-2 border-[#4B3DE3] w-4 h-4 bg-[#4B3DE3]"></span>
                    <span className="absolute top-[-8px] right-[-8px] border-2 border-[#4B3DE3] w-4 h-4 bg-[#4B3DE3]"></span>
                    <span className="absolute bottom-[-8px] left-[-8px] border-2 border-[#4B3DE3] w-4 h-4 bg-[#4B3DE3]"></span>
                    <span className="absolute bottom-[-8px] right-[-8px] border-2 border-[#4B3DE3] w-4 h-4 bg-[#4B3DE3]"></span>
                </div>
                <p className='text-5xl ml-3'>Tecnológica</p>
            </div>

            <p className='mt-8 text-[#A3A3A3] text-xl w-1/3 text-center'>
                Explora documentos sobre el mundo tecnológico y mantente a la vanguardia de la innovación.
            </p>

            <div className="relative flex items-center border mt-8 border-gray-300 rounded-lg px-4 py-4 w-full max-w-lg bg-white">
                <form ref={formRef} className="relative w-full" {...formProps}>
                    <input
                        ref={inputRef}
                        className="w-full outline-none h-5 bg-white text-black placeholder-gray-500 px-2"

                        onChange={(e) => { setValueInput(e.target.value) }}
                        {...inputProps}
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
                                                <ul {...autocomplete.getListProps()}>
                                                    {
                                                        items.map(item => <AutocompleteItem key={item.id} {...item} />)
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
                {inputRef && <Link to={`/search?title=${inputRef.current?.value}`}>
                    <FiSearch className='text-[#4B3DE3] text-xl ml-2' />
                </Link>}

            </div>
        </div>
    );
}

function Categories() {
    return <div className='w-full  pb-20 flex flex-col items-center justify-center bg-[#4B3DE3] h-[70%] mt-32'>
        <p className='text-white text-4xl mt-20 font-semibold'>Explora categorías populares</p>
        <div className='flex flex-wrap gap-y-10 gap-5 w-[60%] justify-center items-center mt-10'>
            <div className='px-3 flex items-center justify-center py-4 rounded-[9px]' style={{ background: "rgba(0, 0, 0, 0.56)" }}>
                <FaCode className='text-3xl text-white mr-3' />
                <p className='text-white text-2xl font-semibold'>Desarrollo Web</p>
            </div>
            <div className='px-3 flex items-center justify-center py-4 rounded-[9px]' style={{ background: "rgba(0, 0, 0, 0.56)" }}>
                <FaDatabase className='text-3xl text-white mr-3' />
                <p className='text-white text-2xl font-semibold'>Bases de datos</p>
            </div>
            <div className='px-3 flex items-center justify-center py-4 rounded-[9px]' style={{ background: "rgba(0, 0, 0, 0.56)" }}>
                <IoAnalyticsSharp className='text-3xl text-white mr-3' />
                <p className='text-white text-2xl font-semibold'>Analítica de datos</p>
            </div>
            <div className='px-3 flex items-center justify-center py-4 rounded-[9px]' style={{ background: "rgba(0, 0, 0, 0.56)" }}>
                <LuBrain className='text-3xl text-white mr-3' />
                <p className='text-white text-2xl font-semibold'>Inteligencia artificial</p>
            </div>
            <div className='w-52 flex items-center justify-center py-4 rounded-[9px]' style={{ background: "rgba(0, 0, 0, 0.56)" }}>
                <FaPython className='text-3xl text-white mr-3' />
                <p className='text-white text-2xl font-semibold'>Python</p>
            </div>
            <div className='w-52 flex items-center justify-center py-4 rounded-[9px]' style={{ background: "rgba(0, 0, 0, 0.56)" }}>
                <IoLogoJavascript className='text-3xl text-white mr-3' />
                <p className='text-white text-2xl font-semibold'>Javascript</p>
            </div>
        </div>
    </div>
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

function Stats() {
    const [documentCount, setDocumentCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const docResponse = await axios.get(`${API_URL}/documentos/mostrarCantDocs`);
                const userResponse = await axios.get(`${API_URL}/clientes/mostrarCantUsuarios`);

                setDocumentCount(docResponse.data[0].Suma);
                setUserCount(userResponse.data[0].Suma);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl py-10 px-10 xl:py-16 xl:px-20 bg-gray-50 flex items-center justify-between flex-col gap-16 lg:flex-row">
                    <div className="w-full lg:w-96">
                        <h2 className="font-manrope text-4xl font-bold text-gray-900 mb-4 text-center lg:text-left">
                            Nuestras estadísticas
                        </h2>
                        <p className="text-sm text-gray-500 leading-6 text-center lg:text-left">
                            La mejor plataforma para compartir documentos tecnológicos
                        </p>
                    </div>
                    <div className="w-full lg:w-4/5">
                        <div className="flex flex-col flex-1 gap-20 lg:gap-20 lg:flex-row lg:justify-center">
                            <div className="block">
                                <div className="font-manrope font-bold text-4xl text-indigo-600 mb-3 text-center lg:text-left">
                                    {documentCount}
                                </div>
                                <span className="text-gray-900 text-center block lg:text-left">
                                    Documentos publicados
                                </span>
                            </div>
                            <div className="block">
                                <div className="font-manrope font-bold text-4xl text-indigo-600 mb-3 text-center lg:text-left">
                                    {userCount}
                                </div>
                                <span className="text-gray-900 text-center block lg:text-left">
                                    Usuarios activos
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}



export default Index