import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../componentes/Button';
import '../componentes/RegistroDeUsuario.css';
import '../componentes/Login.css'; // Para reutilizar los estilos de input y animaciones
import api from '../api';

const initialState = {
  personal: {
    CI: '',
    Nombre: '',
    Sexo: '',
    Telefono: '',
    Correo: '',
    Domicilio: '',
  },
  usuario: {
    Usuario: '',
    Contraseña: '',
    RolID: '',
  },
};

const RegistroDeUsuario = () => {
  const [form, setForm] = useState(initialState);
  const [alerta, setAlerta] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles');
        setRoles(res.data);
      } catch (err) {
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [section]: {
        ...form[section],
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta(null);
    setProcesando(true);
    try {
      // 1. Crear el personal
      const resPersonal = await api.post('/personal', form.personal);
      const personalId = resPersonal.data.id || resPersonal.data.ID;
      // 2. Crear el usuario
      await api.post('/usuarios', {
        username: form.usuario.Usuario,
        password: form.usuario.Contraseña,
        personalId: personalId,
        role: form.usuario.RolID
      });
      setAlerta('Usuario registrado correctamente');
      setTimeout(() => setAlerta(null), 2000);
      setForm(initialState);
      setTimeout(() => {
        setProcesando(false);
        navigate('/login');
      }, 2000);
    } catch (err) {
      setProcesando(false);
      setAlerta(err?.response?.data?.message || 'Error al registrar usuario');
      setTimeout(() => setAlerta(null), 4000);
    }
  };

  const handleIrLogin = (e) => {
    e.preventDefault();
    setIsLeaving(true);
    setTimeout(() => {
      navigate('/login');
    }, 400);
  };

  return (
    <div className={`login-container${isLeaving ? ' login-leave' : ''}`}> 
      <div className="login-form-section" style={{alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
        <h1 className="login-title" style={{marginBottom: '1.5rem'}}>Registro de Usuario</h1>
         <form className="login-form" onSubmit={handleSubmit} style={{maxWidth: 400, width: '100%'}}>
          <label className="login-label">CI</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-id-card"></i></span>
            <input className="login-input" type="text" name="CI" value={form.personal.CI} onChange={e => handleChange(e, 'personal')} required />
          </div>
          <label className="login-label">Nombre completo</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-user"></i></span>
            <input className="login-input" type="text" name="Nombre" value={form.personal.Nombre} onChange={e => handleChange(e, 'personal')} required />
          </div>
          <label className="login-label">Sexo</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-venus-mars"></i></span>
            <select className="login-select login-input" name="Sexo" value={form.personal.Sexo} onChange={e => handleChange(e, 'personal')} required style={{flex: 1, background: 'transparent', border: 'none', fontSize: '1.1rem', color: '#444a53'}}>
              <option value="" disabled hidden>Sexo</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
          <label className="login-label">Teléfono</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-phone"></i></span>
            <input className="login-input" type="text" name="Telefono" value={form.personal.Telefono} onChange={e => handleChange(e, 'personal')} required />
          </div>
          <label className="login-label">Correo electrónico</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-envelope"></i></span>
            <input className="login-input" type="email" name="Correo" value={form.personal.Correo} onChange={e => handleChange(e, 'personal')} required />
          </div>
          <label className="login-label">Domicilio</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-home"></i></span>
            <input className="login-input" type="text" name="Domicilio" value={form.personal.Domicilio} onChange={e => handleChange(e, 'personal')} required />
          </div>
          <label className="login-label">Nombre de usuario</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-user-circle"></i></span>
            <input className="login-input" type="text" name="Usuario" value={form.usuario.Usuario} onChange={e => handleChange(e, 'usuario')} required />
          </div>
          <label className="login-label">Contraseña</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-lock"></i></span>
            <input className="login-input" type="password" name="Contraseña" value={form.usuario.Contraseña} onChange={e => handleChange(e, 'usuario')} required />
          </div>
          <label className="login-label">Rol</label>
          <div className="login-input-group">
            <span className="login-icon"><i className="fa fa-users-cog"></i></span>
            <select className="login-input" name="RolID" value={form.usuario.RolID} onChange={e => handleChange(e, 'usuario')} required style={{flex: 1, background: 'transparent', border: 'none', fontSize: '1.1rem', color: '#444a53'}}>
              <option value="" disabled hidden>Rol</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div style={{marginTop: '1.2rem'}}>
            <Button className="login-btn" type="submit" style={{width: '100%'}} disabled={procesando}>
              {procesando ? 'Procesando...' : 'Registrar'}
            </Button>
          </div>
          {alerta && <div className="registro-usuario-alert" style={{marginTop: '1rem'}}>{alerta}</div>}
        </form>
        <div className="login-links-row" style={{marginTop: '1.2rem', justifyContent: 'center'}}>
          <a href="#" className="login-link" onClick={handleIrLogin}>¿Ya tienes una cuenta? Iniciar sesión</a>
        </div>
      </div>
    </div>
  );
};

export default RegistroDeUsuario;
