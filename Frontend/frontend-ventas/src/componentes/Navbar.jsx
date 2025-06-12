import React, { useState } from 'react';
import '../App.css';

// Navbar principal para el dashboard moderno
function Navbar({ onToggleSidebar }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Función para alternar pantalla completa
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <nav className="navbar-main" style={{ background: '#fff', borderRadius: '18px', margin: '1.2rem 1.5rem 1.5rem 1.5rem', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', padding: '0.5rem 2rem', minHeight: '56px' }}>
      <button className="menu-toggle-btn" onClick={onToggleSidebar} style={{ background: 'none', border: 'none', marginRight: '1.2rem', borderRadius: '50%', padding: '0.5rem', transition: 'background 0.2s' }}>
        <i className="fa fa-bars" style={{ fontSize: '1.5rem', color: '#444' }}></i>
      </button>
      <span className="navbar-title" style={{ fontWeight: 600, fontSize: '1.15rem', color: '#444', letterSpacing: '1px', cursor: 'pointer' }} onClick={() => window.location.pathname = '/dashboard'}>INICIO</span>
      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.3rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
        {/* Icono de búsqueda */}
        <button className="icon-btn" title="Buscar" style={{ background: 'none', border: 'none', borderRadius: '50%', padding: '0.5rem', transition: 'background 0.2s' }}>
          <i className="fa fa-search" style={{ fontSize: '1.18rem', color: '#888' }}></i>
        </button>
        {/* Icono de mensajes */}
        <button className="icon-btn" title="Mensajes" style={{ background: 'none', border: 'none', borderRadius: '50%', padding: '0.5rem', transition: 'background 0.2s' }}>
          <i className="fa fa-comments" style={{ fontSize: '1.18rem', color: '#888' }}></i>
        </button>
        {/* Icono de pantalla completa */}
        <button className="icon-btn" title="Pantalla completa" style={{ background: 'none', border: 'none', borderRadius: '50%', padding: '0.5rem', transition: 'background 0.2s' }} onClick={handleFullscreen}>
          <i className={`fa ${isFullscreen ? 'fa-compress' : 'fa-expand'}`} style={{ fontSize: '1.18rem', color: '#888' }}></i>
        </button>
        {/* Botón de cerrar sesión */}
        <button className="icon-btn" title="Cerrar sesión" style={{ background: 'none', border: 'none', borderRadius: '50%', padding: '0.5rem', transition: 'background 0.2s' }} onClick={async () => {
          console.log('🔥 INICIANDO PROCESO DE LOGOUT');
          
          try {
            // Obtener userId del usuario logueado (si existe en localStorage)
            const userString = localStorage.getItem('user');
            console.log('🔥 userString encontrado:', userString);
            
            let userId = null;
            
            if (userString) {
              const user = JSON.parse(userString);
              userId = user.id;
              console.log('🔥 userId extraído del user:', userId);
            }
            
            // Si no hay userId, intentar con un valor por defecto (el admin que es 3016)
            if (!userId) {
              userId = 3016; // Cambiar por el usuario actual que vemos en los logs
              console.log('🔥 userId por defecto asignado:', userId);
            }
            
            console.log('🔥 Enviando logout para userId:', userId);
            
            const response = await fetch('http://localhost:4000/api/auth/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId })
            });
            
            console.log('🔥 Respuesta del logout:', response.status, response.statusText);
            const responseData = await response.text();
            console.log('🔥 Datos de respuesta:', responseData);
            
            // ESPERAR 1 segundo para que se registre antes de redirigir
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (e) {
            console.error('❌ Error en logout:', e);
          }
          
          console.log('🔥 Limpiando localStorage y redirigiendo...');
          localStorage.clear();
          window.location.href = '/login';
        }}>
          <i className="fa fa-sign-out-alt" style={{ fontSize: '1.18rem', color: '#e11d48' }}></i>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
