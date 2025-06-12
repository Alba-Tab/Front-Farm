import React from 'react';

const RutaPrivada = ({ children }) => {
  // Permitir acceso a todas las rutas sin requerir login
  return children;
};

export default RutaPrivada;