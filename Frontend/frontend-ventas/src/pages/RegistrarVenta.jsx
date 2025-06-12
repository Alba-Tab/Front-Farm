import Button from "../componentes/Button";
import { useState, useEffect } from "react";
import "../componentes/RegistrarVenta.css";
import Factura from './Factura';
import { getClientes, getProductos, updateProducto, getMetodosPago } from '../api';
import { FaMoneyBillWave, FaCreditCard, FaUniversity, FaQrcode, FaExchangeAlt, FaEllipsisH } from 'react-icons/fa';

const RegistrarVenta = () => {
  const [cliente, setCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoActual, setProductoActual] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoPagoID, setMetodoPagoID] = useState('');
  const [mostrarOtros, setMostrarOtros] = useState(false);
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [tieneReceta, setTieneReceta] = useState(false);
  const [mostrarFactura, setMostrarFactura] = useState(false);
  const [ventaGenerada, setVentaGenerada] = useState(null);
  const [clienteGenerado, setClienteGenerado] = useState(null);
  const [usuarioID, setUsuarioID] = useState(null);
  const [codigoReceta, setCodigoReceta] = useState('');

  const iconosMetodo = {
    'Efectivo': <FaMoneyBillWave size={22} style={{marginRight:8}} />, 
    'Tarjeta': <FaCreditCard size={22} style={{marginRight:8}} />, 
    'Tarjeta de Crédito': <FaCreditCard size={22} style={{marginRight:8}} />, 
    'Tarjeta de Débito': <FaCreditCard size={22} style={{marginRight:8}} />, 
    'Transferencia': <FaUniversity size={22} style={{marginRight:8}} />, 
    'Transferencia Bancaria': <FaUniversity size={22} style={{marginRight:8}} />, 
    'QR': <FaQrcode size={22} style={{marginRight:8}} />, 
    'Mixto': <FaExchangeAlt size={22} style={{marginRight:8}} />
  };

  useEffect(() => {
    // Obtener clientes, productos y métodos de pago desde la API
    const fetchData = async () => {
      try {
        const clientesAPI = await getClientes();
        setClientes(clientesAPI);
        const productosAPI = await getProductos();
        setProductos(productosAPI);
        const metodos = await getMetodosPago();
        setMetodosPago(metodos);
        if (metodos.length > 0) setMetodoPagoID(metodos[0].ID);
        // Obtener usuarioID del localStorage (o token)
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) setUsuarioID(user.id);
        // Si tienes el usuarioID en el token, aquí puedes decodificarlo
      } catch (err) {
        setAlertMessage('Error al cargar datos de la API');
        setAlertType('error');
      }
    };
    fetchData();
  }, []);

  const handleAddProducto = () => {
    if (!productoActual) {
      mostrarAlerta("Debe seleccionar un producto", "warning");
      return;
    }
    const productoSeleccionado = productos.find((p) => p.id === parseInt(productoActual));
    if (!productoSeleccionado) return;
    if (productoSeleccionado.stock < cantidad) {
      mostrarAlerta(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`, "error");
      return;
    }
    if (productoSeleccionado.receta && !codigoReceta.trim()) {
      mostrarAlerta("Debe ingresar el código de receta para este producto", "warning");
      return;
    }
    const productoExistente = productosSeleccionados.find((p) => p.id === productoSeleccionado.id);
    if (productoExistente) {
      if (productoExistente.cantidad + cantidad > productoSeleccionado.stock) {
        mostrarAlerta(`Stock insuficiente para añadir ${cantidad} unidades más`, "error");
        return;
      }
      const nuevosProductos = productosSeleccionados.map((p) =>
        p.id === productoSeleccionado.id
          ? { ...p, cantidad: p.cantidad + cantidad, subtotal: (p.cantidad + cantidad) * p.precio }
          : p
      );
      setProductosSeleccionados(nuevosProductos);
    } else {
      setProductosSeleccionados([
        ...productosSeleccionados,
        {
          id: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          precio: productoSeleccionado.precio_venta,
          cantidad: cantidad,
          subtotal: productoSeleccionado.precio_venta * cantidad,
          recetaCodigo: productoSeleccionado.receta ? codigoReceta.trim() : undefined,
          requiereReceta: productoSeleccionado.receta
        },
      ]);
    }
    setProductoActual("");
    setCantidad(1);
    setCodigoReceta("");
    mostrarAlerta("Producto añadido correctamente", "success");
  };

  const handleRemoveProducto = (id) => {
    setProductosSeleccionados(productosSeleccionados.filter((p) => p.id !== id));
    mostrarAlerta("Producto eliminado", "info");
  };

  const mostrarAlerta = (mensaje, tipo) => {
    setAlertMessage(mensaje);
    setAlertType(tipo);
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!cliente) {
      mostrarAlerta("Debe seleccionar un cliente", "warning");
      return;
    }
    if (productosSeleccionados.length === 0) {
      mostrarAlerta("Debe agregar al menos un producto", "warning");
      return;
    }
    // Buscar cliente por nombre o documento (más robusto)
    let clienteObj = clientes.find(c =>
      cliente === `${c.nombre_completo} - ${c.ci}` ||
      cliente === c.nombre_completo ||
      cliente === c.ci
    );
    if (!clienteObj) {
      // Si no se encuentra, usar el cliente genérico 'Mostrador'
      clienteObj = clientes.find(c => c.nombre_completo === 'Mostrador');
    }
    setVentaGenerada({
      productos: productosSeleccionados,
      Monto_Total: calcularTotal(),
      Descuento: 0,
      fecha: new Date().toLocaleString()
    });
    setClienteGenerado({
      ID: clienteObj.id_cliente || clienteObj.ID,
      Nombre: clienteObj.nombre_completo || clienteObj.Nombre || 'N/A',
      Telefono: clienteObj.telefono || clienteObj.Telefono || 'N/A',
      Email: clienteObj.email || clienteObj.Email || 'N/A'
    });
    setMostrarFactura(true);
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, p) => total + p.subtotal, 0).toFixed(2);
  };

  const handleMetodoPago = (id) => {
    setMetodoPagoID(id);
    setMostrarOtros(false);
  };

  function getIconoMetodo(nombre) {
    if (!nombre) return <FaEllipsisH size={22} style={{marginRight:8}} />;
    const normalizado = nombre.normalize('NFD').replace(/[^\w\s]/g, '').toLowerCase();
    if (normalizado.includes('efectivo')) return <FaMoneyBillWave size={32} style={{marginRight:8}} />;
    if (normalizado.includes('tarjeta')) return <FaCreditCard size={22} style={{marginRight:8}} />;
    if (normalizado.includes('transfer')) return <FaUniversity size={22} style={{marginRight:8}} />;
    if (normalizado.includes('qr')) return <FaQrcode size={22} style={{marginRight:8}} />;
    if (normalizado.includes('mixto')) return <FaExchangeAlt size={22} style={{marginRight:8}} />;
    return <FaEllipsisH size={22} style={{marginRight:8}} />;
  }

  if (mostrarFactura) {
    return <Factura venta={{...ventaGenerada, metodoPagoID}} cliente={clienteGenerado} usuarioID={usuarioID} onVolver={() => setMostrarFactura(false)} />;
  }

  return (
    <div className="venta-container venta-container-encuadre">
      <h2 className="venta-title">REGISTRO DE VENTA</h2>
      {/* Información del Cliente */}
      <div className="venta-card venta-card-cliente">
        <div className="venta-card-header">Información del Cliente</div>
        <div className="venta-card-body venta-cliente-row">
          <input
            className="venta-input"
            placeholder="Buscar por nombre o DNI..."
            value={cliente || ''}
            onChange={e => setCliente(e.target.value)}
            list="clientes-list"
          />
          <datalist id="clientes-list">
            {clientes.filter(c =>
              (c.nombre_completo || '').toLowerCase().includes((cliente || '').toLowerCase()) ||
              (c.ci || '').includes(cliente || '')
            ).map(c => (
              <option key={c.id_cliente} value={`${c.nombre_completo} - ${c.ci}`} />
            ))}
          </datalist>
          <input
            className="venta-input"
            placeholder="DNI"
            value={(function() {
              const c = clientes.find(c =>
                cliente === `${c.nombre_completo} - ${c.ci}` ||
                cliente === c.nombre_completo ||
                cliente === c.ci
              );
              return c && (c.ci || c.CI) ? (c.ci || c.CI) : "";
            })()}
            disabled
          />
          <input
            className="venta-input"
            placeholder="Tel: (011) 4567-8901"
            value={(function() {
              const c = clientes.find(c =>
                cliente === `${c.nombre_completo} - ${c.ci}` ||
                cliente === c.nombre_completo ||
                cliente === c.ci
              );
              return c && c.telefono ? c.telefono : "";
            })()}
            disabled
          />
        </div>
      </div>
      {/* Productos */}
      <div className="venta-card venta-card-productos">
        <div className="venta-card-header">Productos</div>
        <div className="venta-card-body">
          <div className="venta-producto-row">
            <select
              className="venta-input"
              value={productoActual}
              onChange={e => setProductoActual(e.target.value)}
            >
              <option value="">Seleccionar producto...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (Stock: {p.stock})
                </option>
              ))}
            </select>
            <input
              className="venta-input"
              type="number"
              min="1"
              max={
                productoActual
                  ? productos.find((p) => p.id === parseInt(productoActual))?.stock || 1
                  : 1
              }
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
              style={{ width: "80px", marginLeft: "8px" }}
              placeholder="Cantidad"
            />
            {productoActual && productos.find((p) => p.id === parseInt(productoActual))?.receta && (
              <input
                className="venta-input"
                type="text"
                placeholder="Código de receta"
                value={codigoReceta}
                onChange={e => setCodigoReceta(e.target.value)}
                style={{ width: "160px", marginLeft: "8px" }}
              />
            )}
            <Button className="venta-btn venta-btn-agregar" onClick={handleAddProducto}>Agregar Producto</Button>
          </div>
          <div className="venta-table-wrapper">
            <table className="venta-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {
                  productosSeleccionados.length === 0
                    ? [
                        <tr key="empty">
                          <td colSpan="6" className="venta-table-empty">No hay productos seleccionados</td>
                        </tr>
                      ]
                    : productosSeleccionados.map((p, idx) => (
                        <tr key={p.id}>
                          <td>{`P00${idx + 1}`}</td>
                          <td>{p.nombre}</td>
                          <td>{p.cantidad}</td>
                          <td>${(p.precio || 0).toLocaleString()}</td>
                          <td>${((p.precio || 0) * p.cantidad).toLocaleString()}</td>
                          <td>
                            <Button className="venta-btn venta-btn-eliminar" onClick={() => handleRemoveProducto(p.id)}>X</Button>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Pago */}
      <div className="venta-card venta-card-pago">
        <div className="venta-card-header">Pago</div>
        <div className="venta-card-body venta-pago-row">
          <div className="venta-pago-metodo">
            <label className="venta-pago-label">Método de Pago:</label>
            <select
              className="venta-input"
              value={metodoPagoID}
              onChange={e => setMetodoPagoID(Number(e.target.value))}
              style={{padding: '0.7rem', borderRadius: '0.7rem', border: '1.5px solid #22c55e', fontWeight: 600, fontSize: '1.08rem', background: '#fff', color: '#2563eb', minWidth: 180}}
            >
              {metodosPago.map(mp => (
                <option key={mp.ID} value={mp.ID}>{mp.Nombre}</option>
              ))}
            </select>
          </div>
          <div className="venta-pago-resumen">
            <div className="venta-pago-item">Subtotal: <span>${calcularTotal()}</span></div>
            <div className="venta-pago-total">TOTAL: <span>${calcularTotal()}</span></div>
          </div>
        </div>
      </div>
      {/* Botones */}
      <div className="venta-btns-row">
        <Button className="venta-btn venta-btn-cancelar" onClick={() => {
          setCliente("");
          setProductosSeleccionados([]);
          setProductoActual("");
          setCantidad(1);
          setMetodoPagoID('');
          setMostrarOtros(false);
          setRequiereFactura(false);
          setTieneReceta(false);
        }}>Cancelar Venta</Button>
        <Button className="venta-btn venta-btn-registrar" onClick={handleSubmit} disabled={productosSeleccionados.length === 0 || !cliente}>Registrar Venta</Button>
      </div>
    </div>
  );
};

export default RegistrarVenta;