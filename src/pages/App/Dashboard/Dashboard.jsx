import { useState, useEffect } from 'react'
import { MdCalendarToday } from "react-icons/md";
import { FaDownload, FaEye, FaStar, } from 'react-icons/fa6';
import { FaRegEdit, FaRegTrashAlt, FaRegStar, FaRegCommentDots, FaRegSadCry } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { decryptUserData } from '../../../encryption';
import { encryptId } from '../../../encryption';
import axios from 'axios';
function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [downloadedDocuments, setDownloadedDocuments] = useState([]);
    const [popularDocuments, setPopularDocuments] = useState([]);
    const [recentDocuments, setRecentDocuments] = useState([]);

    const encryptedUserData = localStorage.getItem("sam12mdqow");
    const userData = decryptUserData(encryptedUserData);

    useEffect(() => {
        const fetchDownloadedDocuments = async () => {
            try {
                const response = await axios.get("http://localhost:3000/documentos/documentosMayorCantidadDescargas/true");
                setDownloadedDocuments(response.data.data);
            } catch (error) {
                console.error("Error fetching downloaded documents:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchPopularDocuments = async () => {
            try {
                const response = await axios.get("http://localhost:3000/documentos/documentosMayorCantVisualizaciones/true");
                setPopularDocuments(response.data.data);
            } catch (error) {
                console.error("Error fetching popular documents:", error);
            }
        };

        const fetchRecentDocuments = async () => {
            try {
                const response = await axios.get("http://localhost:3000/documentos/ordenFechaPub/true");
                setRecentDocuments(response.data.data);
            } catch (error) {
                console.error("Error fetching recent documents:", error);
            }
        };

        fetchDownloadedDocuments();
        fetchPopularDocuments();
        fetchRecentDocuments();
    }, []); // Empty dependency array to run only once on mount

    return (
        <div className="overflow-y-scroll h-screen">
            <div className="flex pt-10 pl-20 justify-between w-[95%]">
                <div>
                    <p className="text-[#00162F] font-bold text-3xl">Bienvenido {userData.nombreCompleto}</p>
                    <p className="text-[#627183]">Descubre las mejores lecturas sobre tecnología</p>
                </div>
                <div className="flex items-center justify-center">
                    <p className="text-[#627183] mr-2">{getFormattedDate()}</p>
                    <div className="bg-white flex rounded-full w-10 h-10 justify-center items-center">
                        <MdCalendarToday className="text-[#627183]" />
                    </div>
                </div>
            </div>

            {/* Popular Documents Section */}
            <div className="pt-10 pl-20">
                <p className="text-[#383838] font-bold text-2xl">Documentos más Populares</p>

                {popularDocuments.length === 0 ? (
                    <p className="text-[#627183] mt-3">Cargando...</p>
                ) : (
                    <div className="flex flex-wrap mt-3 gap-10">
                        {popularDocuments.slice(0, 4).map((document) => (
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
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Most Downloaded Documents Section */}
            <div className="pt-20 pl-20">
                <p className="text-[#383838] font-bold text-2xl">Documentos más Descargados</p>

                {downloadedDocuments.length === 0 ? (
                    <p className="text-[#627183] mt-3">Cargando...</p>
                ) : (
                    <div className="flex flex-wrap mt-3 gap-10">
                        {downloadedDocuments.slice(0, 4).map((document) => (
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
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Documents Section */}
            <div className="pt-20 pl-20">
                <p className="text-[#383838] font-bold text-2xl">Documentos Recientes</p>

                {recentDocuments.length === 0 ? (
                    <p className="text-[#627183] mt-3">Cargando...</p>
                ) : (
                    <div className="flex flex-wrap mt-3 gap-10">
                        {recentDocuments.slice(0, 4).map((document) => (
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
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="h-40 w-full" />
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

export default Dashboard