import React, { useState } from "react";

export default function TestModal() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <h1>Test Modal</h1>
      <button onClick={() => setShowModal(true)}>Abrir Modal</button>
      <p>Modal estado: {showModal.toString()}</p>
      
      <div style={{ 
        display: showModal ? 'flex' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '300px'
        }}>
          <h2>Modal de Prueba</h2>
          <p>Este modal funciona!</p>
          <button onClick={() => setShowModal(false)}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
