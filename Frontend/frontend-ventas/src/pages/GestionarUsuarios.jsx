import React, { useState, useEffect } from 'react';
import Button from '../componentes/Button';
import '../componentes/GestionarUsuarios.css';
import { getUsuarios, getRoles } from '../api';
import api from '../api';

const GestionarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState({});
  const [rolesList, setRolesList] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null); // null | 'nuevo' | usuario a editar
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const handleBuscar = (e) => setBusqueda(e.target.value);

  const usuariosFiltrados = usuarios.filter(u =>
    (u.nombre || '').toLowerCase().includes((busqueda || '').toLowerCase()) ||
    (u.usuario || '').toLowerCase().includes((busqueda || '').toLowerCase()) ||
    (roles[u.rol] || '').toLowerCase().includes((busqueda || '').toLowerCase())
  );

  const handleNuevo = () => {
    setUsuarioEdit({ nombre: '', usuario: '', rol: '', telefono: '', correo: '', activo: true });
    setModal('nuevo');
  };

  const handleEditar = (usuario) => {
    setUsuarioEdit({ ...usuario });
    setModal('editar');
  };

  const handleEliminar = (usuario) => {
    setUsuarioEdit({ ...usuario });
    setModal('eliminar');
  };

  const handleGuardar = async () => {
    if (!usuarioEdit.nombre || !usuarioEdit.usuario || !usuarioEdit.rol || !usuarioEdit.contraseña) {
      setMensaje({ tipo: 'error', texto: 'Error: los datos no son válidos' });
      return;
    }
    try {
      // 1. Crear personal
      const personalData = {
        CI: usuarioEdit.ci || '',
        Nombre: usuarioEdit.nombre,
        Sexo: usuarioEdit.sexo || '',
        Telefono: usuarioEdit.telefono || '',
        Correo: usuarioEdit.correo || '',
        Domicilio: usuarioEdit.domicilio || ''
      };
      const resPersonal = await api.post('/personal', personalData);
      const personalId = resPersonal.data.ID;
      // 2. Crear usuario
      const userData = {
        username: usuarioEdit.usuario,
        password: usuarioEdit.contraseña,
        personalId: personalId,
        role: usuarioEdit.rol
      };
      await api.post('/usuarios', userData);
      setMensaje({ tipo: 'exito', texto: 'Usuario registrado correctamente' });
      setModal(null);
      // Refrescar lista de usuarios
      const [usuariosAPI, rolesAPI] = await Promise.all([
        getUsuarios(),
        getRoles()
      ]);
      setRolesList(rolesAPI);
      setUsuarios(usuariosAPI);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar usuario' });
    }
  };

  const handleConfirmarEliminar = async () => {
    try {
      // Llamar al API para eliminar el usuario de la base de datos
      await api.delete(`/usuarios/${usuarioEdit.id}`);
      // Actualizar estado local tras eliminación
      setUsuarios(prev => prev.filter(u => u.id !== usuarioEdit.id));
      setMensaje({ tipo: 'exito', texto: 'Usuario eliminado correctamente' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar usuario' });
      console.error('Error eliminando usuario:', err);
    } finally {
      setModal(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosAPI, rolesAPI] = await Promise.all([
          getUsuarios(),
          getRoles()
        ]);
        setRolesList(rolesAPI);
        setUsuarios(usuariosAPI);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setUsuarios([]);
      }
    };
    fetchData();
  }, []);

  // Ocultar mensaje automáticamente después de 2.5 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  return (
    <div className="gestionar-usuarios-container card-efecto">
      <h2 className="gestionar-usuarios-title">Gestionar Usuarios</h2>
      <div className="gestionar-usuarios-bar">
        <input
          className="gestionar-usuarios-input"
          type="text"
          placeholder="Buscar por nombre, usuario o rol..."
          value={busqueda}
          onChange={handleBuscar}
        />
        <Button className="gestionar-usuarios-btn" onClick={handleNuevo} style={{marginLeft:'0.7rem'}}>Añadir usuario</Button>
      </div>
      {mensaje && (
        <div className={`gu-alert gu-alert-${mensaje.tipo} fade-in`}>{mensaje.texto}</div>
      )}
      <div className="gestionar-usuarios-table-wrapper">
        <table className="gestionar-usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr><td colSpan="8" className="gu-empty">No se encontraron usuarios</td></tr>
            ) : (
              usuariosFiltrados.map((usuario, idx) => (
                <tr key={usuario.id || idx} className={!usuario.activo ? 'gu-inactivo' : ''}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.usuario}</td>
                  <td>{rolesList.find(r => r.id === usuario.rol)?.nombre || usuario.rol}</td>
                  <td>{usuario.telefono}</td>
                  <td>{usuario.correo}</td>
                  <td>{usuario.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <Button className="gestionar-usuarios-btn editar" onClick={() => handleEditar(usuario)} title="Editar">
                      <i className="fa fa-pen fa-xs"></i>
                    </Button>
                    <Button className="gestionar-usuarios-btn eliminar" onClick={() => handleEliminar(usuario)} title="Eliminar">
                      <i className="fa fa-trash fa-xs"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {modal && (
        <div className="gu-modal-bg">
          <div className="gu-modal">
            {modal === 'eliminar' ? (
              <>
                <h3>¿Eliminar usuario?</h3>
                <p>¿Está seguro que desea eliminar a <b>{usuarioEdit.nombre}</b>?</p>
                <Button className="gestionar-usuarios-btn cancelar" onClick={() => setModal(null)}>Cancelar</Button>
                <Button className="gestionar-usuarios-btn eliminar" onClick={handleConfirmarEliminar}>Eliminar</Button>
              </>
            ) : (
              <>
                <h3>{modal === 'nuevo' ? 'Registrar Usuario' : 'Editar Usuario'}</h3>
                <form className="gu-form" onSubmit={e => { e.preventDefault(); handleGuardar(); }}>
                  <input className="gu-input" type="text" placeholder="Nombre" value={usuarioEdit.nombre} onChange={e => setUsuarioEdit({ ...usuarioEdit, nombre: e.target.value })} required />
                  <input className="gu-input" type="text" placeholder="Usuario" value={usuarioEdit.usuario} onChange={e => setUsuarioEdit({ ...usuarioEdit, usuario: e.target.value })} required />
                  <input className="gu-input" type="password" placeholder="Contraseña" value={usuarioEdit.contraseña || ''} onChange={e => setUsuarioEdit({ ...usuarioEdit, contraseña: e.target.value })} required />
                  <select className="gu-input" value={usuarioEdit.rol} onChange={e => setUsuarioEdit({ ...usuarioEdit, rol: e.target.value })} required>
                    <option value="">Seleccionar rol...</option>
                    {rolesList.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                  <input className="gu-input" type="text" placeholder="Teléfono" value={usuarioEdit.telefono || ''} onChange={e => setUsuarioEdit({ ...usuarioEdit, telefono: e.target.value })} />
                  <input className="gu-input" type="email" placeholder="Correo" value={usuarioEdit.correo || ''} onChange={e => setUsuarioEdit({ ...usuarioEdit, correo: e.target.value })} />
                  <input className="gu-input" type="text" placeholder="CI" value={usuarioEdit.ci || ''} onChange={e => setUsuarioEdit({ ...usuarioEdit, ci: e.target.value })} />
                  <input className="gu-input" type="text" placeholder="Domicilio" value={usuarioEdit.domicilio || ''} onChange={e => setUsuarioEdit({ ...usuarioEdit, domicilio: e.target.value })} />
                  <select className="gu-input" value={usuarioEdit.sexo || ''} onChange={e => setUsuarioEdit({ ...usuarioEdit, sexo: e.target.value })} required>
                    <option value="">Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                  <div className="gu-form-actions">
                    <Button className="gestionar-usuarios-btn cancelar" type="button" onClick={() => setModal(null)}>Cancelar</Button>
                    <Button className="gestionar-usuarios-btn guardar" type="submit">Guardar</Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarUsuarios;
