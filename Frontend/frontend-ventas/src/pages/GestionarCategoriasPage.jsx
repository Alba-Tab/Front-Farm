import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Pill, BarChart3, Search, Filter, AlertTriangle, Calendar, ShieldAlert, Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import '../componentes/GestionarCategorias.css';
import api from '../api';

const FarmaciaStockManager = () => {
  // Estados para datos del backend
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [reporteStock, setReporteStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de la interfaz
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [filtroVencimiento, setFiltroVencimiento] = useState('todos');

  const [formData, setFormData] = useState({
    Nombre: ''
  });

  // Cargar datos del backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [categoriasRes, productosRes, reporteRes] = await Promise.all([
          api.get('/categorias'),
          api.get('/productos'),
          api.get('/categorias/reporte-stock')
        ]);
        
        setCategorias(categoriasRes.data);
        setProductos(productosRes.data);
        setReporteStock(reporteRes.data);
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

  // Funciones para modal
  const abrirModal = (tipo, categoria = null) => {
    setModalType(tipo);
    setSelectedCategoria(categoria);
    if (categoria) {
      setFormData({
        Nombre: categoria.Nombre
      });
    } else {
      setFormData({ Nombre: '' });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedCategoria(null);
    setFormData({ Nombre: '' });
  };

  const guardarCategoria = async () => {
    if (!formData.Nombre.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    try {
      if (modalType === 'create') {
        await api.post('/categorias', formData);
        alert('Categoría creada exitosamente');
      } else {
        await api.put(`/categorias/${selectedCategoria.ID}`, formData);
        alert('Categoría actualizada exitosamente');
      }
      
      // Recargar datos
      const [categoriasRes, reporteRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/categorias/reporte-stock')
      ]);
      setCategorias(categoriasRes.data);
      setReporteStock(reporteRes.data);
      
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
      
      // Recargar datos
      const [categoriasRes, reporteRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/categorias/reporte-stock')
      ]);
      setCategorias(categoriasRes.data);
      setReporteStock(reporteRes.data);
    } catch (err) {
      console.error('Error eliminando categoría:', err);
      alert('Error al eliminar categoría: ' + (err.response?.data?.message || err.message));
    }
  };

  // Funciones de utilidad
  const getProductosPorCategoria = (categoriaId) => {
    return productos.filter(p => p.CategoriaID === categoriaId);
  };

  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find(c => c.ID === categoriaId);
    return categoria ? categoria.Nombre : 'N/A';
  };

  const getEstadoStock = (producto) => {
    if (producto.Stock === 0) return { estado: 'Agotado', clase: 'text-red-700 bg-red-100 border-red-200', icon: AlertCircle };
    if (producto.Stock <= 5) return { estado: 'Stock Crítico', clase: 'text-amber-700 bg-amber-100 border-amber-200', icon: AlertTriangle };
    return { estado: 'Disponible', clase: 'text-emerald-700 bg-emerald-100 border-emerald-200', icon: CheckCircle };
  };

  const getProductosFiltrados = () => {
    let productosFiltrados = productos;

    if (searchTerm) {
      productosFiltrados = productosFiltrados.filter(p => 
        p.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.Descripcion && p.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    switch (filtroStock) {
      case 'sin_stock':
        productosFiltrados = productosFiltrados.filter(p => p.Stock === 0);
        break;
      case 'stock_bajo':
        productosFiltrados = productosFiltrados.filter(p => p.Stock > 0 && p.Stock <= 5);
        break;
      case 'stock_normal':
        productosFiltrados = productosFiltrados.filter(p => p.Stock > 5);
        break;
    }

    return productosFiltrados;
  };

  const getGlobalStats = () => {
    const totalProductos = productos.length;
    const sinStock = productos.filter(p => p.Stock === 0).length;
    const stockBajo = productos.filter(p => p.Stock > 0 && p.Stock <= 5).length;
    const valorTotal = productos.reduce((sum, p) => sum + (p.Stock * p.Precio_Venta), 0);

    return { totalProductos, sinStock, stockBajo, valorTotal };
  };

  const productosFiltrados = getProductosFiltrados();
  const globalStats = getGlobalStats();

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="farmacia-container">
      <div className="farmacia-content">
        {/* Header */}
        <div className="farmacia-header">
          <div className="header-content">
            <div className="header-main">
              <div className="header-icon">
                <Pill className="pill-icon" />
              </div>
              <div className="header-text">
                <h1 className="header-title">
                  Farmacia Digital
                </h1>
                <p className="header-subtitle">Sistema de Gestión Inteligente</p>
              </div>
            </div>
          </div>
          
          {/* Global Stats */}
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-header">
                <Package className="stat-icon" />
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-value">{globalStats.totalProductos}</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-header">
                <TrendingUp className="stat-icon" />
                <span className="stat-label">Valor</span>
              </div>
              <div className="stat-value">Bs. {globalStats.valorTotal.toFixed(0)}</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-header">
                <AlertCircle className="stat-icon" />
                <span className="stat-label">Agotados</span>
              </div>
              <div className="stat-value">{globalStats.sinStock}</div>
            </div>
            <div className="stat-card stat-amber">
              <div className="stat-header">
                <AlertTriangle className="stat-icon" />
                <span className="stat-label">Crítico</span>
              </div>
              <div className="stat-value">{globalStats.stockBajo}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-navigation">
          <div className="tabs-nav">
            <nav className="nav-container">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'categorias', label: 'Categorías', icon: Pill },
                { id: 'inventario', label: 'Inventario', icon: Package }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
                >
                  <tab.icon className="nav-icon" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {reporteStock.map(categoria => (
              <div key={categoria.CategoriaID} className="categoria-dashboard-card">
                <div className="categoria-header">
                  <div className="categoria-info">
                    <div className="categoria-title-row">
                      <h3 className="categoria-name">{categoria.Categoria}</h3>
                    </div>
                  </div>
                  <span className="status-badge status-active">Activa</span>
                </div>
                
                <div className="categoria-stats">
                  <div className="dashboard-stats-grid">
                    <div className="dashboard-stat blue">
                      <div className="dashboard-stat-value">{categoria.TotalProductos}</div>
                      <div className="dashboard-stat-label">Productos</div>
                    </div>
                    <div className="dashboard-stat green">
                      <div className="dashboard-stat-value">{categoria.StockTotal}</div>
                      <div className="dashboard-stat-label">Stock Total</div>
                    </div>
                    <div className="dashboard-stat purple">
                      <div className="dashboard-stat-value">Bs. {parseFloat(categoria.ValorTotal || 0).toFixed(0)}</div>
                      <div className="dashboard-stat-label">Valor Total</div>
                    </div>
                    <div className="dashboard-stat red">
                      <div className="dashboard-stat-value">{categoria.SinStock}</div>
                      <div className="dashboard-stat-label">Agotados</div>
                    </div>
                    <div className="dashboard-stat amber">
                      <div className="dashboard-stat-value">{categoria.StockBajo}</div>
                      <div className="dashboard-stat-label">Stock Crítico</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Content */}
        {activeTab === 'categorias' && (
          <div className="categorias-section">
            <div className="section-header">
              <div className="section-header-content">
                <h2 className="section-title">Gestión de Categorías</h2>
                <button
                  onClick={() => abrirModal('create')}
                  className="btn-primary"
                >
                  <Plus className="btn-icon" />
                  Nueva Categoría
                </button>
              </div>
            </div>

            <div className="categorias-content">
              <div className="categorias-list">
                {categorias.map(categoria => (
                  <div key={categoria.ID} className="categoria-item">
                    <div className="categoria-item-content">
                      <div className="categoria-main">
                        <div className="categoria-badges">
                          <h3 className="categoria-title">{categoria.Nombre}</h3>
                          <span className="badge badge-active">Activa</span>
                        </div>
                        <div className="categoria-meta">
                          {getProductosPorCategoria(categoria.ID).length} productos asociados
                        </div>
                      </div>
                      <div className="categoria-actions">
                        <button
                          onClick={() => abrirModal('edit', categoria)}
                          className="action-btn edit-btn"
                        >
                          <Edit2 className="action-icon" />
                        </button>
                        <button
                          onClick={() => eliminarCategoria(categoria.ID)}
                          className="action-btn delete-btn"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Content */}
        {activeTab === 'inventario' && (
          <div className="inventario-section">
            <div className="inventario-header">
              <h2 className="section-title">Inventario de Medicamentos</h2>
              
              {/* Filters */}
              <div className="filters-container">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar medicamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
                <div className="filters-row">
                  <div className="filter-wrapper">
                    <Filter className="filter-icon" />
                    <select
                      value={filtroStock}
                      onChange={(e) => setFiltroStock(e.target.value)}
                      className="filter-select"
                    >
                      <option value="todos">Estado de Stock</option>
                      <option value="sin_stock">Agotados</option>
                      <option value="stock_bajo">Stock crítico</option>
                      <option value="stock_normal">Stock normal</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="inventario-table-container">
              <table className="inventario-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-th">Medicamento</th>
                    <th className="table-th">Categoría</th>
                    <th className="table-th">Stock</th>
                    <th className="table-th">Precio</th>
                    <th className="table-th">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto) => {
                    const estadoStock = getEstadoStock(producto);
                    const IconoStock = estadoStock.icon;
                    
                    return (
                      <tr key={producto.ID} className="table-row">
                        <td className="table-td">
                          <div className="producto-info">
                            <div className="producto-name">{producto.Nombre}</div>
                            {producto.Descripcion && (
                              <div className="producto-details">
                                <span className="producto-detail">{producto.Descripcion}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-td">
                          <span className="categoria-tag">{getCategoriaNombre(producto.CategoriaID)}</span>
                        </td>
                        <td className="table-td">
                          <div className="stock-info">
                            <span className="stock-number">{producto.Stock}</span>
                          </div>
                        </td>
                        <td className="table-td">
                          <span className="precio">Bs. {parseFloat(producto.Precio_Venta).toFixed(2)}</span>
                        </td>
                        <td className="table-td">
                          <span className={`stock-estado ${estadoStock.clase}`}>
                            <IconoStock className="estado-icon" />
                            {estadoStock.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal para crear/editar categoría */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{modalType === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}</h3>
                <button onClick={cerrarModal} className="modal-close">×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre de la Categoría</label>
                  <input
                    type="text"
                    value={formData.Nombre}
                    onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                    className="form-input"
                    placeholder="Ej: Analgésicos"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={cerrarModal} className="btn-secondary">
                  Cancelar
                </button>
                <button onClick={guardarCategoria} className="btn-primary">
                  {modalType === 'create' ? 'Crear' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmaciaStockManager;
