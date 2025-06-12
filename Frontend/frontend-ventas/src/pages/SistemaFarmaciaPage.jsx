import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Package, BarChart3, Search, Filter } from 'lucide-react';
import '../componentes/SistemaFarmacia.css';
import api from '../api';

const SistemaFarmacia = () => {
  // Estados para datos del backend
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de la aplicación
  const [vistaActual, setVistaActual] = useState('categorias');
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({ ID: '', Nombre: '' });
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');

  // Cargar datos del backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [categoriasRes, productosRes] = await Promise.all([
          api.get('/categorias'),
          api.get('/productos')
        ]);
        
        setCategorias(categoriasRes.data);
        setProductos(productosRes.data);
        setError(null);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Funciones para gestión de categorías
  const abrirModal = (categoria = null) => {
    if (categoria) {
      setCategoriaSeleccionada(categoria);
      setFormData({ ID: categoria.ID, Nombre: categoria.Nombre });
    } else {
      setCategoriaSeleccionada(null);
      setFormData({ ID: '', Nombre: '' });
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setCategoriaSeleccionada(null);
    setFormData({ ID: '', Nombre: '' });
  };

  const guardarCategoria = async () => {
    if (!formData.Nombre.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    try {
      if (categoriaSeleccionada) {
        // Editar categoría existente
        await api.put(`/categorias/${categoriaSeleccionada.ID}`, { Nombre: formData.Nombre.trim() });
        alert('Categoría actualizada exitosamente');
      } else {
        // Crear nueva categoría
        await api.post('/categorias', { Nombre: formData.Nombre.trim() });
        alert('Categoría creada exitosamente');
      }
      
      // Recargar categorías
      const categoriasRes = await api.get('/categorias');
      setCategorias(categoriasRes.data);
      
      cerrarModal();
    } catch (err) {
      console.error('Error guardando categoría:', err);
      alert('Error al guardar categoría: ' + (err.response?.data?.message || err.message));
    }
  };

  const eliminarCategoria = async (categoriaId) => {
    // Verificar si tiene productos asociados
    const productosEnCategoria = productos.filter(p => p.CategoriaID === categoriaId);
    if (productosEnCategoria.length > 0) {
      alert('No se puede eliminar la categoría porque tiene productos asociados');
      return;
    }
    
    if (!window.confirm('¿Está seguro de eliminar esta categoría?')) {
      return;
    }

    try {
      await api.delete(`/categorias/${categoriaId}`);
      alert('Categoría eliminada exitosamente');
      
      // Recargar categorías
      const categoriasRes = await api.get('/categorias');
      setCategorias(categoriasRes.data);
    } catch (err) {
      console.error('Error eliminando categoría:', err);
      alert('Error al eliminar categoría: ' + (err.response?.data?.message || err.message));
    }
  };

  // Funciones para reporte de stock
  const obtenerProductosPorCategoria = (categoriaId) => {
    return productos.filter(p => p.CategoriaID === categoriaId);
  };

  const calcularEstadisticasCategoria = (categoriaId) => {
    const productosCategoria = obtenerProductosPorCategoria(categoriaId);
    const totalProductos = productosCategoria.length;
    const stockTotal = productosCategoria.reduce((sum, p) => sum + (p.Stock || 0), 0);
    const valorTotal = productosCategoria.reduce((sum, p) => sum + ((p.Stock || 0) * (p.Precio_Venta || 0)), 0);
    const sinStock = productosCategoria.filter(p => (p.Stock || 0) === 0).length;
    const stockBajo = productosCategoria.filter(p => (p.Stock || 0) > 0 && (p.Stock || 0) <= 5).length;

    return {
      totalProductos,
      stockTotal,
      valorTotal,
      sinStock,
      stockBajo,
      conStock: totalProductos - sinStock
    };
  };

  const categoriasFiltradas = categorias.filter(cat =>
    cat.Nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const obtenerReporteStock = () => {
    return categorias.map(categoria => {
      const stats = calcularEstadisticasCategoria(categoria.ID);
      return {
        ...categoria,
        ...stats
      };
    }).filter(cat => {
      if (filtroStock === 'sinStock') return cat.sinStock > 0;
      if (filtroStock === 'stockBajo') return cat.stockBajo > 0;
      if (filtroStock === 'conStock') return cat.conStock > 0;
      return true;
    });
  };

  if (loading) return (
    <div className="sistema-farmacia">
      <div className="sistema-farmacia__loading">
        <Package className="sistema-farmacia__loading-icon" />
        <p>Cargando datos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="sistema-farmacia">
      <div className="sistema-farmacia__error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()} className="sistema-farmacia__retry-button">
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="sistema-farmacia">
      {/* Header */}
      <div className="sistema-farmacia__header">
        <div className="sistema-farmacia__header-content">
          <div className="sistema-farmacia__title-section">
            <div className="sistema-farmacia__title-wrapper">
              <Package className="sistema-farmacia__icon" />
              <h1 className="sistema-farmacia__title">Sistema Farmacia</h1>
            </div>
            <nav className="sistema-farmacia__nav">
              <button
                onClick={() => setVistaActual('categorias')}
                className={`sistema-farmacia__nav-button ${
                  vistaActual === 'categorias' ? 'sistema-farmacia__nav-button--active' : ''
                }`}
              >
                Gestionar Categorías
              </button>
              <button
                onClick={() => setVistaActual('reporte')}
                className={`sistema-farmacia__nav-button ${
                  vistaActual === 'reporte' ? 'sistema-farmacia__nav-button--active' : ''
                }`}
              >
                Reporte de Stock
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="sistema-farmacia__container">
        {/* Vista de Gestión de Categorías */}
        {vistaActual === 'categorias' && (
          <div className="sistema-farmacia__content">
            <div className="sistema-farmacia__section-header">
              <div className="sistema-farmacia__section-info">
                <h2 className="sistema-farmacia__section-title">Gestión de Categorías</h2>
                <p className="sistema-farmacia__section-description">Administra las categorías de productos de la farmacia</p>
              </div>
              <button
                onClick={() => abrirModal()}
                className="sistema-farmacia__primary-button"
              >
                <Plus className="sistema-farmacia__button-icon" />
                Nueva Categoría
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="sistema-farmacia__search-section">
              <div className="sistema-farmacia__search-wrapper">
                <Search className="sistema-farmacia__search-icon" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="sistema-farmacia__search-input"
                />
              </div>
            </div>

            {/* Tabla de categorías */}
            <div className="sistema-farmacia__table-container">
              <table className="sistema-farmacia__table">
                <thead className="sistema-farmacia__table-header">
                  <tr>
                    <th className="sistema-farmacia__table-th">ID</th>
                    <th className="sistema-farmacia__table-th">Nombre de Categoría</th>
                    <th className="sistema-farmacia__table-th">Productos</th>
                    <th className="sistema-farmacia__table-th">Acciones</th>
                  </tr>
                </thead>
                <tbody className="sistema-farmacia__table-body">
                  {categoriasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="sistema-farmacia__table-td--empty">
                        {busqueda ? 'No se encontraron categorías que coincidan con la búsqueda' : 'No hay categorías registradas'}
                      </td>
                    </tr>
                  ) : (
                    categoriasFiltradas.map((categoria) => {
                      const productosCount = obtenerProductosPorCategoria(categoria.ID).length;
                      return (
                        <tr key={categoria.ID} className="sistema-farmacia__table-row">
                          <td className="sistema-farmacia__table-td sistema-farmacia__table-td--id">
                            {categoria.ID}
                          </td>
                          <td className="sistema-farmacia__table-td sistema-farmacia__table-td--name">
                            {categoria.Nombre}
                          </td>
                          <td className="sistema-farmacia__table-td sistema-farmacia__table-td--count">
                            {productosCount} productos
                          </td>
                          <td className="sistema-farmacia__table-td">
                            <div className="sistema-farmacia__actions">
                              <button
                                onClick={() => abrirModal(categoria)}
                                className="sistema-farmacia__action-button sistema-farmacia__action-button--edit"
                                title="Editar categoría"
                              >
                                <Edit2 className="sistema-farmacia__action-icon" />
                              </button>
                              <button
                                onClick={() => eliminarCategoria(categoria.ID)}
                                className="sistema-farmacia__action-button sistema-farmacia__action-button--delete"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="sistema-farmacia__action-icon" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vista de Reporte de Stock */}
        {vistaActual === 'reporte' && (
          <div className="sistema-farmacia__content">
            <div className="sistema-farmacia__section-header">
              <div className="sistema-farmacia__section-info">
                <h2 className="sistema-farmacia__section-title">Reporte de Stock por Categoría</h2>
                <p className="sistema-farmacia__section-description">Visualiza el estado del inventario por categorías</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="sistema-farmacia__filters">
              <div className="sistema-farmacia__filter-wrapper">
                <Filter className="sistema-farmacia__filter-icon" />
                <select
                  value={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.value)}
                  className="sistema-farmacia__filter-select"
                >
                  <option value="todos">Todas las categorías</option>
                  <option value="sinStock">Sin stock</option>
                  <option value="stockBajo">Stock bajo</option>
                  <option value="conStock">Con stock</option>
                </select>
              </div>
            </div>

            {/* Cards de resumen */}
            <div className="sistema-farmacia__stats-grid">
              {(() => {
                const totalCategorias = categorias.length;
                const totalProductos = productos.length;
                const totalStock = productos.reduce((sum, p) => sum + (p.Stock || 0), 0);
                const valorTotal = productos.reduce((sum, p) => sum + ((p.Stock || 0) * (p.Precio_Venta || 0)), 0);
                
                return (
                  <>
                    <div className="sistema-farmacia__stat-card">
                      <div className="sistema-farmacia__stat-content">
                        <div className="sistema-farmacia__stat-icon-wrapper sistema-farmacia__stat-icon-wrapper--gray">
                          <BarChart3 className="sistema-farmacia__stat-icon" />
                        </div>
                        <div className="sistema-farmacia__stat-info">
                          <dt className="sistema-farmacia__stat-label">Total Categorías</dt>
                          <dd className="sistema-farmacia__stat-value">{totalCategorias}</dd>
                        </div>
                      </div>
                    </div>
                    
                    <div className="sistema-farmacia__stat-card">
                      <div className="sistema-farmacia__stat-content">
                        <div className="sistema-farmacia__stat-icon-wrapper sistema-farmacia__stat-icon-wrapper--blue">
                          <Package className="sistema-farmacia__stat-icon" />
                        </div>
                        <div className="sistema-farmacia__stat-info">
                          <dt className="sistema-farmacia__stat-label">Total Productos</dt>
                          <dd className="sistema-farmacia__stat-value">{totalProductos}</dd>
                        </div>
                      </div>
                    </div>
                    
                    <div className="sistema-farmacia__stat-card">
                      <div className="sistema-farmacia__stat-content">
                        <div className="sistema-farmacia__stat-icon-wrapper sistema-farmacia__stat-icon-wrapper--green">
                          <Package className="sistema-farmacia__stat-icon" />
                        </div>
                        <div className="sistema-farmacia__stat-info">
                          <dt className="sistema-farmacia__stat-label">Stock Total</dt>
                          <dd className="sistema-farmacia__stat-value">{totalStock} unidades</dd>
                        </div>
                      </div>
                    </div>
                    
                    <div className="sistema-farmacia__stat-card">
                      <div className="sistema-farmacia__stat-content">
                        <div className="sistema-farmacia__stat-icon-wrapper sistema-farmacia__stat-icon-wrapper--yellow">
                          <BarChart3 className="sistema-farmacia__stat-icon" />
                        </div>
                        <div className="sistema-farmacia__stat-info">
                          <dt className="sistema-farmacia__stat-label">Valor Total</dt>
                          <dd className="sistema-farmacia__stat-value">Bs. {valorTotal.toFixed(2)}</dd>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Tabla de reporte */}
            <div className="sistema-farmacia__table-container">
              <table className="sistema-farmacia__table">
                <thead className="sistema-farmacia__table-header">
                  <tr>
                    <th className="sistema-farmacia__table-th">Categoría</th>
                    <th className="sistema-farmacia__table-th">Total Productos</th>
                    <th className="sistema-farmacia__table-th">Stock Total</th>
                    <th className="sistema-farmacia__table-th">Valor Total</th>
                    <th className="sistema-farmacia__table-th">Sin Stock</th>
                    <th className="sistema-farmacia__table-th">Stock Bajo</th>
                    <th className="sistema-farmacia__table-th">Estado</th>
                  </tr>
                </thead>
                <tbody className="sistema-farmacia__table-body">
                  {obtenerReporteStock().length === 0 ? (
                    <tr>
                      <td colSpan="7" className="sistema-farmacia__table-td--empty">
                        No hay datos para mostrar
                      </td>
                    </tr>
                  ) : (
                    obtenerReporteStock().map((categoria) => (
                      <tr key={categoria.ID} className="sistema-farmacia__table-row">
                        <td className="sistema-farmacia__table-td sistema-farmacia__table-td--name">
                          {categoria.Nombre}
                        </td>
                        <td className="sistema-farmacia__table-td">
                          {categoria.totalProductos}
                        </td>
                        <td className="sistema-farmacia__table-td">
                          {categoria.stockTotal}
                        </td>
                        <td className="sistema-farmacia__table-td">
                          Bs. {categoria.valorTotal.toFixed(2)}
                        </td>
                        <td className="sistema-farmacia__table-td">
                          <span className={`sistema-farmacia__badge ${
                            categoria.sinStock > 0 
                              ? 'sistema-farmacia__badge--danger' 
                              : 'sistema-farmacia__badge--success'
                          }`}>
                            {categoria.sinStock}
                          </span>
                        </td>
                        <td className="sistema-farmacia__table-td">
                          <span className={`sistema-farmacia__badge ${
                            categoria.stockBajo > 0 
                              ? 'sistema-farmacia__badge--warning' 
                              : 'sistema-farmacia__badge--success'
                          }`}>
                            {categoria.stockBajo}
                          </span>
                        </td>
                        <td className="sistema-farmacia__table-td">
                          <span className={`sistema-farmacia__badge ${
                            categoria.sinStock > 0 
                              ? 'sistema-farmacia__badge--danger' 
                              : categoria.stockBajo > 0 
                              ? 'sistema-farmacia__badge--warning'
                              : 'sistema-farmacia__badge--success'
                          }`}>
                            {categoria.sinStock > 0 ? 'Crítico' : categoria.stockBajo > 0 ? 'Alerta' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar categoría */}
      {modalVisible && (
        <div className="sistema-farmacia__modal-overlay">
          <div className="sistema-farmacia__modal">
            <div className="sistema-farmacia__modal-header">
              <h3 className="sistema-farmacia__modal-title">
                {categoriaSeleccionada ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
            </div>
            <div className="sistema-farmacia__modal-body">
              <div className="sistema-farmacia__form-group">
                <label className="sistema-farmacia__form-label">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  value={formData.Nombre}
                  onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                  className="sistema-farmacia__form-input"
                  placeholder="Ingrese el nombre de la categoría"
                />
              </div>
            </div>
            <div className="sistema-farmacia__modal-footer">
              <button
                onClick={cerrarModal}
                className="sistema-farmacia__secondary-button"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCategoria}
                className="sistema-farmacia__primary-button"
              >
                {categoriaSeleccionada ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemaFarmacia;
