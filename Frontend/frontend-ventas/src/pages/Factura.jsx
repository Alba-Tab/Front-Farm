import React, { useState, useEffect } from 'react';
import Button from '../componentes/Button';
import '../componentes/Factura.css';
import { createFactura, getMetodosPago } from '../api';
import { FaEllipsisH } from 'react-icons/fa';

const Factura = ({ venta, cliente, usuarioID, onVolver }) => {
  const [tipo, setTipo] = useState('factura');
  const [mensaje, setMensaje] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoPagoID, setMetodoPagoID] = useState('');
  const [metodoPagoOtros, setMetodoPagoOtros] = useState(null);
  const [mostrarOtros, setMostrarOtros] = useState(false);

  // Validación defensiva para evitar pantalla en blanco
  const datosValidos = Array.isArray(venta.productos) && typeof venta.total !== 'undefined';

  // Mostrar siempre la UI aunque los datos estén vacíos
  // Solo mostrar mensaje de advertencia arriba de la factura si los datos están vacíos
  const advertencia = !datosValidos || venta.productos.length === 0;

  useEffect(() => {
    const fetchMetodos = async () => {
      const metodos = await getMetodosPago();
      setMetodosPago(metodos);
      // Si viene un método de pago desde ventas, seleccionarlo
      if (venta && venta.metodoPagoID) {
        setMetodoPagoID(venta.metodoPagoID);
      } else if (metodos.length > 0) {
        setMetodoPagoID(metodos[0].ID);
      }
    };
    fetchMetodos();
  }, [venta]);

  const handleMetodoPagoOtros = (id) => {
    setMetodoPagoID(id);
    setMetodoPagoOtros(id);
  };

  const handleEmitir = async () => {
    setMensaje(null);
    setProcesando(true);
    if (!cliente.Nombre && !cliente.Telefono && !cliente.Email) {
      setMensaje({ tipo: 'error', texto: 'Datos incompletos: debe haber al menos un dato de contacto del cliente.' });
      setProcesando(false);
      return;
    }
    try {
      console.log('Productos enviados a la factura:', venta.productos);
      const facturaData = {
        clienteID: cliente.ID || cliente.id_cliente,
        items: venta.productos.map(p => {
          const item = { productoID: p.id, cantidad: Number(p.cantidad) };
          if (p.recetaCodigo) item.recetaCodigo = p.recetaCodigo;
          return item;
        }),
        metodoPagoID: Number(metodoPagoID),
        usuarioID: usuarioID
      };
      await createFactura(facturaData);
      setMensaje({ tipo: 'exito', texto: tipo === 'factura' ? 'Factura generada' : 'Recibo generado' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error?.response?.data?.message || 'Error al generar comprobante' });
    } finally {
      setProcesando(false);
    }
  };

  // Obtener la fecha y hora actual
  const fechaHoy = new Date().toISOString().slice(0, 10);
  const horaHoy = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="factura-container card-efecto" style={{maxWidth: 800, background: '#fff', padding: 0}}>
      <div style={{border: '1.5px solid #e0e7ef', borderRadius: '1.2rem', margin: 0, padding: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '2rem 2.5rem 1.2rem 2.5rem', borderBottom: '1.5px solid #e5e7eb'}}>
          <div style={{textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
            <div style={{fontWeight: 700, fontSize: '1.2rem', color: '#2563eb'}}>FACTURA ELECTRÓNICA</div>
            <div style={{fontSize: '1.05rem', color: '#444'}}>Av. Central 456, Ciudad</div>
            <div style={{fontSize: '1.05rem', color: '#444'}}>Fecha: {fechaHoy}</div>
            <div style={{fontSize: '1.05rem', color: '#444'}}>Hora: {horaHoy}</div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end'}}>
            <div style={{fontWeight: 800, fontSize: '1.5rem', color: '#222'}}>Farmacia Britmann</div>
          </div>
        </div>
        <div style={{padding: '1.2rem 2.5rem 0.5rem 2.5rem'}}>
          <div style={{fontSize: '1.08rem', marginBottom: '0.7rem'}}>
            <div><b>Cliente:</b> {cliente.Nombre}</div>
            <div><b>Teléfono:</b> {cliente.Telefono}</div>
            <div><b>Email:</b> {cliente.Email}</div>
          </div>
        </div>
        <div style={{padding: '0 2.5rem 1.5rem 2.5rem'}}>
          <table className="factura-table" style={{width: '100%', margin: 0}}>
            <thead>
              <tr>
                <th style={{width: '90px'}}>Código</th>
                <th>Descripción</th>
                <th style={{width: '90px'}}>Cantidad</th>
                <th style={{width: '120px'}}>Precio Unit.</th>
                <th style={{width: '120px'}}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(venta.productos) && venta.productos.length > 0 ? (
                venta.productos.map((p, idx) => (
                  <tr key={p.id}>
                    <td>{`P${String(p.id).padStart(3, '0')}`}</td>
                    <td>{p.nombre}</td>
                    <td style={{textAlign:'center'}}>{p.cantidad}</td>
                    <td>${Number(p.precio).toFixed(2)}</td>
                    <td>${Number(p.precio * p.cantidad).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{textAlign:'center',color:'#aaa'}}>Sin productos</td></tr>
              )}
            </tbody>
          </table>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', marginTop:'1.2rem', fontSize:'1.08rem'}}>
            <div style={{marginBottom:'0.2rem'}}>Subtotal: <b>${Number(venta.Monto_Total).toFixed(2)}</b></div>
            <div style={{marginBottom:'0.2rem'}}>Descuento: <b>${Number(venta.Descuento).toFixed(2)}</b></div>
            <div style={{fontWeight:800, fontSize:'1.18rem', marginTop:'0.5rem'}}>TOTAL: <span style={{color:'#2563eb'}}>${(Number(venta.Monto_Total) - Number(venta.Descuento)).toFixed(2)}</span></div>
          </div>
        </div>
        <div style={{padding:'1.2rem 2.5rem 2rem 2.5rem', display:'flex', justifyContent:'flex-end', gap:'1.2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem'}}>
            <label style={{fontSize: '1.08rem'}}>Método de Pago:</label>
            <select
              value={metodoPagoID}
              onChange={e => setMetodoPagoID(Number(e.target.value))}
              style={{padding: '0.7rem', borderRadius: '0.7rem', border: '1.5px solid #22c55e', fontWeight: 600, fontSize: '1.08rem', background: '#fff', color: '#2563eb', minWidth: 180}}
            >
              {metodosPago.map(mp => (
                <option key={mp.ID} value={mp.ID}>{mp.Nombre}</option>
              ))}
            </select>
          </div>
          <Button className="factura-btn" onClick={onVolver} disabled={procesando}>Volver</Button>
          <Button className="factura-btn emitir" onClick={handleEmitir} disabled={procesando}>
            {procesando ? 'Procesando...' : 'Emitir Comprobante'}
          </Button>
        </div>
        {mensaje && (
          <div className={`factura-alert factura-alert-${mensaje.tipo}`} style={{margin:'0 2.5rem 1.2rem 2.5rem'}}>{mensaje.texto}</div>
        )}
      </div>
    </div>
  );
};

export default Factura;
