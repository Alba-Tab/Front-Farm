import React, { useState, useEffect } from 'react';
import Button from '../componentes/Button';
import '../componentes/RegistrarProducto.css';
import { getProductos, createProducto, updateProducto, getMarcas, getCategorias, getFormasFarmaceuticas, getViasAdministracion } from '../api';
import { useNavigate } from 'react-router-dom';

const initialState = {
  ID: '',
  Nombre: '',
  Descripcion: '',
  Forma_Farmaceutica: '',
  Concentracion: '',
  Via_Administracion: '',
  Oferta: false,
  Precio_Compra: '',
  Precio_Venta: '',
  Stock: '',
  Receta: false,
  MarcaID: '',
  CategoriaID: '',
};

const RegistrarProducto = () => {
  const [producto, setProducto] = useState(initialState);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [opcionesForma, setOpcionesForma] = useState([]);
  const [opcionesVia, setOpcionesVia] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProductos().then(setProductos).catch(() => setProductos([]));
    getMarcas().then(setMarcas).catch(() => setMarcas([]));
    getCategorias().then(setCategorias).catch(() => setCategorias([]));
    getFormasFarmaceuticas().then(setOpcionesForma).catch(() => setOpcionesForma([]));
    getViasAdministracion().then(setOpcionesVia).catch(() => setOpcionesVia([]));
  }, []);

  // Autocompletar al escribir ID
  useEffect(() => {
    if (!producto.ID) {
      setModoEdicion(false);
      setProducto(initialState);
      return;
    }
    const prod = productos.find(p => String(p.id) === String(producto.ID));
    if (prod) {
      setProducto({
        ID: prod.id,
        Nombre: prod.nombre,
        Descripcion: prod.descripcion,
        Forma_Farmaceutica: prod.forma_farmaceutica || '',
        Concentracion: prod.concentracion || '',
        Via_Administracion: prod.via_administracion || '',
        Oferta: prod.oferta || false,
        Precio_Compra: prod.precio_compra || '',
        Precio_Venta: prod.precio_venta || '',
        Stock: prod.stock || '',
        Receta: prod.receta || false,
        MarcaID: prod.marca_id || prod.MarcaID || '',
        CategoriaID: prod.categoria_id || prod.CategoriaID || ''
      });
      setModoEdicion(true);
    } else {
      setModoEdicion(false);
      setProducto(p => ({ ...initialState, ID: p.ID }));
    }
  }, [producto.ID, productos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProducto({
      ...producto,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepara los datos asegurando tipos y valores válidos
    const data = {
      Nombre: producto.Nombre,
      Descripcion: producto.Descripcion,
      Forma_Farmaceutica: producto.Forma_Farmaceutica,
      Concentracion: producto.Concentracion,
      Via_Administracion: producto.Via_Administracion,
      Oferta: Boolean(producto.Oferta),
      Precio_Compra: producto.Precio_Compra !== '' ? Number(producto.Precio_Compra) : null,
      Precio_Venta: producto.Precio_Venta !== '' ? Number(producto.Precio_Venta) : null,
      Stock: producto.Stock !== '' ? Number(producto.Stock) : null,
      Receta: Boolean(producto.Receta),
      MarcaID: producto.MarcaID !== '' ? Number(producto.MarcaID) : null,
      CategoriaID: producto.CategoriaID !== '' ? Number(producto.CategoriaID) : null
    };
    try {
      if (modoEdicion) {
        await updateProducto(producto.ID, data);
        setAlerta('Producto actualizado correctamente');
      } else {
        await createProducto(data);
        setAlerta('Producto registrado correctamente');
        // Refrescar la lista de productos tras registrar uno nuevo
        const productosAPI = await getProductos();
        setProductos(productosAPI);
      }
      setTimeout(() => setAlerta(null), 2500);
      setProducto(initialState);
      setModoEdicion(false);
    } catch (err) {
      setAlerta(err?.response?.data?.message || 'Error al guardar producto');
      setTimeout(() => setAlerta(null), 3500);
    }
  };

  return (
    <div className="registrar-producto-container">
      <Button className="registrar-producto-btn cancelar" type="button" onClick={() => navigate('/inventario/gestionar-productos')} style={{marginBottom:'1.2rem'}}>Atrás</Button>
      <h2 className="registrar-producto-title">{modoEdicion ? 'ACTUALIZAR PRODUCTO' : 'REGISTRAR PRODUCTO'}</h2>
      <form className="registrar-producto-form" onSubmit={handleSubmit}>
        <div className="registrar-producto-buscar-row">
          <input className="registrar-producto-input registrar-producto-input-id" name="ID" type="text" placeholder="ID (para actualizar)" value={producto.ID} onChange={handleChange} style={{maxWidth:320, fontSize:'1.13rem', letterSpacing:'1px'}} />
          <span>Dejar vacío para registrar nuevo</span>
        </div>
        <input className="registrar-producto-input" name="Nombre" type="text" placeholder="Nombre del producto" value={producto.Nombre} onChange={handleChange} required style={{gridColumn:'1/3'}} />
        <input className="registrar-producto-input" name="Descripcion" type="text" placeholder="Descripción" value={producto.Descripcion} onChange={handleChange} style={{gridColumn:'1/3'}} />
        <select className="registrar-producto-select" name="Forma_Farmaceutica" value={producto.Forma_Farmaceutica} onChange={handleChange} required>
          <option value="">Forma Farmacéutica</option>
          {opcionesForma.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <input className="registrar-producto-input" name="Concentracion" type="text" placeholder="Concentración (ej: 500mg)" value={producto.Concentracion} onChange={handleChange} />
        <select className="registrar-producto-select" name="Via_Administracion" value={producto.Via_Administracion} onChange={handleChange} required>
          <option value="">Vía de Administración</option>
          {opcionesVia.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <div style={{display:'flex',gap:'1.2rem',alignItems:'center',gridColumn:'1/3',margin:'0.2rem 0 0.5rem 0'}}>
          <label className="registrar-producto-switch">
            <input type="checkbox" name="Oferta" checked={producto.Oferta} onChange={handleChange} />
            <span className="registrar-producto-slider"></span>
            <span className="registrar-producto-switch-label">Oferta</span>
          </label>
          <label className="registrar-producto-switch">
            <input type="checkbox" name="Receta" checked={producto.Receta} onChange={handleChange} />
            <span className="registrar-producto-slider"></span>
            <span className="registrar-producto-switch-label">Requiere Receta</span>
          </label>
        </div>
        <input className="registrar-producto-input" name="Precio_Compra" type="number" step="0.01" placeholder="Precio Compra (Bs)" value={producto.Precio_Compra} onChange={handleChange} required />
        <input className="registrar-producto-input" name="Precio_Venta" type="number" step="0.01" placeholder="Precio Venta (Bs)" value={producto.Precio_Venta} onChange={handleChange} required />
        <input className="registrar-producto-input" name="Stock" type="number" placeholder="Stock" value={producto.Stock} onChange={handleChange} required />
        <select className="registrar-producto-select" name="MarcaID" value={producto.MarcaID} onChange={handleChange} required>
          <option value="">Marca</option>
          {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <select className="registrar-producto-select" name="CategoriaID" value={producto.CategoriaID} onChange={handleChange} required>
          <option value="">Categoría</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <div className="registrar-producto-actions">
          <Button className="registrar-producto-btn" type="submit" disabled={false}>{modoEdicion ? 'Actualizar' : 'Registrar'}</Button>
          <Button className="registrar-producto-btn cancelar" type="button" onClick={() => { setProducto(initialState); setModoEdicion(false); }}>Limpiar</Button>
        </div>
        {alerta && <div className="registrar-producto-alert">{alerta}</div>}
      </form>
    </div>
  );
};

export default RegistrarProducto;
