import React, { useState, useEffect } from 'react';
import Button from '../componentes/Button';
import '../componentes/GestionarProductos.css';
import { useNavigate } from 'react-router-dom';
import { getProductos, deleteProducto, updateProducto } from '../api';

const GestionarProductos = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productoEdit, setProductoEdit] = useState(null);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosAPI = await getProductos();
        setProductos(productosAPI.map(p => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio_venta,
          stock: p.stock,
          categoria: p.categoria,
          marca: p.marca,
          receta: p.receta,
          activo: p.activo ?? true
        })));
      } catch (err) {
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
  };

  const handleEditar = (prod) => {
    setProductoEdit(prod);
    setModal(true);
  };

  const handleEliminar = async (prod) => {
    if (prod.stock > 0) {
      alert('No se puede eliminar un producto con stock. Puede inactivarlo.');
      return;
    }
    if (window.confirm(`¿Seguro que deseas eliminar el producto "${prod.nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteProducto(prod.id);
        setProductos(productos.filter(p => p.id !== prod.id));
        alert('Producto eliminado correctamente.');
      } catch (err) {
        alert('Error al eliminar el producto.');
      }
    }
  };

  const handleGuardar = () => {
    setProductos(productos.map(p => p.id === productoEdit.id ? productoEdit : p));
    setModal(false);
  };

  const handleInactivar = async (prod) => {
    if (window.confirm(`¿Seguro que deseas inactivar el producto "${prod.nombre}"?`)) {
      try {
        await updateProducto(prod.id, { ...prod, activo: false });
        setProductos(productos.map(p => p.id === prod.id ? { ...p, activo: false } : p));
        alert('Producto inactivado correctamente.');
      } catch (err) {
        alert('Error al inactivar el producto.');
      }
    }
  };

  const productosFiltrados = productos.filter(p =>
    (p.nombre || '').toLowerCase().includes((busqueda || '').toLowerCase()) ||
    (p.descripcion || '').toLowerCase().includes((busqueda || '').toLowerCase())
  );

  return (
    <div className="gestionar-productos-container">
      <h2 className="gestionar-productos-title">Gestionar Productos</h2>
      <div className="gestionar-productos-bar">
        <input
          className="gestionar-productos-input"
          type="text"
          placeholder="Buscar producto por nombre o descripción..."
          value={busqueda}
          onChange={handleBuscar}
        />
        <Button className="gestionar-productos-btn" onClick={() => navigate('/inventario/registrar-producto')}>Nuevo Producto / Actualizar</Button>
      </div>
      <div className="gestionar-productos-table-wrapper">
        <table className="gestionar-productos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Receta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="gp-empty">No se encontraron productos</td>
              </tr>
            ) : (
              productosFiltrados.map((producto, idx) => (
                <tr key={producto.id || idx} className={!producto.activo ? 'gp-inactivo' : ''}>
                  <td>{producto.id}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion}</td>
                  <td>Bs {producto.precio}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.marca}</td>
                  <td>{producto.receta ? 'Sí' : 'No'}</td>
                  <td>{producto.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button className="gestionar-productos-btn eliminar" onClick={() => handleEliminar(producto)} disabled={producto.stock > 0}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal de edición/creación */}
      {modal && (
        <div className="gp-modal-bg">
          <div className="gp-modal">
            <h3>{modal === 'nuevo' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
            {/* Aquí iría el formulario de edición/creación real */}
            <Button className="gestionar-productos-btn cancelar" onClick={() => setModal(false)}>Cancelar</Button>
            {modal !== 'nuevo' && <Button className="gestionar-productos-btn guardar" onClick={handleGuardar}>Guardar</Button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarProductos;
