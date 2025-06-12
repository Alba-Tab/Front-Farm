import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../componentes/ProveedoresPage.css';
import api from '../api';

export default function ProveedoresPage() {
  const navigate = useNavigate();
  
  // Estados para datos del backend
  const [proveedores, setProveedores] = useState([]);
  const [notasCompra, setNotasCompra] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales y formularios
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [showViewProveedorModal, setShowViewProveedorModal] = useState(false);
  const [showEditProveedorModal, setShowEditProveedorModal] = useState(false);
  const [showDeleteProveedorModal, setShowDeleteProveedorModal] = useState(false);
  const [showViewCompraModal, setShowViewCompraModal] = useState(false);
  const [showEditCompraModal, setShowEditCompraModal] = useState(false);
  
  const [proveedorForm, setProveedorForm] = useState({ Nombre: "", Dirección: "", Telefono: "", E_mail: "" });
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [busquedaCompra, setBusquedaCompra] = useState("");

  // Cargar datos del backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [proveedoresRes, notasCompraRes] = await Promise.all([
          api.get('/proveedores'),
          api.get('/notas-compra')
        ]);
        
        setProveedores(proveedoresRes.data);
        setNotasCompra(notasCompraRes.data);
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

  // Filtros de búsqueda
  const proveedoresFiltrados = proveedores.filter((p) =>
    p.Nombre.toLowerCase().includes(busquedaProveedor.toLowerCase())
  );
  
  const comprasFiltradas = notasCompra.filter((c) =>
    c.Proveedor?.toLowerCase().includes(busquedaCompra.toLowerCase()) ||
    c.ID?.toString().includes(busquedaCompra)
  );

  // Handlers para formularios
  const handleProveedorChange = (e) => {
    setProveedorForm({ ...proveedorForm, [e.target.name]: e.target.value });
  };

  const handleProveedorSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/proveedores', proveedorForm);
      
      // Recargar proveedores
      const res = await api.get('/proveedores');
      setProveedores(res.data);
      
      alert("Proveedor guardado exitosamente");
      setShowProveedorModal(false);
      setProveedorForm({ Nombre: "", Dirección: "", Telefono: "", E_mail: "" });
    } catch (err) {
      console.error('Error creando proveedor:', err);
      alert('Error al crear proveedor: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handlers para acciones de proveedores
  const handleViewProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowViewProveedorModal(true);
  };

  const handleEditProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setProveedorForm({ 
      Nombre: proveedor.Nombre, 
      Dirección: proveedor.Dirección || "", 
      Telefono: proveedor.Telefono || "", 
      E_mail: proveedor.E_mail || "" 
    });
    setShowEditProveedorModal(true);
  };

  const handleDeleteProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDeleteProveedorModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/proveedores/${selectedProveedor.ID}`);
      
      // Recargar proveedores
      const res = await api.get('/proveedores');
      setProveedores(res.data);
      
      alert(`Proveedor "${selectedProveedor.Nombre}" eliminado exitosamente`);
      setShowDeleteProveedorModal(false);
      setSelectedProveedor(null);
    } catch (err) {
      console.error('Error eliminando proveedor:', err);
      alert('Error al eliminar proveedor: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditProveedorSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/proveedores/${selectedProveedor.ID}`, proveedorForm);
      
      // Recargar proveedores
      const res = await api.get('/proveedores');
      setProveedores(res.data);
      
      alert("Proveedor actualizado exitosamente");
      setShowEditProveedorModal(false);
      setProveedorForm({ Nombre: "", Dirección: "", Telefono: "", E_mail: "" });
      setSelectedProveedor(null);
    } catch (err) {
      console.error('Error actualizando proveedor:', err);
      alert('Error al actualizar proveedor: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handlers para acciones de compras
  const handleViewCompra = (compra) => {
    setSelectedCompra(compra);
    setShowViewCompraModal(true);
  };

  const handleEditCompra = (compra) => {
    setSelectedCompra(compra);
    setShowEditCompraModal(true);
  };

  // Función para navegar a la página de nueva compra
  const handleNuevaCompra = () => {
    navigate('/proveedores/nueva-compra');
  };

  // Calcular estadísticas dinámicas
  const estadisticas = {
    proveedoresActivos: proveedores.length,
    comprasEsteMes: notasCompra.filter(nc => {
      const fechaCompra = new Date(nc.Fecha);
      const ahora = new Date();
      return fechaCompra.getMonth() === ahora.getMonth() && fechaCompra.getFullYear() === ahora.getFullYear();
    }).length,
    montoTotal: notasCompra.reduce((total, nc) => total + (parseFloat(nc.Monto_Total) || 0), 0),
    productosComprados: notasCompra.reduce((total, nc) => total + (parseInt(nc.TotalProductos) || 0), 0)
  };

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="header">
        <h1>🏥 Gestión de Proveedores y Compras</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowProveedorModal(true)}>
            ➕ Nuevo Proveedor
          </button>
          <button className="btn btn-primary" onClick={handleNuevaCompra}>
            🛒 Nueva Compra
          </button>
        </div>
      </div>
      <div className="container">
        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card-proveedores proveedores">
            <div className="stat-value">{estadisticas.proveedoresActivos}</div>
            <div className="stat-label-proveedores">Proveedores Activos</div>
          </div>
          <div className="stat-card-proveedores compras">
            <div className="stat-value">{estadisticas.comprasEsteMes}</div>
            <div className="stat-label-compras">Compras Este Mes</div>
          </div>
          <div className="stat-card-proveedores monto">
            <div className="stat-value">Bs {estadisticas.montoTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</div>
            <div className="stat-label-monto">Monto Total Compras</div>
          </div>
          <div className="stat-card-proveedores productos">
            <div className="stat-value">{estadisticas.productosComprados}</div>
            <div className="stat-label-productos">Productos Comprados</div>
          </div>
        </div>
        <div className="main-content">
          {/* Gestión de Proveedores */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">👥 Proveedores</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowProveedorModal(true)}>
                ➕ Agregar
              </button>
            </div>
            <div className="section-content">
              <div className="search-container">
                <div className="search-icon">🔍</div>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar proveedores..."
                  value={busquedaProveedor}
                  onChange={e => setBusquedaProveedor(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedoresFiltrados.map((p) => (
                      <tr key={p.ID}>
                        <td>{p.ID}</td>
                        <td>{p.Nombre}</td>
                        <td>{p.Telefono}</td>
                        <td>{p.E_mail}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-view btn-sm" 
                              onClick={() => handleViewProveedor(p)}
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-edit btn-sm"
                              onClick={() => handleEditProveedor(p)}
                              title="Editar proveedor"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-delete btn-sm"
                              onClick={() => handleDeleteProveedor(p)}
                              title="Eliminar proveedor"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Gestión de Compras */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">🛒 Últimas Compras (Notas de Compra)</h3>
              <button className="btn btn-primary btn-sm" onClick={handleNuevaCompra}>
                ➕ Nueva Compra
              </button>
            </div>
            <div className="section-content">
              <div className="search-container">
                <div className="search-icon">🔍</div>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar compras..."
                  value={busquedaCompra}
                  onChange={e => setBusquedaCompra(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Proveedor</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasFiltradas.map((c) => (
                      <tr key={c.ID}>
                        <td>{c.ID}</td>
                        <td>{new Date(c.Fecha).toLocaleDateString('es-BO')}</td>
                        <td>{c.Proveedor || 'Sin proveedor'}</td>
                        <td>Bs {parseFloat(c.Monto_Total || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                        <td>
                          <span className="badge badge-active">Completado</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-view btn-sm"
                              onClick={() => handleViewCompra(c)}
                              title="Ver detalles de compra"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-edit btn-sm"
                              onClick={() => handleEditCompra(c)}
                              title="Editar compra"
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nuevo Proveedor */}
      {showProveedorModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Nuevo Proveedor</h3>
              <span className="close" onClick={() => setShowProveedorModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <form onSubmit={handleProveedorSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre del Proveedor</label>
                  <input type="text" className="form-input" name="Nombre" value={proveedorForm.Nombre} onChange={handleProveedorChange} placeholder="Ingrese el nombre del proveedor" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <input type="text" className="form-input" name="Dirección" value={proveedorForm.Dirección} onChange={handleProveedorChange} placeholder="Ingrese la dirección" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input type="tel" className="form-input" name="Telefono" value={proveedorForm.Telefono} onChange={handleProveedorChange} placeholder="+591 2 234 5678" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" name="E_mail" value={proveedorForm.E_mail} onChange={handleProveedorChange} placeholder="correo@ejemplo.com" required />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 15, justifyContent: "flex-end", marginTop: 25 }}>
                  <button type="button" className="btn" style={{ background: "#6b7280", color: "white" }} onClick={() => setShowProveedorModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Proveedor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Proveedor */}
      {showViewProveedorModal && selectedProveedor && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>👁️ Detalles del Proveedor</h3>
              <span className="close" onClick={() => setShowViewProveedorModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="provider-details">
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedProveedor.ID}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{selectedProveedor.Nombre}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dirección:</span>
                  <span className="detail-value">{selectedProveedor.Dirección}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">{selectedProveedor.Telefono}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedProveedor.E_mail}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <span className="badge badge-active">Activo</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 25 }}>
                <button className="btn btn-secondary" onClick={() => setShowViewProveedorModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Proveedor */}
      {showEditProveedorModal && selectedProveedor && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>✏️ Editar Proveedor</h3>
              <span className="close" onClick={() => setShowEditProveedorModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditProveedorSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre del Proveedor</label>
                  <input type="text" className="form-input" name="Nombre" value={proveedorForm.Nombre} onChange={handleProveedorChange} placeholder="Ingrese el nombre del proveedor" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <input type="text" className="form-input" name="Dirección" value={proveedorForm.Dirección} onChange={handleProveedorChange} placeholder="Ingrese la dirección" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input type="tel" className="form-input" name="Telefono" value={proveedorForm.Telefono} onChange={handleProveedorChange} placeholder="+591 2 234 5678" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" name="E_mail" value={proveedorForm.E_mail} onChange={handleProveedorChange} placeholder="correo@ejemplo.com" required />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 15, justifyContent: "flex-end", marginTop: 25 }}>
                  <button type="button" className="btn" style={{ background: "#6b7280", color: "white" }} onClick={() => setShowEditProveedorModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar Proveedor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Proveedor */}
      {showDeleteProveedorModal && selectedProveedor && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>🗑️ Eliminar Proveedor</h3>
              <span className="close" onClick={() => setShowDeleteProveedorModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="warning-icon">⚠️</div>
                <h4>¿Está seguro que desea eliminar este proveedor?</h4>
                <p>Esta acción no se puede deshacer. Se eliminará toda la información del proveedor:</p>
                <div className="provider-info">
                  <strong>{selectedProveedor.Nombre}</strong><br/>
                  {selectedProveedor.Telefono}<br/>
                  {selectedProveedor.E_mail}
                </div>
              </div>
              <div style={{ display: "flex", gap: 15, justifyContent: "flex-end", marginTop: 25 }}>
                <button className="btn btn-secondary" onClick={() => setShowDeleteProveedorModal(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar Proveedor</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Compra */}
      {showViewCompraModal && selectedCompra && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>👁️ Detalles de Compra</h3>
              <span className="close" onClick={() => setShowViewCompraModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="compra-details">
                <div className="detail-section">
                  <h4>Información General</h4>
                  <div className="detail-row">
                    <span className="detail-label">ID Compra:</span>
                    <span className="detail-value">{selectedCompra.ID}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha:</span>
                    <span className="detail-value">{new Date(selectedCompra.Fecha).toLocaleDateString('es-BO')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Proveedor:</span>
                    <span className="detail-value">{selectedCompra.Proveedor}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value total-amount">Bs {parseFloat(selectedCompra.Monto_Total || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Estado:</span>
                    <span className="badge badge-active">Completado</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 25 }}>
                <button className="btn btn-secondary" onClick={() => setShowViewCompraModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Compra */}
      {showEditCompraModal && selectedCompra && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>✏️ Editar Compra</h3>
              <span className="close" onClick={() => setShowEditCompraModal(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                alert("Esta funcionalidad estará disponible pronto");
                setShowEditCompraModal(false);
              }}>
                <div className="form-group">
                  <label className="form-label">ID Compra</label>
                  <input type="text" className="form-input" value={selectedCompra.ID} disabled />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fecha</label>
                    <input type="date" className="form-input" defaultValue={selectedCompra.Fecha} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total</label>
                    <input type="number" className="form-input" step="0.01" defaultValue={selectedCompra.Monto_Total} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Observaciones</label>
                  <textarea className="form-input" rows="3" placeholder="Observaciones adicionales..."></textarea>
                </div>
                <div style={{ display: "flex", gap: 15, justifyContent: "flex-end", marginTop: 25 }}>
                  <button type="button" className="btn" style={{ background: "#6b7280", color: "white" }} onClick={() => setShowEditCompraModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar Compra</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
