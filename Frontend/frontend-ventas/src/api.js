import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Interceptor para adjuntar el token JWT si existe
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const login = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

// --- Productos ---
export const getProductos = async () => {
  const res = await api.get('/productos');
  return res.data.map(p => ({
    id: p.ID,
    nombre: p.Nombre,
    descripcion: p.Descripcion,
    forma_farmaceutica: p.Forma_Farmaceutica,
    concentracion: p.Concentracion,
    via_administracion: p.Via_Administracion,
    precio_compra: Number(p.Precio_Compra) || 0,
    precio_venta: Number(p.Precio_Venta) || 0,
    stock: Number(p.Stock) || 0,
    receta: Boolean(p.Receta),
    marca: p.MarcaNombre || '',
    categoria: p.CategoriaNombre || '',
    marca_id: p.MarcaID || '',
    categoria_id: p.CategoriaID || '',
    activo: Boolean(p.Activo)
  }));
};

// Crear producto
export const createProducto = async (data) => {
  return api.post('/productos', data);
};

// Actualizar producto
export const updateProducto = async (id, data) => {
  return api.put(`/productos/${id}`, data);
};

// Eliminar producto
export const deleteProducto = async (id) => {
  return api.delete(`/productos/${id}`);
};

// --- Clientes ---
export const getClientes = async () => {
  const res = await api.get('/clientes');
  return res.data.map(c => ({
    id_cliente: c.ID,
    nombre_completo: c.Nombre,
    telefono: c.Telefono || '',
    email: c.Email || '',
    domicilio: c.Domicilio || ''
  }));
};

export const deleteCliente = async (id) => {
  return api.delete(`/clientes/${id}`);
};

export const updateCliente = async (id, data) => {
  return api.put(`/clientes/${id}`, data);
};

// --- Usuarios ---
export const getUsuarios = async () => {
  const res = await api.get('/usuarios');
  return res.data.map(u => ({
    id: u.id,
    usuario: u.username,
    rol: u.role,
    nombre: u.nombre,
    activo: true
  }));
};

// --- Roles ---
export const getRoles = async () => {
  const res = await api.get('/roles');
  return res.data.map(r => ({
    id: r.ID,
    nombre: r.Nombre,
    descripcion: r.Descripcion
  }));
};

// --- Proveedores ---
export const getProveedores = async () => {
  const res = await api.get('/proveedores');
  return res.data.map(p => ({
    id: p.ID,
    nombre: p.Nombre,
    direccion: p.Dirección,
    telefono: p.Telefono,
    email: p.E_mail
  }));
};

// --- Compras ---
export const getCompras = async () => {
  const res = await api.get('/compras');
  return res.data.map(c => ({
    id: c.ID,
    fecha: c.Fecha,
    hora: c.Hora,
    monto_total: Number(c.Monto_Total) || 0,
    usuario: c.UsuarioID,
    proveedor: c.ProveedorID
  }));
};

// --- Categorías ---
export const getCategorias = async () => {
  const res = await api.get('/categorias');
  return res.data.map(c => ({
    id: c.ID,
    nombre: c.Nombre
  }));
};

// --- Marcas ---
export const getMarcas = async () => {
  const res = await api.get('/marcas');
  return res.data.map(m => ({
    id: m.ID,
    nombre: m.Nombre
  }));
};

// --- Facturas ---
export const createFactura = async (factura) => {
  return await api.post('/facturas', factura);
};

// --- Dashboard Metrics ---
export const getVentasDelDia = async () => {
  const res = await api.get('/facturas/dashboard/ventas-dia');
  return res.data;
};

export const getVentasPorVendedorHoy = async () => {
  const res = await api.get('/facturas/dashboard/ventas-vendedor-hoy');
  return res.data;
};

export const getCrecimientoMensual = async () => {
  const res = await api.get('/facturas/dashboard/crecimiento-mensual');
  return res.data;
};

export const getProductosStockCritico = async () => {
  const res = await api.get('/productos/stock-critico');
  return res.data;
};

// --- Formas Farmacéuticas y Vías de Administración ---
export const getFormasFarmaceuticas = async () => {
  const res = await api.get('/productos/formas-farmaceuticas');
  return res.data;
};

export const getViasAdministracion = async () => {
  const res = await api.get('/productos/vias-administracion');
  return res.data;
};

// --- Métodos de Pago ---
export const getMetodosPago = async () => {
  const res = await api.get('/metodos-pago');
  return res.data;
};

// --- Bitácora ---
export const getBitacora = async () => {
  const res = await api.get('/bitacora');
  return res.data;
};

// Puedes agregar más funciones para otros endpoints según sea necesario

export default api; 