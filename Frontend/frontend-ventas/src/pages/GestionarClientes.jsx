import React, { useState, useEffect } from "react";
import "../componentes/GestionarClientes.css";
import { getClientes, createProducto, updateProducto, getMarcas, getCategorias, getProveedores, getUsuarios, getRoles, getCompras, createProducto as createCliente, deleteCliente, updateCliente } from '../api';
import api from '../api';

function GestionarClientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null);
  const [tab, setTab] = useState("datos");
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre_completo: "",
    ci: "",
    telefono: "",
    email: "",
    domicilio: ""
  });
  // --- PAGINACIÓN DE CLIENTES ---
  const [paginaClientes, setPaginaClientes] = useState(1);
  const clientesPorPagina = 10;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientesAPI = await getClientes();
        setClientes(clientesAPI);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setClientes([]);
      }
    };
    fetchClientes();
  }, []);

  const filtrarClientes = () =>
    clientes.filter(
      (c) =>
        (c.nombre_completo || "").toLowerCase().includes((busqueda || "").toLowerCase()) ||
        (c.ci || "").includes(busqueda || "") ||
        ((c.email || "").toLowerCase().includes((busqueda || "").toLowerCase()))
    );

  const clientesFiltrados = filtrarClientes();
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const clientesPagina = clientesFiltrados.slice(
    (paginaClientes - 1) * clientesPorPagina,
    paginaClientes * clientesPorPagina
  );

  const handleSeleccionar = (cliente) => {
    setClienteSeleccionado(cliente);
    setClienteEdit(cliente); // Para edición
    setEditando(false);
    setMensaje("");
  };

  const handleEditar = () => {
    setEditando(true);
    setClienteEdit({ ...clienteSeleccionado });
  };

  const handleCancelar = () => {
    setEditando(false);
    setClienteEdit({ ...clienteSeleccionado });
  };

  const handleGuardar = async () => {
    try {
      await updateCliente(clienteEdit.id_cliente, {
        Nombre: clienteEdit.nombre_completo,
        CI: clienteEdit.ci,
        Telefono: clienteEdit.telefono,
        Email: clienteEdit.email,
        Domicilio: clienteEdit.domicilio || ""
      });
      const clientesAPI = await getClientes();
      setClientes(clientesAPI);
      setClienteSeleccionado({ ...clienteEdit });
      setEditando(false);
      setMensaje('Datos actualizados correctamente');
    } catch (err) {
      setMensaje('Error al actualizar cliente');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClienteEdit((prev) => ({ ...prev, [name]: value }));
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este cliente?")) {
      try {
        await deleteCliente(id);
        const clientesAPI = await getClientes();
        setClientes(clientesAPI);
        setClienteSeleccionado(null);
        setMensaje("Cliente eliminado");
      } catch (err) {
        setMensaje("Error al eliminar cliente");
      }
    }
  };

  const handleNuevoInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistrarNuevo = async () => {
    if (!nuevoCliente.nombre_completo || !nuevoCliente.ci) {
      setMensaje("Nombre y CI son obligatorios");
      return;
    }
    try {
      await api.post('/clientes', {
        Nombre: nuevoCliente.nombre_completo,
        CI: nuevoCliente.ci,
        Telefono: nuevoCliente.telefono,
        Email: nuevoCliente.email,
        Domicilio: nuevoCliente.domicilio || ""
      });
      const clientesAPI = await getClientes();
      setClientes(clientesAPI);
      setMostrarNuevo(false);
      setNuevoCliente({
        nombre_completo: "",
        ci: "",
        telefono: "",
        email: "",
        domicilio: ""
      });
      setMensaje("Cliente registrado exitosamente");
    } catch (err) {
      setMensaje("Error al registrar cliente");
    }
  };

  const handleCambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) setPaginaClientes(nueva);
  };

  // Reinicia a la página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPaginaClientes(1);
  }, [busqueda]);

  // --- ESTADÍSTICAS ---
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  const nuevosEsteMes = clientes.filter((c) => {
    // Suponiendo que cada cliente tiene una propiedad fecha_registro (si no, usar id_cliente <= 10 como demo)
    if (c.fecha_registro) {
      const fecha = new Date(c.fecha_registro);
      return (
        fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual
      );
    }
    // Demo: los primeros 2 clientes son "nuevos este mes"
    return c.id_cliente <= 2;
  }).length;

  const comprasDelMes = clientes.reduce((acc, c) => {
    if (!c.historial_compras) return acc;
    return (
      acc +
      c.historial_compras.filter((compra) => {
        const fecha = new Date(compra.fecha);
        return (
          fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual
        );
      }).length
    );
  }, 0);

  return (
    <div className="clientes-container">
      <div className="header">
        <h2>Gestión de Clientes</h2>
        <div className="header-actions">
          <button className="btn btn-primary">Exportar Datos</button>
          <button
            className="btn btn-success"
            onClick={() => setMostrarNuevo(true)}
          >
            Nuevo Cliente
          </button>
        </div>
      </div>
      <div className="content">
        <div className="stats-grid">
          <div className="stat-card-clientes blue-bg">
            <h3>{clientes.length}</h3>
            <div className="stat-label-clientes">Clientes Totales</div>
          </div>
          <div className="stat-card-clientes green-bg">
            <h3>{nuevosEsteMes}</h3>
            <div className="stat-label-clientes">Nuevos este mes</div>
          </div>
          <div className="stat-card-clientes orange-bg">
            <h3>{comprasDelMes}</h3>
            <div className="stat-label-clientes">Compras del mes</div>
          </div>
        </div>
        <div className="card-clientes">
          <div className="card-clientes-header">Buscar Clientes</div>
          <div className="card-clientes-body">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre, CI o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button className="btn btn-primary">Buscar</button>
            </div>
            <div className="clientes-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Completo</th>
                    <th>CI</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Domicilio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesPagina.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="gu-empty">No se encontraron clientes</td>
                    </tr>
                  ) : (
                    clientesPagina.map((c) => (
                      <tr key={c.id_cliente}>
                        <td>{c.id_cliente ? c.id_cliente.toString().padStart(3, "0") : ""}</td>
                        <td>{c.nombre_completo || ""}</td>
                        <td>{c.ci || ""}</td>
                        <td>{c.telefono || ""}</td>
                        <td>{c.email || ""}</td>
                        <td>{c.domicilio || ""}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="table-btn btn-view"
                              onClick={() => handleSeleccionar(c)}
                            >
                              Ver
                            </button>
                            <button
                              className="table-btn btn-edit"
                              onClick={() => {
                                handleSeleccionar(c);
                                setEditando(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="table-btn btn-delete"
                              onClick={() => handleEliminar(c.id_cliente)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button
                onClick={() => handleCambiarPagina(paginaClientes - 1)}
                disabled={paginaClientes === 1}
              >
                &laquo;
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i + 1}
                  className={paginaClientes === i + 1 ? "active" : ""}
                  onClick={() => handleCambiarPagina(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handleCambiarPagina(paginaClientes + 1)}
                disabled={paginaClientes === totalPaginas}
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
        {clienteSeleccionado && (
          <div className="card-clientes">
            <div className="card-clientes-header">
              Ficha de Cliente: {clienteSeleccionado.nombre_completo}
            </div>
            <div className="card-clientes-body">
              <div className="tabs-container">
                <div className="tabs">
                  <div
                    className={`tab${
                      tab === "datos" ? " active" : ""
                    }`}
                    onClick={() => setTab("datos")}
                  >
                    Datos
                  </div>
                  <div
                    className={`tab${
                      tab === "compras" ? " active" : ""
                    }`}
                    onClick={() => setTab("compras")}
                  >
                    Historial de Compras
                  </div>
                </div>
                {/* Datos del cliente */}
                {tab === "datos" && (
                  <div className="tab-content active">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre Completo</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nombre_completo"
                          value={editando ? (clienteEdit.nombre_completo || "") : (clienteSeleccionado.nombre_completo || "")}
                          onChange={editando ? handleInputChange : undefined}
                          readOnly={!editando}
                        />
                      </div>
                      <div className="form-group">
                        <label>CI</label>
                        <input
                          type="text"
                          className="form-control"
                          name="ci"
                          value={editando ? (clienteEdit.ci || "") : (clienteSeleccionado.ci || "")}
                          onChange={editando ? handleInputChange : undefined}
                          readOnly={!editando}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input
                          type="text"
                          className="form-control"
                          name="telefono"
                          value={editando ? (clienteEdit.telefono || "") : (clienteSeleccionado.telefono || "")}
                          onChange={editando ? handleInputChange : undefined}
                          readOnly={!editando}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={editando ? (clienteEdit.email || "") : (clienteSeleccionado.email || "")}
                          onChange={editando ? handleInputChange : undefined}
                          readOnly={!editando}
                        />
                      </div>
                      <div className="form-group">
                        <label>Domicilio</label>
                        <input
                          type="text"
                          className="form-control"
                          name="domicilio"
                          value={editando ? (clienteEdit.domicilio || "") : (clienteSeleccionado.domicilio || "")}
                          onChange={editando ? handleInputChange : undefined}
                          readOnly={!editando}
                        />
                      </div>
                    </div>
                    {editando ? (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={handleGuardar}
                        >
                          Guardar Cambios
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancelar}
                          style={{ marginLeft: 8 }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : null}
                    {mensaje && <div className="alert">{mensaje}</div>}
                  </div>
                )}
                {/* Historial de compras */}
                {tab === "compras" && (
                  <div className="tab-content active">
                    {clienteSeleccionado.historial_compras &&
                    clienteSeleccionado.historial_compras.length > 0 ? (
                      <table>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>N° Factura</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Método de Pago</th>
                            <th>Vendedor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clienteSeleccionado.historial_compras.map((compra, idx) => (
                            <tr key={idx}>
                              <td>{new Date(compra.fecha).toLocaleDateString()}</td>
                              <td>{compra.factura}</td>
                              <td>{compra.productos}</td>
                              <td>
                                {compra.total.toLocaleString("es-CL", {
                                  style: "currency",
                                  currency: "CLP",
                                })}
                              </td>
                              <td>{compra.metodo_pago}</td>
                              <td>{compra.vendedor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div
                        className="alert alert-info"
                        style={{ marginTop: 16 }}
                      >
                        Este cliente aún no tiene compras registradas.
                        <br />
                        Cuando realice una venta a nombre de este cliente,
                        aparecerán aquí los detalles de cada compra: fecha,
                        factura, productos, total, método de pago y vendedor
                        responsable.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {mostrarNuevo && (
          <div className="modal-nuevo-cliente">
            <div className="modal-content">
              <h2 className="modal-title">Registrar Nuevo Cliente</h2>
              <button
                onClick={() => setMostrarNuevo(false)}
                className="modal-x-animated"
                aria-label="Cerrar"
              >×</button>
              <div className="form-row modal-form-row">
                <div className="form-group">
                  <label>Nombre Completo <span className="required">*</span></label>
                  <input type="text" name="nombre_completo" className="form-control" value={nuevoCliente.nombre_completo} onChange={handleNuevoInput} placeholder="Ej: Juan Pérez" autoFocus />
                </div>
                <div className="form-group">
                  <label>CI <span className="required">*</span></label>
                  <input type="text" name="ci" className="form-control" value={nuevoCliente.ci} onChange={handleNuevoInput} placeholder="Ej: 12345678" />
                </div>
              </div>
              <div className="form-row modal-form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" name="telefono" className="form-control" value={nuevoCliente.telefono} onChange={handleNuevoInput} placeholder="Ej: +56 9 1234 5678" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" className="form-control" value={nuevoCliente.email} onChange={handleNuevoInput} placeholder="Ej: correo@email.com" />
                </div>
                <div className="form-group">
                  <label>Domicilio</label>
                  <input type="text" name="domicilio" className="form-control" value={nuevoCliente.domicilio} onChange={handleNuevoInput} placeholder="Ej: Calle 123" />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary modal-btn" onClick={handleRegistrarNuevo}>Registrar</button>
                <button className="btn btn-secondary modal-btn" onClick={() => setMostrarNuevo(false)}>Cancelar</button>
              </div>
              {mensaje && <div className="alert modal-alert">{mensaje}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionarClientes;
