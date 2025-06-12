import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './pages/MainLayout';
import RegistroDeUsuario from './pages/RegistroDeUsuario';
import RegistroRapidoUsuario from './pages/RegistroRapidoUsuario';
import OlvideContrasena from './pages/OlvideContrasena';
import RutaPrivada from './componentes/RutaPrivada';
import ProveedoresPage from './pages/ProveedoresPage';
import './App.css';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/registro-usuario" element={<RegistroDeUsuario />} />
    <Route path="/registro-rapido" element={<RegistroRapidoUsuario />} />
    <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/*" element={
      <RutaPrivada>
        <MainLayout />
      </RutaPrivada>
    } />
  </Routes>
);

export default App;