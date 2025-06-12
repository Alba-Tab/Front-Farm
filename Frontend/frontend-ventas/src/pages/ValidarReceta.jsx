import React, { useState } from 'react';
import '../componentes/ValidarReceta.css';

function ValidarReceta() {
  const [codigo, setCodigo] = useState('');
  const [receta, setReceta] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [resultado, setResultado] = useState('');
  const [autorizada, setAutorizada] = useState(false);

  const buscarReceta = () => {
    setMensaje('');
    setAutorizada(false);
    // Aquí se debería implementar la lógica para buscar la receta en la base de datos
    // Por ahora, dejamos el mensaje de ejemplo
    setReceta(null);
    setMensaje('Receta no encontrada');
  };

  const autorizarVenta = () => {
    setAutorizada(true);
    setMensaje('¡Receta aprobada y validada! Puede autorizar la venta.');
  };

  return (
    <div className="validar-receta-container">
      <h2>Validar Receta Médica para Medicamentos Controlados</h2>
      <div className="alerta-proceso">
        Antes de autorizar la venta de medicamentos controlados, valide la receta médica presentada por el cliente.
      </div>
      <div className="card-validar">
        <div className="form-row">
          <div className="form-group">
            <label>Código de Receta</label>
            <input type="text" className="form-control" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ingrese el código de receta" />
          </div>
          <div className="form-group" style={{alignSelf: 'flex-end'}}>
            <button className="btn btn-primary" type="button" onClick={buscarReceta}>Validar Receta</button>
          </div>
        </div>
        {mensaje && <div className="mensaje-validacion">{mensaje}</div>}
        {receta && (
          <div className="datos-receta">
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Emisión</label>
                <input type="date" className="form-control" value={receta.fechaEmision} readOnly />
              </div>
              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input type="date" className="form-control" value={receta.fechaVencimiento} readOnly />
              </div>
              <div className="form-group">
                <label>Cliente</label>
                <input type="text" className="form-control" value={receta.cliente} readOnly />
              </div>
              <div className="form-group">
                <label>CI Cliente</label>
                <input type="text" className="form-control" value={receta.ci} readOnly />
              </div>
            </div>
            <div className="medicamentos-section">
              <h4>Medicamentos Prescritos</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Dosis</th>
                    <th>Cantidad</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {receta.medicamentos.map((m, idx) => (
                    <tr key={idx} className={m.tipo === 'Controlado' ? 'controlled' : ''}>
                      <td>{m.nombre}</td>
                      <td>{m.dosis}</td>
                      <td>{m.cantidad}</td>
                      <td>{m.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="validation-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Resultado de Verificación</label>
                  <select className="form-control" value={resultado} onChange={e => setResultado(e.target.value)}>
                    <option value="">Seleccione...</option>
                    <option value="autentica">Receta Auténtica</option>
                    <option value="sospechosa">Receta Sospechosa</option>
                    <option value="falsificada">Receta Falsificada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Farmacéutico Responsable</label>
                  <input type="text" className="form-control" value="Nirvana Arias" readOnly />
                </div>
              </div>
              <div className="validation-field">
                <label>Observaciones</label>
                <textarea className="form-control" rows="3" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Ingrese sus observaciones sobre la validación..."></textarea>
              </div>
              <div className="action-buttons">
                <button className="btn btn-danger" type="button" onClick={()=>setMensaje('Receta rechazada')}>Rechazar</button>
                <button className="btn btn-warning" type="button" onClick={()=>setMensaje('Receta pendiente de validación')}>Pendiente</button>
                <button className="btn btn-success" type="button" onClick={autorizarVenta} disabled={autorizada}>Aprobar</button>
                <button className="btn btn-primary" type="button" onClick={()=>setMensaje('Validación guardada')}>Guardar Validación</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidarReceta;
