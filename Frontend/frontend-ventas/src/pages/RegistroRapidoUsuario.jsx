import React, { useState } from 'react';
import api from '../api';

const RegistroRapidoUsuario = () => {
  const [form, setForm] = useState({
    nombre: '',
    usuario: '',
    contraseña: '',
    rol: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setProcesando(true);
    setMensaje('');
    try {
      // 1. Crear personal mínimo
      const resPersonal = await api.post('/personal', {
        Nombre: form.nombre,
        CI: '',
        Sexo: '',
        Telefono: '',
        Correo: '',
        Domicilio: '',
      });
      const personalId = resPersonal.data.id || resPersonal.data.ID;
      // 2. Crear usuario
      await api.post('/usuarios', {
        username: form.usuario,
        password: form.contraseña,
        personalId: personalId,
        role: form.rol || 110 // 110: Administrador por defecto si no se elige
      });
      setMensaje('Usuario creado correctamente. Ahora puedes iniciar sesión.');
      setForm({ nombre: '', usuario: '', contraseña: '', rol: '' });
    } catch (err) {
      setMensaje('Error al crear usuario.');
    }
    setProcesando(false);
  };

  return (
    <div style={{maxWidth: 400, margin: '2rem auto', padding: 24, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 12px #c7d2fe22'}}>
      <h2 style={{textAlign: 'center', marginBottom: 18}}>Registro Rápido de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: 12}}>
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc'}} />
        </div>
        <div style={{marginBottom: 12}}>
          <label>Usuario</label>
          <input name="usuario" value={form.usuario} onChange={handleChange} required style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc'}} />
        </div>
        <div style={{marginBottom: 12}}>
          <label>Contraseña</label>
          <input name="contraseña" type="password" value={form.contraseña} onChange={handleChange} required style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc'}} />
        </div>
        <div style={{marginBottom: 12}}>
          <label>Rol (opcional, por defecto Administrador)</label>
          <input name="rol" value={form.rol} onChange={handleChange} placeholder="Ej: 110" style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc'}} />
        </div>
        <button type="submit" disabled={procesando} style={{width: '100%', padding: 10, borderRadius: 6, background: '#2563eb', color: '#fff', fontWeight: 600, border: 'none'}}>Registrar</button>
      </form>
      {mensaje && <div style={{marginTop: 18, color: mensaje.includes('correctamente') ? 'green' : 'red', textAlign: 'center'}}>{mensaje}</div>}
    </div>
  );
};

export default RegistroRapidoUsuario;
