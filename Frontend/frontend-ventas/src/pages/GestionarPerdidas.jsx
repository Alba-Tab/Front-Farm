import React, { useState, useEffect } from 'react';
import '../componentes/GestionarPerdidas.css';
import { getProductos } from '../api';

const tiposPerdida = [
  { value: 'vencido', label: 'Producto Vencido' },
  { value: 'danado', label: 'Producto Dañado' },
  { value: 'extravio', label: 'Extravío' },
  { value: 'robo', label: 'Robo' },
];

function formatFecha(fecha) {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES');
}

function formatMoneda(valor) {
  return `$${valor.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
}

const statusBadge = {
  vencido: 'status-vencido',
  danado: 'status-danado',
  extravio: 'status-extravio',
  robo: 'status-extravio',
};

// Página principal de gestión de pérdidas
export default function GestionarPerdidas() {
  // Estados principales
  const [tab, setTab] = useState(0);
  const [productos, setProductos] = useState([]);
  const [perdidas, setPerdidas] = useState([]);
  const [form, setForm] = useState({
    producto: '', cantidad: 1, lote: '', tipo: '', fecha: '', valor: '', motivo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('month');
  // Estados para edición
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Estadísticas
  const totalPerdidos = perdidas.reduce((acc, p) => acc + p.cantidad, 0);
  const totalVencidos = perdidas.filter(p => p.tipo_perdida === 'vencido').reduce((acc, p) => acc + p.cantidad, 0);
  const totalDanados = perdidas.filter(p => p.tipo_perdida === 'danado').reduce((acc, p) => acc + p.cantidad, 0);
  const valorTotal = perdidas.reduce((acc, p) => acc + p.valor_total, 0);

  // Filtros de reporte (mock)
  const perdidasFiltradas = perdidas;

  // Handlers de pestañas y formularios
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
    setForm(f => ({
      ...f,
      producto: id,
      valor: id ? productos.find(p => p.id === id)?.valor_unitario || '' : '',
    }));
    setError('');
    setSuccess('');
  };
  const handleRegistrar = e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.producto || !form.cantidad || !form.lote || !form.tipo || !form.fecha || !form.valor) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const prod = productos.find(p => p.id === parseInt(form.producto));
    if (!prod) {
      setError('Producto no encontrado.');
      return;
    }
    if (parseInt(form.cantidad) > prod.stock) {
      setError('La cantidad excede el stock disponible.');
      return;
    }
    setProductos(ps => ps.map(p => p.id === prod.id ? { ...p, stock: p.stock - parseInt(form.cantidad) } : p));
    const nuevaPerdida = {
      id: perdidas.length > 0 ? Math.max(...perdidas.map(p => p.id)) + 1 : 1,
      id_producto: prod.id,
      nombre_producto: prod.nombre,
      cantidad: parseInt(form.cantidad),
      lote: form.lote,
      tipo_perdida: form.tipo,
      fecha: form.fecha,
      valor_unitario: parseFloat(form.valor),
      motivo: form.motivo,
      valor_total: parseFloat(form.valor) * parseInt(form.cantidad),
    };
    setPerdidas([nuevaPerdida, ...perdidas]);
    setForm({ producto: '', cantidad: 1, lote: '', tipo: '', fecha: '', valor: '', motivo: '' });
    setSuccess('¡Pérdida registrada exitosamente!');
  };
  // Eliminar registro
  const handleEliminar = id => {
    const perdida = perdidas.find(p => p.id === id);
    if (perdida) {
      setProductos(ps => ps.map(p => p.id === perdida.id_producto ? { ...p, stock: p.stock + perdida.cantidad } : p));
    }
    setPerdidas(perdidas.filter(p => p.id !== id));
    setSuccess('Registro eliminado.');
    setError('');
  };
  // Editar registro
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

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosAPI = await getProductos();
        setProductos(productosAPI);
      } catch (err) {
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  return (
    <div className="gestionar-perdidas-main">
      <div className="top-bar">
        <h1>Gestión de Pérdida de Productos</h1>
      </div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card red">
          <h3>{totalPerdidos}</h3>
          <p className="stat-title">Productos Perdidos</p>
        </div>
        <div className="stat-card yellow">
          <h3>{totalVencidos}</h3>
          <p className="stat-title">Productos Vencidos</p>
        </div>
        <div className="stat-card blue">
          <h3>{totalDanados}</h3>
          <p className="stat-title">Productos Dañados</p>
        </div>
        <div className="stat-card green">
          <h3>{formatMoneda(valorTotal)}</h3>
          <p className="stat-title">Valor Total de Pérdidas</p>
        </div>
      </div>

      {/* Modal de edición */}
      {editModal && editData && (
        <div className="modal-overlay">
          <div className="modal" style={{zIndex: 10001, display: 'block'}}>
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
                      <option key={p.id || idx} value={p.id}>
                        {p.nombre ? `${p.nombre} (Stock: ${typeof p.stock === 'number' ? p.stock : 0})` : `(Stock: ${typeof p.stock === 'number' ? p.stock : 0})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input type="number" name="cantidad" min="1" max={editData.id_producto ? productos.find(p => p.id === editData.id_producto)?.stock + (perdidas.find(p => p.id === editData.id)?.cantidad || 0) : ''} value={editData.cantidad} onChange={handleEditChange} required />
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
                  <input type="date" name="fecha" value={editData.fecha} onChange={handleEditChange} required max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Valor Unitario ($)</label>
                  <input type="number" name="valor_unitario" step="0.01" value={editData.valor_unitario} onChange={handleEditChange} required min="0.01" />
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

      {/* Tabs */}
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

      {/* Tab Contents */}
      {tab === 0 && (        <div className="card-perdidas">
          <div className="card-perdidas-header">Registrar Nueva Pérdida de Producto</div>
          <div className="card-perdidas-body">
            <form onSubmit={handleRegistrar} autoComplete="off">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto</label>
                  <select name="producto" value={form.producto} onChange={handleProductoChange} required>
                    <option value="">Seleccione un producto</option>
                    {productos.map((p, idx) => (
                      <option key={p.id || idx} value={p.id}>
                        {p.nombre ? `${p.nombre} (Stock: ${typeof p.stock === 'number' ? p.stock : 0})` : `(Stock: ${typeof p.stock === 'number' ? p.stock : 0})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input type="number" name="cantidad" min="1" max={form.producto ? productos.find(p => p.id === form.producto)?.stock : ''} value={form.cantidad} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Número de Lote</label>
                  <input type="text" name="lote" value={form.lote} onChange={handleFormChange} placeholder="Ingrese el número de lote" required />
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
                  <input type="date" name="fecha" value={form.fecha} onChange={handleFormChange} required max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Valor Unitario ($)</label>
                  <input type="number" name="valor" step="0.01" value={form.valor} onChange={handleFormChange} required min="0.01" />
                </div>
              </div>
              <div className="form-group">
                <label>Motivo de la Pérdida</label>
                <textarea name="motivo" rows="3" value={form.motivo} onChange={handleFormChange} placeholder="Describa el motivo de la pérdida" required />
              </div>
              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setForm({ producto: '', cantidad: 1, lote: '', tipo: '', fecha: '', valor: '', motivo: '' })}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Pérdida</button>
              </div>
            </form>
          </div>
        </div>
      )}      {tab === 1 && (
        <div className="card-perdidas">
          <div className="card-perdidas-header">
            Reporte de Productos Perdidos
            <div className="filter-group">
              <label>Período:</label>
              <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}>
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
              </select>
              <button className="btn btn-secondary" type="button" disabled>Exportar</button>
            </div>
          </div>          <div className="card-perdidas-body">
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
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nombre_producto}</td>
                      <td>{p.cantidad}</td>
                      <td>{p.lote}</td>
                      <td><span className={`status-badge ${statusBadge[p.tipo_perdida]}`}>{tiposPerdida.find(tp => tp.value === p.tipo_perdida)?.label || p.tipo_perdida}</span></td>
                      <td>{formatFecha(p.fecha)}</td>
                      <td>{formatMoneda(p.valor_total)}</td>
                      <td className="actions">
                        <button className="edit" title="Editar" onClick={() => handleEditClick(p)}>✏️</button>
                        <button className="delete" title="Eliminar" onClick={() => handleEliminar(p.id)}>🗑️</button>
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
      )}

      {tab === 2 && (        <div className="card-perdidas">
          <div className="card-perdidas-header">
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
          <div className="card-perdidas-body">
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
                  {perdidasFiltradas.filter(p => p.tipo_perdida === 'vencido').length > 0 ? perdidasFiltradas.filter(p => p.tipo_perdida === 'vencido').map(p => (
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
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}      {/* Gráfico (placeholder) */}
      <div className="card-perdidas">
        <div className="card-perdidas-header">Análisis de Pérdidas por Categoría</div>
        <div className="card-perdidas-body">
          <div className="chart-container">
            <div className="chart-placeholder">[Gráfico de Pérdidas por Categoría y Tipo]</div>
          </div>
        </div>
      </div>
    </div>
  );
}
