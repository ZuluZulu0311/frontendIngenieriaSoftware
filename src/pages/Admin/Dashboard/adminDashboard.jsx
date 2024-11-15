import React, { useState, useEffect } from 'react';
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { MdSearch } from "react-icons/md";
import Select from 'react-select';
import axios from 'axios';
import { Toaster, toast } from 'sonner';

function CategoryDashboard() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const categoriesPerPage = 5;

    useEffect(() => {
        listarCategorias();
    }, []);

    const listarCategorias = async () => {
        try {
            const response = await axios.get("http://localhost:3000/categorias/listarCategorias");
            setCategories(response.data);
            setFilteredCategories(response.data);
        } catch (error) {
            console.error("Error al listar las categorías:", error);
        }
    };

    const buscarCategoriaNombre = (nombre) => {
        setSearchTerm(nombre);
        setCurrentPage(1);

        if (nombre === "") {
            setFilteredCategories(categories);
        } else {
            const filtered = categories.filter(cat =>
                cat.nombre.toLowerCase().includes(nombre.toLowerCase())
            );
            setFilteredCategories(filtered);
        }
    };

    const handleAddCategory = async (newCategory) => {
        try {
            const response = await axios.post("http://localhost:3000/categorias/crearCategoria", newCategory);
            setCategories([...categories, response.data]);
            setFilteredCategories([...categories, response.data]);
            toast.success("Categoría creada correctamente.");
        } catch (error) {
            console.error("Error al crear la categoría:", error);
            toast.error("Hubo un error al crear la categoría.");
        }
        setIsCreateModalOpen(false);
    };

    const handleUpdateCategory = async (updatedCategory) => {
        try {
            const response = await axios.patch(
                `http://localhost:3000/categorias/actualizarCategoria/${updatedCategory._id}`,
                updatedCategory
            );

            const categoriaActualizada = response.data.categoriaActualizada;

            if (!categoriaActualizada || !Array.isArray(categoriaActualizada.subcategoria)) {
                throw new Error("Formato de respuesta incorrecto: subcategorias no está definido");
            }

            setCategories(categories.map(cat =>
                cat._id === updatedCategory._id ? categoriaActualizada : cat
            ));
            setFilteredCategories(categories.map(cat =>
                cat._id === updatedCategory._id ? categoriaActualizada : cat
            ));
            toast.success("Categoría actualizada correctamente.");
        } catch (error) {
            console.error("Error al actualizar la categoría:", error);
            toast.error("Hubo un error al actualizar la categoría.");
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/categorias/eliminarCategoria/${categoryToDelete}`);
            toast.success("Categoría eliminada correctamente.");
            listarCategorias();
        } catch (error) {
            console.error("Error al eliminar la categoría:", error);
            toast.error("Hubo un error al eliminar la categoría.");
        }
        setIsConfirmDeleteOpen(false);
    };

    const eliminarSubcategoria = async (categoriaId, subcategoriaId) => {
        try {
            await axios.delete(
                `http://localhost:3000/categorias/eliminarSubcategoriasDeCategoria/${categoriaId}/${subcategoriaId}`
            );
            toast.success("Subcategoría eliminada correctamente.");
            listarCategorias();
        } catch (error) {
            console.error("Error al eliminar la subcategoría:", error);
            toast.error("Hubo un error al eliminar la subcategoría.");
        }
    };

    const handleDelete = (id) => {
        setCategoryToDelete(id);
        setIsConfirmDeleteOpen(true);
    };

    const handleEdit = async (category) => {
        try {
            const response = await axios.get("http://localhost:3000/categorias/listarCategorias");
            const options = response.data
                .filter(cat => cat._id !== category._id)
                .map(cat => ({ value: cat._id, label: cat.nombre }));

            setSubcategoryOptions(options);
            setCurrentCategory(category);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error("Error al obtener las subcategorías de la categoría:", error);
            toast.error("Error al cargar subcategorías.");
        }
    };

    const handleCreate = async () => {
        try {
            const response = await axios.get("http://localhost:3000/categorias/listarCategorias");
            const options = response.data.map(cat => ({ value: cat._id, label: cat.nombre }));
            setSubcategoryOptions(options);
            setCurrentCategory({ nombre: "", subcategoria: [] });
            setIsCreateModalOpen(true);
        } catch (error) {
            console.error("Error al obtener subcategorías:", error);
            toast.error("Error al cargar subcategorías.");
        }
    };

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-10">
            <Toaster position="top-right" />
            <h1 className="text-[#00162F] font-bold text-3xl mb-4">Gestión de Categorías</h1>
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    placeholder="Buscar categoría..."
                    className="border border-gray-300 rounded-l-full py-2 px-4 w-80 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => buscarCategoriaNombre(e.target.value)}
                />
                <button className="bg-[#4B3DE3] p-2 rounded-r-full">
                    <MdSearch className="text-white" />
                </button>
                <button onClick={handleCreate} className="ml-4 bg-[#4B3DE3] text-white py-2 px-4 rounded-full">Agregar Categoría</button>
            </div>
            <table className="min-w-full bg-white rounded-lg shadow-lg">
                <thead>
                    <tr>
                        <th className="py-3 px-6 text-left text-[#383838] font-semibold">Categoría</th>
                        <th className="py-3 px-6 text-left text-[#383838] font-semibold">Subcategorías</th>
                        <th className="py-3 px-6 text-center text-[#383838] font-semibold">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCategories.length > 0 ? (
                        currentCategories.map((category) => (
                            category && (
                                <tr key={category._id} className="border-b">
                                    <td className="py-4 px-6 text-[#16171B] font-semibold">{category.nombre}</td>
                                    <td className="py-4 px-6 text-[#596280]">
                                        {(category.subcategoria || []).map(sub => (
                                            <span
                                                key={sub.categoriaId}
                                                className="inline-flex items-center px-2 py-1 mr-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-full relative group"
                                            >
                                                {sub.nombre}
                                                <button
                                                    onClick={() => eliminarSubcategoria(category._id, sub.categoriaId)}
                                                    className="text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                >
                                                    <FaRegTrashAlt />
                                                </button>
                                            </span>
                                        ))}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button onClick={() => handleEdit(category)} className="text-[#8F929E] text-xl mx-2">
                                            <FaRegEdit />
                                        </button>
                                        <button onClick={() => handleDelete(category._id)} className="text-[#8F929E] text-xl mx-2">
                                            <FaRegTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            )
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="py-4 px-6 text-center text-[#627183]">
                                No se encontraron categorías
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(filteredCategories.length / categoriesPerPage) }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 mx-1 rounded ${index + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {isConfirmDeleteOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-2xl font-semibold mb-4">¿Estás seguro?</h2>
                        <p className="mb-4">¿Seguro que quieres eliminar esta categoría?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsConfirmDeleteOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
                            <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {(isEditModalOpen || isCreateModalOpen) && (
                <CategoryModal
                    title={isEditModalOpen ? "Editar Categoría" : "Crear Nueva Categoría"}
                    category={currentCategory}
                    subcategoryOptions={subcategoryOptions}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setIsCreateModalOpen(false);
                    }}
                    onSave={isEditModalOpen ? handleUpdateCategory : handleAddCategory}
                />
            )}
        </div>
    );
}

// Componente CategoryModal
function CategoryModal({ title, category = {}, subcategoryOptions = [], onClose, onSave }) {
    const [nombre, setNombre] = useState(category?.nombre || "");
    const [subcategorias, setSubcategorias] = useState(
        (category?.subcategoria || []).map(sub => ({ value: sub.categoriaId, label: sub.nombre }))
    );

    useEffect(() => {
        setNombre(category.nombre || "");
        setSubcategorias(
            (category.subcategoria || []).map(sub => ({ value: sub.categoriaId, label: sub.nombre }))
        );
    }, [category]);

    const handleDeleteSubcategory = (subCategoriaId) => {
        setSubcategorias(subcategorias.filter(sub => sub.value !== subCategoriaId));

        axios.delete(`http://localhost:3000/categorias/eliminarSubcategoriasDeCategoria/${category._id}/${subCategoriaId}`)
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => {
                console.error("Error al eliminar la subcategoría:", error);
            });
    };

    const handleSave = () => {
        const formattedCategory = {
            _id: category._id,
            nombre,
            subcategoria: subcategorias.map(sub => ({ categoriaId: sub.value }))
        };
        onSave(formattedCategory);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-semibold mb-4">{title}</h2>
                <input
                    type="text"
                    className="w-full p-2 mb-4 border rounded"
                    placeholder="Nombre de la categoría"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                {subcategorias.map((sub, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <Select
                            options={subcategoryOptions}
                            value={sub}
                            onChange={(option) => {
                                const updatedSubcategorias = [...subcategorias];
                                updatedSubcategorias[index] = option;
                                setSubcategorias(updatedSubcategorias);
                            }}
                            className="w-full"
                            placeholder="Selecciona subcategoría"
                        />
                        <button
                            onClick={() => handleDeleteSubcategory(sub.value)}
                            className="text-red-500 text-xl ml-2"
                        >
                            <FaRegTrashAlt />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => setSubcategorias([...subcategorias, { value: '', label: '' }])}
                    className="text-blue-500 mb-4"
                >
                    Agregar Subcategoría
                </button>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
                </div>
            </div>
        </div>
    );
}

export default CategoryDashboard;
