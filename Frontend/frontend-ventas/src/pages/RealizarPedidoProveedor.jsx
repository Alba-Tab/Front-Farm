import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ShoppingCart, User, Calendar, Package, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../componentes/RealizarProveedor.css';

const PedidoProveedor = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [fechaPedido, setFechaPedido] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [prioridad, setPrioridad] = useState('normal');
  
  // Estados para datos del backend
  const [proveedores, setProveedores] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [proveedoresRes, productosRes] = await Promise.all([
          api.get('/proveedores'),
          api.get('/productos')
        ]);
        
        setProveedores(proveedoresRes.data);
        setProductosDisponibles(productosRes.data);
        setError(null);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const agregarProducto = (producto) => {
    const productoExistente = productos.find(p => p.ID === producto.ID);
    if (productoExistente) {
      setProductos(productos.map(p => 
        p.ID === producto.ID 
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      ));
    } else {
      setProductos([...productos, { 
        ...producto, 
        cantidad: 1,
        precio: parseFloat(producto.Precio_Compra || producto.Precio_Venta || 0)
      }]);
    }
    setBusquedaProducto('');
    setError(null);
    setSuccess(null);
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      eliminarProducto(id);
    } else {
      setProductos(productos.map(p => 
        p.ID === id ? { ...p, cantidad: parseInt(cantidad) } : p
      ));
    }
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.ID !== id));
  };

  const calcularTotal = () => {
    return productos.reduce((total, producto) => 
      total + (producto.precio * producto.cantidad), 0
    ).toFixed(2);
  };

  const manejarEnvio = async () => {
    if (!proveedorSeleccionado || productos.length === 0) {
      setError('Por favor, seleccione un proveedor y agregue al menos un producto');
      return;
    }
    
    try {
      setGuardando(true);
      setError(null);
      setSuccess(null);
      
      // Preparar detalles de la compra
      const detalles = productos.map(producto => ({
        ProductoID: producto.ID,
        Cantidad: producto.cantidad,
        Costo: producto.precio,
        Importe: producto.precio * producto.cantidad
      }));
      
      // Preparar datos para la nota de compra (incluyendo detalles)
      const notaCompraData = {
        Fecha: fechaPedido,
        Hora: new Date().toTimeString().split(' ')[0], // HH:MM:SS
        Monto_Total: parseFloat(calcularTotal()),
        ProveedorID: parseInt(proveedorSeleccionado),
        detalles: detalles
        // UsuarioID se agregará automáticamente en el backend si está autenticado
      };
      
      console.log('Creando nota de compra con detalles:', notaCompraData);
      
      // Crear la nota de compra con sus detalles
      const notaCompraRes = await api.post('/notas-compra', notaCompraData);
      const notaCompraId = notaCompraRes.data.id;
      
      console.log('Nota de compra creada con ID:', notaCompraId);
      
      setSuccess(`¡Compra registrada exitosamente! ID: ${notaCompraId}`);
      
      // Limpiar formulario
      setProveedorSeleccionado('');
      setProductos([]);
      setObservaciones('');
      setFechaEntrega('');
      
      // Opcional: navegar de vuelta después de 2 segundos
      setTimeout(() => {
        navigate('/proveedores');
      }, 2000);
      
    } catch (err) {
      console.error('Error guardando compra:', err);
      setError('Error al guardar la compra: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  const handleGoBack = () => {
    navigate('/proveedores');
  };

  const productosFiltrados = productosDisponibles.filter(producto =>
    (producto.Nombre?.toLowerCase().includes(busquedaProducto.toLowerCase()) || '') ||
    (producto.Descripcion?.toLowerCase().includes(busquedaProducto.toLowerCase()) || '') ||
    (producto.ID?.toString().includes(busquedaProducto) || '')
  );

  if (loading) return <div className="loading">Cargando datos...</div>;

  return (
    <div className="pedido-container">
      <div className="pedido-wrapper">
        {/* Header */}
        <div className="pedido-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                onClick={handleGoBack}
                className="back-button"
                title="Volver a Proveedores"
              >
                <ArrowLeft />
              </button>
              <div className="header-icon">
                <ShoppingCart />
              </div>
              <div>
                <h1 className="header-title">Nueva Compra a Proveedor</h1>
                <p className="header-subtitle">Farmacia Britmann</p>
              </div>
            </div>
            <div className="header-badge">
              <span>Sistema de Gestión</span>
            </div>
          </div>
        </div>

        <div className="pedido-layout">
          {/* Información del Pedido */}
          <div className="pedido-info">
            {/* Datos Generales */}
            <div className="pedido-card">
              <div className="card-header">
                <FileText />
                <h2 className="card-title">Datos de la Compra</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <User />
                    Proveedor *
                  </label>
                  <select
                    value={proveedorSeleccionado}
                    onChange={(e) => setProveedorSeleccionado(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(prov => (
                      <option key={prov.ID} value={prov.ID}>
                        {prov.Nombre} - {prov.Dirección || 'Sin dirección'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value)}
                    className="form-select"
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Calendar />
                    Fecha de Compra
                  </label>
                  <input
                    type="date"
                    value={fechaPedido}
                    onChange={(e) => setFechaPedido(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Calendar />
                    Fecha de Entrega Esperada
                  </label>
                  <input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Selección de Productos */}
            <div className="pedido-card">
              <div className="card-header">
                <Package />
                <h2 className="card-title">Productos</h2>
              </div>
              
              <div className="search-container">
                <label className="form-label">Buscar producto</label>
                <div style={{ position: 'relative' }}>
                  <Search className="search-icon" />
                  <input
                    type="text"
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    placeholder="Buscar por nombre, descripción o ID..."
                    className="search-input"
                  />
                </div>
                
                {busquedaProducto && (
                  <div className="productos-dropdown">
                    {productosFiltrados.length > 0 ? productosFiltrados.map(producto => (
                      <div
                        key={producto.ID}
                        onClick={() => agregarProducto(producto)}
                        className="producto-item"
                      >
                        <div className="producto-info">
                          <div>
                            <span className="producto-nombre">{producto.Nombre || 'Sin nombre'}</span>
                            <span className="producto-codigo">(ID: {producto.ID})</span>
                            {producto.Descripcion && (
                              <div className="producto-descripcion">{producto.Descripcion}</div>
                            )}
                          </div>
                          <div className="producto-precio">
                            <span className="precio-value">
                              Bs {parseFloat(producto.Precio_Compra || producto.Precio_Venta || 0).toFixed(2)}
                            </span>
                            <div className="stock-info">Stock: {producto.Stock || 0}</div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="no-productos">No se encontraron productos</div>
                    )}
                  </div>
                )}
              </div>

              {/* Lista de productos agregados */}
              {productos.length > 0 && (
                <div className="productos-agregados">
                  <h3 className="productos-title">Productos en la compra:</h3>
                  <div>
                    {productos.map(producto => (
                      <div key={producto.ID} className="producto-agregado">
                        <div className="producto-agregado-info">
                          <div className="producto-agregado-nombre">{producto.Nombre || 'Sin nombre'}</div>
                          <div className="producto-agregado-codigo">ID: {producto.ID}</div>
                        </div>
                        <div className="producto-agregado-controles">
                          <div className="producto-precios">
                            <div className="precio-unitario">Precio: Bs {producto.precio.toFixed(2)}</div>
                            <div className="precio-subtotal">
                              Subtotal: Bs {(producto.precio * producto.cantidad).toFixed(2)}
                            </div>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={producto.cantidad}
                            onChange={(e) => actualizarCantidad(producto.ID, e.target.value)}
                            className="cantidad-input"
                          />
                          <button
                            type="button"
                            onClick={() => eliminarProducto(producto.ID)}
                            className="btn-eliminar"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div className="pedido-card">
              <label className="form-label">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Instrucciones especiales, notas adicionales..."
                className="form-textarea"
              />
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="error-msg" style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                color: '#dc2626', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-msg" style={{ 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                color: '#166534', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                {success}
              </div>
            )}
          </div>

          {/* Resumen del Pedido */}
          <div className="resumen-container">
            <h2 className="resumen-title">Resumen de la Compra</h2>
            
            {productos.length === 0 ? (
              <div className="resumen-vacio">
                <Package style={{ width: '3rem', height: '3rem', color: '#d1d5db', margin: '0 auto 0.75rem' }} />
                <p>No hay productos agregados</p>
              </div>
            ) : (
              <>
                <div className="resumen-items">
                  <div className="resumen-item">
                    <span className="resumen-label">Productos:</span>
                    <span className="resumen-value">{productos.length}</span>
                  </div>
                  <div className="resumen-item">
                    <span className="resumen-label">Unidades totales:</span>
                    <span className="resumen-value">
                      {productos.reduce((total, p) => total + p.cantidad, 0)}
                    </span>
                  </div>
                  <hr className="resumen-divider" />
                  <div className="resumen-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">Bs {calcularTotal()}</span>
                  </div>
                </div>

                {prioridad === 'urgente' && (
                  <div className="alerta-urgente">
                    <AlertCircle />
                    <span>Compra Urgente</span>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={manejarEnvio}
              disabled={!proveedorSeleccionado || productos.length === 0 || guardando}
              className="btn-generar"
            >
              <ShoppingCart />
              <span>{guardando ? 'Guardando...' : 'Registrar Compra'}</span>
            </button>

            <div className="form-note">
              Los campos marcados con * son obligatorios
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoProveedor;