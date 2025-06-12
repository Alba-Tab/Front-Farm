import React, { useState, useEffect } from 'react';
import '../componentes/BitacoraPerdidas.css';
import { getProductos } from '../api';
import api from '../api';

// Componente unificado para Bitácora y Gestión de Pérdidas
const BitacoraPerdidas = () => {
  const [activeTab, setActiveTab] = useState('bitacora');

  return (
    <div className="bitacora-perdidas-container">
      {/* Header con navegación por pestañas */}
      <div className="unified-header">
        <h1>📊 Bitácora y Gestión de Pérdidas</h1>
        <div className="tab-navigation">
          <button 
            className={`nav-tab ${activeTab === 'bitacora' ? 'active' : ''}`}
            onClick={() => setActiveTab('bitacora')}
          >
            <i className="fa fa-chart-line"></i>
            Bitácora del Sistema
          </button>
          <button 
            className={`nav-tab ${activeTab === 'perdidas' ? 'active' : ''}`}
            onClick={() => setActiveTab('perdidas')}
          >
            <i className="fa fa-exclamation-triangle"></i>
            Gestión de Pérdidas
          </button>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'bitacora' && <BitacoraComponent />}
      {activeTab === 'perdidas' && <PerdidasComponent />}
    </div>
  );
};

// Componente para la Bitácora
const BitacoraComponent = () => {
  const [logs, setLogs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({ usuario: '', accion: '', fecha: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBitacora() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/bitacora');
        setLogs(res.data);
        // Extraer usuarios únicos de los logs
        const usuariosUnicos = Array.from(new Set(res.data.map(l => l.UsuarioID))).map(id => {
          const log = res.data.find(l => l.UsuarioID === id);
          return { id, nombre: log?.nombre || `Usuario ${id}` };
        });
        setUsuarios(usuariosUnicos);
      } catch (err) {
        setError('Error al cargar la bitácora');
      } finally {
        setLoading(false);
      }
    }
    fetchBitacora();
  }, []);

  // Filtros
  const logsFiltrados = logs.filter(log => {
    const usuarioOk = !filtros.usuario || String(log.UsuarioID) === filtros.usuario;
    const accionOk = !filtros.accion || (log.Accion || '').toLowerCase().includes(filtros.accion.toLowerCase());
    const fechaOk = !filtros.fecha || log.Fecha === filtros.fecha;
    return usuarioOk && accionOk && fechaOk;
  });

  // Estadísticas
  const accionesHoy = logs.filter(log => log.Fecha === new Date().toISOString().slice(0, 10)).length;
  const usuariosActivos = [...new Set(logs.map(log => log.UsuarioID))].length;
  const intentosFallidos = logs.filter(log => (log.Accion || '').toLowerCase().includes('fallido')).length;
  const erroresSistema = logs.filter(log => (log.Accion || '').toLowerCase().includes('error')).length;

  return (
    <div className="bitacora-section">
      <div className="stats-grid">
        <div className="stat-card-bitacora blue">
          <div className="stat-number">{accionesHoy}</div>
          <div className="stat-label-bitacora">Acciones Hoy</div>
        </div>
        <div className="stat-card-bitacora green">
          <div className="stat-number">{usuariosActivos}</div>
          <div className="stat-label-bitacora">Usuarios Activos</div>
        </div>
        <div className="stat-card-bitacora yellow">
          <div className="stat-number">{intentosFallidos}</div>
          <div className="stat-label-bitacora">Intentos Fallidos</div>
        </div>
        <div className="stat-card-bitacora red">
          <div className="stat-number">{erroresSistema}</div>
          <div className="stat-label-bitacora">Errores de Sistema</div>
        </div>
      </div>
      
      <div className="bitacora-main-content">
        <div className="section-header">
          <span>Registro de Actividades del Sistema</span>
          <span className="real-time-indicator">⚡ Tiempo real</span>
        </div>
        
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Usuario</label>
              <select 
                value={filtros.usuario} 
                onChange={e => setFiltros({ ...filtros, usuario: e.target.value })}
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Acción</label>
              <input 
                type="text" 
                placeholder="Buscar acción..." 
                value={filtros.accion} 
                onChange={e => setFiltros({ ...filtros, accion: e.target.value })} 
              />
            </div>
            <div className="filter-group">
              <label>Fecha</label>
              <input 
                type="date" 
                value={filtros.fecha} 
                onChange={e => setFiltros({ ...filtros, fecha: e.target.value })} 
              />
            </div>
            <button className="btn-filter">Filtrar</button>
          </div>
        </div>
        
        <div className="log-container">
          {loading ? (
            <div className="bitacora-loading">Cargando...</div>
          ) : error ? (
            <div className="bitacora-error">{error}</div>
          ) : logsFiltrados.length === 0 ? (
            <div className="bitacora-error">No hay registros para los filtros seleccionados.</div>
          ) : (
            logsFiltrados.map((log) => (
              <div className="log-entry" key={log.ID}>
                <div className="log-status success"></div>
                <div className="log-details">
                  <div className="log-action">{log.Accion}</div>
                  <div className="log-user">👤 {log.nombre || log.UsuarioID}</div>
                  <div className="log-description">ID: {log.ID}</div>
                </div>
                <div className="log-timestamp">{log.Fecha} {log.Hora}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para Gestión de Pérdidas
const PerdidasComponent = () => {
  // Tipos de pérdida
  const tiposPerdida = [
    { value: 'vencido', label: 'Producto Vencido' },
    { value: 'danado', label: 'Producto Dañado' },
    { value: 'extraviado', label: 'Extravío' },
    { value: 'robo', label: 'Robo' },
  ];

  const statusBadge = {
    vencido: 'status-vencido',
    danado: 'status-danado',
    extraviado: 'status-extravio',
    robo: 'status-extravio',
  };

  // Estados principales
  const [tab, setTab] = useState(0);
  const [productos, setProductos] = useState([]);
  const [perdidas, setPerdidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    producto: '', cantidad: 1, lote: '', tipo: '', fecha: '', valor: '', motivo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('month');
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Funciones auxiliares
  const formatFecha = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES');
  };

  const formatMoneda = (valor) => {
    return `$${valor.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
  };
  // Función para filtrar por período
  const filtrarPorPeriodo = (items) => {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];
    
    return items.filter(item => {
      const fechaItem = new Date(item.Fecha);
      
      switch (filtroPeriodo) {
        case 'today':
          return item.Fecha.split('T')[0] === fechaHoy;
        case 'week':
          const semanaAtras = new Date(hoy);
          semanaAtras.setDate(hoy.getDate() - 7);
          return fechaItem >= semanaAtras && fechaItem <= hoy;
        case 'month':
          const mesAtras = new Date(hoy);
          mesAtras.setMonth(hoy.getMonth() - 1);
          return fechaItem >= mesAtras && fechaItem <= hoy;
        case 'year':
          const añoAtras = new Date(hoy);
          añoAtras.setFullYear(hoy.getFullYear() - 1);
          return fechaItem >= añoAtras && fechaItem <= hoy;
        default:
          return true;
      }
    });
  };

  // Estadísticas usando datos del backend
  const totalPerdidos = perdidas.reduce((acc, p) => acc + parseInt(p.Cantidad), 0);
  const totalVencidos = perdidas.filter(p => p.TipoPerdida === 'vencido').reduce((acc, p) => acc + parseInt(p.Cantidad), 0);
  const totalDanados = perdidas.filter(p => p.TipoPerdida === 'danado').reduce((acc, p) => acc + parseInt(p.Cantidad), 0);
  const valorTotal = perdidas.reduce((acc, p) => acc + parseFloat(p.ValorTotal), 0);
  
  // Pérdidas filtradas por período
  const perdidasFiltradas = filtrarPorPeriodo(perdidas);
  const perdidasVencidas = filtrarPorPeriodo(perdidas.filter(p => p.tipo_perdida === 'vencido'));

  // Handlers
  const handleTab = idx => {
    setTab(idx);
    setError('');
    setSuccess('');
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleProductoChange = e => {
    const id = parseInt(e.target.value);
    const producto = productos.find(p => p.ID === id);
    setForm(f => ({
      ...f,
      producto: id,
      valor: producto ? producto.Precio_Venta || '' : '',
    }));
    setError('');
    setSuccess('');
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.producto || !form.cantidad || !form.lote || !form.tipo || !form.fecha || !form.valor) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    
    const prod = productos.find(p => p.ID === parseInt(form.producto));
    if (!prod) {
      setError('Producto no encontrado.');
      return;
    }
    
    if (parseInt(form.cantidad) > prod.Stock) {
      setError('La cantidad excede el stock disponible.');
      return;
    }
    
    try {
      // Preparar datos para el backend
      const perdidaData = {
        ProductoID: parseInt(form.producto),
        Cantidad: parseInt(form.cantidad),
        TipoPerdida: form.tipo,
        Fecha: form.fecha,
        Hora: new Date().toTimeString().split(' ')[0],
        Lote: form.lote,
        ValorUnitario: parseFloat(form.valor),
        Motivo: form.motivo
      };
      
      await api.post('/perdidas', perdidaData);
      
      // Recargar datos
      const perdidasRes = await api.get('/perdidas');
      setPerdidas(perdidasRes.data);
      
      setForm({ producto: '', cantidad: 1, lote: '', tipo: '', fecha: '', valor: '', motivo: '' });
      setSuccess('¡Pérdida registrada exitosamente!');
    } catch (err) {
      console.error('Error registrando pérdida:', err);
      setError('Error al registrar pérdida: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta pérdida?')) return;
    
    try {
      await api.delete(`/perdidas/${id}`);
      
      // Recargar datos
      const perdidasRes = await api.get('/perdidas');
      setPerdidas(perdidasRes.data);
      
      setSuccess('Registro eliminado exitosamente.');
      setError('');
    } catch (err) {
      console.error('Error eliminando pérdida:', err);
      setError('Error al eliminar pérdida: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditClick = perdida => {
    setEditData({ ...perdida });
    setEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(ed => ({ ...ed, [name]: value }));
  };

  const handleEditProductoChange = e => {
    const id = parseInt(e.target.value);
    setEditData(ed => ({
      ...ed,
      id_producto: id,
      nombre_producto: id ? productos.find(p => p.id === id)?.nombre || '' : '',
      valor_unitario: id ? productos.find(p => p.id === id)?.valor_unitario || '' : '',
    }));
  };

  const handleEditSave = e => {
    e.preventDefault();
    if (!editData.id_producto || !editData.cantidad || !editData.lote || !editData.tipo_perdida || !editData.fecha || !editData.valor_unitario) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    
    const prod = productos.find(p => p.id === parseInt(editData.id_producto));
    if (!prod) {
      setError('Producto no encontrado.');
      return;
    }
    
    const original = perdidas.find(p => p.id === editData.id);
    const diff = parseInt(editData.cantidad) - original.cantidad;
    if (diff > 0 && diff > prod.stock) {
      setError('La cantidad excede el stock disponible.');
      return;
    }
    
    setProductos(ps => ps.map(p => {
      if (p.id === prod.id) {
        return { ...p, stock: p.stock - diff };
      }
      if (p.id === original.id_producto && prod.id !== original.id_producto) {
        return { ...p, stock: p.stock + original.cantidad };
      }
      return p;
    }));
    
    setPerdidas(ps => ps.map(p => p.id === editData.id ? {
      ...p,
      id_producto: parseInt(editData.id_producto),
      nombre_producto: prod.nombre,
      cantidad: parseInt(editData.cantidad),
      lote: editData.lote,
      tipo_perdida: editData.tipo_perdida,
      fecha: editData.fecha,
      valor_unitario: parseFloat(editData.valor_unitario),
      motivo: editData.motivo,
      valor_total: parseFloat(editData.valor_unitario) * parseInt(editData.cantidad),
    } : p));
    
    setEditModal(false);
    setEditData(null);
    setSuccess('Registro editado exitosamente.');
    setError('');
  };

  const handleEditCancel = () => {
    setEditModal(false);
    setEditData(null);
    setError('');
  };

  // Cargar datos del backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productosRes, perdidasRes] = await Promise.all([
          getProductos(),
          api.get('/perdidas')
        ]);
        
        setProductos(productosRes);
        setPerdidas(perdidasRes.data);
        setError('');
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) return <div className="loading">Cargando datos de pérdidas...</div>;

  return (
    <div className="perdidas-section">
      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card-perdidas red">
          <h3>{totalPerdidos}</h3>
          <p className="stat-title">Productos Perdidos</p>
        </div>
        <div className="stat-card-perdidas yellow">
          <h3>{totalVencidos}</h3>
          <p className="stat-title">Productos Vencidos</p>
        </div>
        <div className="stat-card-perdidas blue">
          <h3>{totalDanados}</h3>
          <p className="stat-title">Productos Dañados</p>
        </div>
        <div className="stat-card-perdidas green">
          <h3>{formatMoneda(valorTotal)}</h3>
          <p className="stat-title">Valor Total de Pérdidas</p>
        </div>
      </div>

      {/* Modal de edición */}
      {editModal && editData && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Editar Pérdida</h2>
            </div>
            <form onSubmit={handleEditSave} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto</label>
                  <select name="id_producto" value={editData.id_producto} onChange={handleEditProductoChange} required>
                    <option value="">Seleccione un producto</option>
                    {productos.map((p, idx) => (
                      <option key={p.ID || idx} value={p.ID}>
                        {p.Nombre ? `${p.Nombre} (Stock: ${typeof p.Stock === 'number' ? p.Stock : 0})` : `(Stock: ${typeof p.Stock === 'number' ? p.Stock : 0})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input 
                    type="number" 
                    name="cantidad" 
                    min="1" 
                    max={editData.id_producto ? productos.find(p => p.id === editData.id_producto)?.stock + (perdidas.find(p => p.id === editData.id)?.cantidad || 0) : ''} 
                    value={editData.cantidad} 
                    onChange={handleEditChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Número de Lote</label>
                  <input type="text" name="lote" value={editData.lote} onChange={handleEditChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Pérdida</label>
                  <select name="tipo_perdida" value={editData.tipo_perdida} onChange={handleEditChange} required>
                    <option value="">Seleccione el tipo de pérdida</option>
                    {tiposPerdida.map(tp => (
                      <option key={tp.value} value={tp.value}>{tp.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    name="fecha" 
                    value={editData.fecha} 
                    onChange={handleEditChange} 
                    required 
                    max={new Date().toISOString().split('T')[0]} 
                  />
                </div>
                <div className="form-group">
                  <label>Valor Unitario ($)</label>
                  <input 
                    type="number" 
                    name="valor_unitario" 
                    step="0.01" 
                    value={editData.valor_unitario} 
                    onChange={handleEditChange} 
                    required 
                    min="0.01" 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Motivo de la Pérdida</label>
                <textarea name="motivo" rows="3" value={editData.motivo} onChange={handleEditChange} required />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={handleEditCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs para gestión de pérdidas */}
      <div className="tab-container">
        <div className="tabs">
          <div className={`tab${tab === 0 ? ' active' : ''}`} onClick={() => handleTab(0)}>
            Registrar Pérdida
          </div>
          <div className={`tab${tab === 1 ? ' active' : ''}`} onClick={() => handleTab(1)}>
            Reporte de Productos Perdidos
          </div>
          <div className={`tab${tab === 2 ? ' active' : ''}`} onClick={() => handleTab(2)}>
            Reporte de Productos Vencidos
          </div>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {tab === 0 && (        <div className="card-bitacora">
          <div className="card-bitacora-header">Registrar Nueva Pérdida de Producto</div>
          <div className="card-bitacora-body">
            <form onSubmit={handleRegistrar} autoComplete="off">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto</label>
                  <select name="producto" value={form.producto} onChange={handleProductoChange} required>
                    <option value="">Seleccione un producto</option>
                    {productos.map((p, idx) => (
                      <option key={p.ID || idx} value={p.ID}>
                        {p.Nombre ? `${p.Nombre} (Stock: ${typeof p.Stock === 'number' ? p.Stock : 0})` : `(Stock: ${typeof p.Stock === 'number' ? p.Stock : 0})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input 
                    type="number" 
                    name="cantidad" 
                    min="1" 
                    max={form.producto ? productos.find(p => p.id === form.producto)?.stock : ''} 
                    value={form.cantidad} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Número de Lote</label>
                  <input 
                    type="text" 
                    name="lote" 
                    value={form.lote} 
                    onChange={handleFormChange} 
                    placeholder="Ingrese el número de lote" 
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Pérdida</label>
                  <select name="tipo" value={form.tipo} onChange={handleFormChange} required>
                    <option value="">Seleccione el tipo de pérdida</option>
                    {tiposPerdida.map(tp => (
                      <option key={tp.value} value={tp.value}>{tp.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    name="fecha" 
                    value={form.fecha} 
                    onChange={handleFormChange} 
                    required 
                    max={new Date().toISOString().split('T')[0]} 
                  />
                </div>
                <div className="form-group">
                  <label>Valor Unitario ($)</label>
                  <input 
                    type="number" 
                    name="valor" 
                    step="0.01" 
                    value={form.valor} 
                    onChange={handleFormChange} 
                    required 
                    min="0.01" 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Motivo de la Pérdida</label>
                <textarea 
                  name="motivo" 
                  rows="3" 
                  value={form.motivo} 
                  onChange={handleFormChange} 
                  placeholder="Describa el motivo de la pérdida" 
                  required 
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setForm({ producto: '', cantidad: 1, lote: '', tipo: '', fecha: '', valor: '', motivo: '' })}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">Registrar Pérdida</button>
              </div>
            </form>
          </div>
        </div>
      )}      {tab === 1 && (
        <div className="card-bitacora">
          <div className="card-bitacora-header">
            Reporte de Productos Perdidos
            <div className="filter-group">
              <label>Período:</label>
              <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
              </select>
              <button className="btn btn-secondary" type="button" disabled>Exportar</button>            </div>
          </div>
          <div className="card-bitacora-body">
            <div className="perdidas-reporte-table-wrapper">
              <table className="perdidas-reporte-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Lote</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Valor Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {perdidasFiltradas.length > 0 ? perdidasFiltradas.map(p => (
                    <tr key={p.ID}>
                      <td>{p.ID}</td>
                      <td>{p.ProductoNombre}</td>
                      <td>{p.Cantidad}</td>
                      <td>{p.Lote}</td>
                      <td>
                        <span className={`status-badge ${statusBadge[p.TipoPerdida]}`}>
                          {tiposPerdida.find(tp => tp.value === p.TipoPerdida)?.label || p.TipoPerdida}
                        </span>
                      </td>
                      <td>{formatFecha(p.Fecha)}</td>
                      <td>Bs {parseFloat(p.ValorTotal).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                      <td className="actions">
                        <button className="edit" title="Editar" onClick={() => handleEditClick(p)}>✏️</button>
                        <button className="delete" title="Eliminar" onClick={() => handleEliminar(p.ID)}>🗑️</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="8" style={{ textAlign: 'center' }}>No hay registros.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}      {tab === 2 && (
        <div className="card-bitacora">
          <div className="card-bitacora-header">
            Reporte de Productos Vencidos
            <div className="filter-group">
              <label>Período:</label>
              <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
              </select>              <button className="btn btn-secondary" type="button" disabled>Exportar</button>
            </div>
          </div>
          <div className="card-bitacora-body">
            <div className="perdidas-reporte-table-wrapper">
              <table className="perdidas-reporte-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Lote</th>
                    <th>Fecha</th>
                    <th>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {perdidasFiltradas.filter(p => p.tipo_perdida === 'vencido').length > 0 ? 
                    perdidasFiltradas.filter(p => p.tipo_perdida === 'vencido').map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nombre_producto}</td>
                        <td>{p.cantidad}</td>
                        <td>{p.lote}</td>
                        <td>{formatFecha(p.fecha)}</td>
                        <td>{formatMoneda(p.valor_total)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay productos vencidos.</td></tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}      {/* Gráfico placeholder */}
      <div className="card-bitacora">
        <div className="card-bitacora-header">Análisis de Pérdidas por Categoría</div><div className="card-bitacora-body">
          <div className="chart-container">
            <div className="chart-placeholder">[Gráfico de Pérdidas por Categoría y Tipo]</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitacoraPerdidas;
