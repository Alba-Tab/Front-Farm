import React, { useState, useEffect } from "react";
import "../componentes/NotasSalida.css";
import api from '../api';

export default function NotasSalidaPage() {
  // Estados para datos del backend
  const [notas, setNotas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tabs: todos, vencidos, danados, extraviados
  const [tab, setTab] = useState("todos");
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const [viewingNota, setViewingNota] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [productosForm, setProductosForm] = useState([
    { producto: "", lote: "", cantidad: "", valor: "", observaciones: "" },
  ]);
  const [notaForm, setNotaForm] = useState({ fecha: "", hora: "" });

  const motivos = {
    vencido: { icon: "⏰", label: "Vencido", badge: "badge-vencido" },
    danado: { icon: "💔", label: "Dañado", badge: "badge-danado" },
    extraviado: { icon: "🔍", label: "Extraviado", badge: "badge-extraviado" },
  };

  // Cargar datos del backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [notasRes, productosRes] = await Promise.all([
          api.get('/notas-salida'),
          api.get('/productos')
        ]);
        
        setNotas(notasRes.data);
        setProductos(productosRes.data);
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

  // Filtro de pestañas
  const notasFiltradas = tab === "todos" ? notas : notas.filter(n => n.Motivo === tab);
  
  // Handlers
  const handleTab = (t) => setTab(t);
  
  const openNotaModal = () => {
    console.log("Abriendo modal nueva nota");
    setEditingNota(null);
    setShowNotaModal(true);
    // Establecer fecha y hora actuales por defecto
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0].substring(0, 5);
    setNotaForm({ fecha, hora });
  };
  
  const closeNotaModal = () => {
    setShowNotaModal(false);
    setEditingNota(null);
    setMotivo("");
    setNotaForm({ fecha: "", hora: "" });
    setProductosForm([{ producto: "", lote: "", cantidad: "", valor: "", observaciones: "" }]);
  };
  
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingNota(null);
  };
  
  const handleMotivo = (m) => setMotivo(m);
  const handleNotaForm = (e) => setNotaForm({ ...notaForm, [e.target.name]: e.target.value });
  const handleProductoChange = (idx, e) => {
    const arr = [...productosForm];
    arr[idx][e.target.name] = e.target.value;
    setProductosForm(arr);
  };
  const addProducto = () => setProductosForm([...productosForm, { producto: "", lote: "", cantidad: "", valor: "", observaciones: "" }]);
  const removeProducto = (idx) => setProductosForm(productosForm.length > 1 ? productosForm.filter((_, i) => i !== idx) : productosForm);
  
  const generateNotaId = () => {
    const lastId = notas.length > 0 ? Math.max(...notas.map(n => parseInt(n.ID || 0))) : 0;
    return lastId + 1;
  };
  
  const handleNotaSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulario enviado");
    console.log("Motivo:", motivo);
    console.log("Productos:", productosForm);
    
    if (!motivo) {
      alert("Por favor seleccione un motivo de salida");
      return;
    }
    
    const productosValidos = productosForm.filter(p => p.producto && p.producto.trim() !== "");
    
    if (productosValidos.length === 0) {
      alert("Debe agregar al menos un producto");
      return;
    }
    
    try {
      const nuevaNota = {
        Fecha: notaForm.fecha,
        Hora: notaForm.hora,
        Motivo: motivo,
        productos: productosValidos
      };
      
      console.log("Nueva nota a enviar:", nuevaNota);
      
      if (editingNota) {
        // Actualizar nota existente
        await api.put(`/notas-salida/${editingNota.ID}`, nuevaNota);
        alert("Nota de salida actualizada exitosamente");
      } else {
        // Crear nueva nota
        await api.post('/notas-salida', nuevaNota);
        alert("Nota de salida registrada exitosamente");
      }
      
      // Recargar notas
      const res = await api.get('/notas-salida');
      setNotas(res.data);
      
      closeNotaModal();
    } catch (err) {
      console.error('Error guardando nota:', err);
      alert('Error al guardar nota: ' + (err.response?.data?.error || err.message));
    }
  };
  
  // Funciones para los botones de acciones
  const handleViewNota = (nota) => {
    console.log("Abriendo modal ver nota:", nota);
    setViewingNota(nota);
    setShowViewModal(true);
  };

  const handleEditNota = (nota) => {
    console.log("Abriendo modal editar nota:", nota);
    setEditingNota(nota);
    setMotivo(nota.Motivo || "");
    
    // Convertir fecha si es necesario
    let fecha = nota.Fecha;
    if (fecha && typeof fecha === 'string' && fecha.includes('T')) {
      fecha = fecha.split('T')[0];
    }
    
    setNotaForm({ 
      fecha: fecha || "", 
      hora: nota.Hora || "" 
    });
    
    // Los productos pueden estar en el campo 'productos' o necesitar ser cargados
    const productosData = nota.productos || [{ producto: "", lote: "", cantidad: "", valor: "", observaciones: "" }];
    setProductosForm(productosData);
    setShowNotaModal(true);
  };

  const handleDeleteNota = async (nota) => {
    if (window.confirm(`¿Está seguro de eliminar la nota ${nota.ID}?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/notas-salida/${nota.ID}`);
        
        // Recargar notas
        const res = await api.get('/notas-salida');
        setNotas(res.data);
        
        alert(`Nota ${nota.ID} eliminada exitosamente`);
      } catch (err) {
        console.error('Error eliminando nota:', err);
        alert('Error al eliminar nota: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="notas-salida-container">
      {/* Notas de Salida Recientes */}
      <div className="section">
        <div className="section-header">
          <h1 className="section-title">📋 Gestión de Notas de Salida</h1>
          <button className="btn btn-primary" onClick={openNotaModal}>📝 Nueva Nota de Salida</button>
        </div>
        <div className="section-content">
          <div className="filter-tabs">
            <button className={`filter-tab${tab === "todos" ? " active" : ""}`} onClick={() => handleTab("todos")}>Todos ({notas.length})</button>
            <button className={`filter-tab${tab === "vencido" ? " active" : ""}`} onClick={() => handleTab("vencido")}>Vencidos</button>
            <button className={`filter-tab${tab === "danado" ? " active" : ""}`} onClick={() => handleTab("danado")}>Dañados</button>
            <button className={`filter-tab${tab === "extraviado" ? " active" : ""}`} onClick={() => handleTab("extraviado")}>Extraviados</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      {tab === "todos" ? "No hay notas de salida registradas" : `No hay notas de salida con motivo "${tab}"`}
                    </td>
                  </tr>
                ) : (
                  notasFiltradas.map((n) => (
                    <tr key={n.ID}>
                      <td>{n.ID}</td>
                      <td>{new Date(n.Fecha).toLocaleDateString('es-BO')}</td>
                      <td>{n.Hora}</td>
                      <td>
                        {n.Motivo && motivos[n.Motivo] ? (
                          <span className={`badge ${motivos[n.Motivo].badge}`}>
                            {motivos[n.Motivo].icon} {motivos[n.Motivo].label}
                          </span>
                        ) : (
                          <span className="badge badge-default">📋 Salida</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-view btn-sm" 
                            onClick={() => handleViewNota(n)}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn btn-edit btn-sm" 
                            onClick={() => handleEditNota(n)}
                            title="Editar nota"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-delete btn-sm" 
                            onClick={() => handleDeleteNota(n)}
                            title="Eliminar nota"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nueva Nota de Salida */}
      <div className="modal" style={{ display: showNotaModal ? 'flex' : 'none', zIndex: 1000 }}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>📝 {editingNota ? 'Editar' : 'Nueva'} Nota de Salida</h3>
            <span className="close" onClick={closeNotaModal}>&times;</span>
          </div>
          <div className="modal-body">
            <form onSubmit={handleNotaSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input type="date" className="form-input" name="fecha" value={notaForm.fecha} onChange={handleNotaForm} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input type="time" className="form-input" name="hora" value={notaForm.hora} onChange={handleNotaForm} required />
                </div>
              </div>
              <h4 className="section-subtitle">Seleccione el Motivo de Salida</h4>
              <div className="motivo-buttons">
                {Object.entries(motivos).map(([key, m]) => (
                  <div
                    key={key}
                    className={`motivo-btn ${key} ${motivo === key ? "active" : ""}`}
                    onClick={() => handleMotivo(key)}
                  >
                    <div className="motivo-icon">{m.icon}</div>
                    <div><strong>Producto {m.label}</strong></div>
                    <div className="motivo-description">
                      {key === "vencido" && "Productos fuera de fecha"}
                      {key === "danado" && "Productos deteriorados"}
                      {key === "extraviado" && "Productos no encontrados"}
                    </div>
                  </div>
                ))}
              </div>
              <input type="hidden" name="motivo" value={motivo} required />
              <h4 className="section-subtitle">Productos a Dar de Baja</h4>
              <div id="productosContainer">
                {productosForm.map((prod, idx) => (
                  <div className="producto-item" key={idx}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Producto</label>
                        <select className="form-input" name="producto" value={prod.producto} onChange={e => handleProductoChange(idx, e)} required>
                          <option value="">Seleccione un producto</option>
                          {productos.map(p => (
                            <option key={p.ID} value={p.Nombre}>{p.Nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Lote</label>
                        <input type="text" className="form-input" name="lote" value={prod.lote} onChange={e => handleProductoChange(idx, e)} placeholder="LT-2024-001" required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Cantidad</label>
                        <input type="number" className="form-input" name="cantidad" value={prod.cantidad} onChange={e => handleProductoChange(idx, e)} placeholder="50" min="1" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Valor Unitario (Bs)</label>
                        <input type="number" className="form-input" name="valor" value={prod.valor} onChange={e => handleProductoChange(idx, e)} placeholder="2.50" step="0.01" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Observaciones</label>
                      <textarea className="form-input" name="observaciones" value={prod.observaciones} onChange={e => handleProductoChange(idx, e)} rows={3} placeholder="Detalles adicionales sobre el motivo de la salida..." />
                    </div>
                    <button type="button" className="remove-producto" onClick={() => removeProducto(idx)} title="Quitar producto">&times;</button>
                  </div>
                ))}
                <button type="button" className="btn btn-primary btn-sm add-producto-btn" onClick={addProducto}>➕ Agregar Producto</button>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={closeNotaModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editingNota ? 'Actualizar' : 'Guardar'} Nota de Salida
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Ver Detalles de Nota */}
      <div className="modal" style={{ display: showViewModal ? 'flex' : 'none', zIndex: 1000 }}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>👁️ Detalles de Nota de Salida</h3>
            <span className="close" onClick={closeViewModal}>&times;</span>
          </div>
          <div className="modal-body">
            {viewingNota && (
              <div className="nota-details">
                <div className="detail-row">
                  <strong>ID:</strong> {viewingNota.ID}
                </div>
                <div className="detail-row">
                  <strong>Fecha:</strong> {new Date(viewingNota.Fecha).toLocaleDateString('es-BO')}
                </div>
                <div className="detail-row">
                  <strong>Hora:</strong> {viewingNota.Hora}
                </div>
                <div className="detail-row">
                  <strong>Motivo:</strong> 
                  {viewingNota.Motivo && motivos[viewingNota.Motivo] ? (
                    <span className={`badge ${motivos[viewingNota.Motivo].badge}`}>
                      {motivos[viewingNota.Motivo].icon} {motivos[viewingNota.Motivo].label}
                    </span>
                  ) : (
                    <span className="badge badge-default">📋 Salida</span>
                  )}
                </div>
                
                {viewingNota.productos && viewingNota.productos.length > 0 && (
                  <>
                    <h4 className="section-subtitle">Productos Dados de Baja</h4>
                    <div className="productos-list">
                      {viewingNota.productos.map((prod, idx) => (
                        <div key={idx} className="producto-detail">
                          <div className="producto-header">
                            <strong>Producto {idx + 1}: {prod.producto}</strong>
                          </div>
                          <div className="producto-info">
                            <div><strong>Lote:</strong> {prod.lote}</div>
                            <div><strong>Cantidad:</strong> {prod.cantidad}</div>
                            <div><strong>Valor Unitario:</strong> Bs {prod.valor}</div>
                            <div><strong>Valor Total:</strong> Bs {(parseFloat(prod.valor || 0) * parseInt(prod.cantidad || 0)).toFixed(2)}</div>
                            {prod.observaciones && (
                              <div><strong>Observaciones:</strong> {prod.observaciones}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="nota-summary">
                      <div className="summary-item">
                        <strong>Total de Productos:</strong> {viewingNota.productos.length}
                      </div>
                      <div className="summary-item">
                        <strong>Cantidad Total:</strong> {viewingNota.productos.reduce((sum, p) => sum + parseInt(p.cantidad || 0), 0)}
                      </div>
                      <div className="summary-item">
                        <strong>Valor Total de Pérdida:</strong> Bs {viewingNota.productos.reduce((sum, p) => sum + (parseFloat(p.valor || 0) * parseInt(p.cantidad || 0)), 0).toFixed(2)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-cancel" onClick={closeViewModal}>Cerrar</button>
              {viewingNota && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    closeViewModal();
                    handleEditNota(viewingNota);
                  }}
                >
                  ✏️ Editar Nota
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
