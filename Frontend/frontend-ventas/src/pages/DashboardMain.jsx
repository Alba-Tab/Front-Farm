// Página principal del dashboard
import React, { useEffect, useState } from 'react';
import '../componentes/DashboardMain.css';
import { getVentasDelDia, getCrecimientoMensual, getProductosStockCritico } from '../api';

const DashboardMain = () => {
  const [ventasDia, setVentasDia] = useState({ totalVentas: 0, totalMonto: 0 });
  const [crecimiento, setCrecimiento] = useState({ crecimiento: 0 });
  const [stockCritico, setStockCritico] = useState({ criticos: 0 });

  useEffect(() => {
    getVentasDelDia().then(setVentasDia).catch(() => setVentasDia({ totalVentas: 0, totalMonto: 0 }));
    getCrecimientoMensual().then(setCrecimiento).catch(() => setCrecimiento({ crecimiento: 0 }));
    getProductosStockCritico().then(setStockCritico).catch(() => setStockCritico({ criticos: 0 }));
  }, []);

  const stats = [
    {
      id: 1,
      value: ventasDia.totalVentas,
      label: 'Ventas del Día',
      color: 'bg-info',
      icon: 'fa-user-tie',
      info: `Total vendido: Bs ${ventasDia.totalMonto || 0}`,
    },
    {
      id: 2,
      value: ventasDia.totalMonto,
      label: 'Venta Total del Día (Bs)',
      color: 'bg-success',
      icon: 'fa-coins',
      info: 'Meta diaria: 6000 Bs',
    },
    {
      id: 3,
      value: `${crecimiento.crecimiento || 0}%`,
      label: 'Crecimiento Mensual',
      color: 'bg-warning',
      icon: 'fa-chart-line',
      info: 'Respecto al mes anterior',
    },
    {
      id: 4,
      value: stockCritico.criticos,
      label: 'Productos con Stock Crítico',
      color: 'bg-danger',
      icon: 'fa-exclamation-triangle',
      info: 'Reponer urgente',
    },
  ];

  return (
    <main className="dashboard-main">
      <div className="dashboard-header-row">
        <h2 className="dashboard-title">Bienvenido/a al Sistema de Farmacia</h2>
      </div>
      <div className="stats-row">
        {stats.map(stat => (
          <div key={stat.id} className={`stat-card-dashboard ${stat.color}`}> 
            <div className="stat-card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <i className={`fa ${stat.icon} stat-icon`}></i>
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label-dashboard">{stat.label}</div>
                </div>
              </div>
            </div>
            <div className="stat-info-section">
              <span className="stat-info">{stat.info}</span>
              <i className="fa fa-arrow-circle-right" style={{ fontSize: '1.1rem', opacity: 0.7 }}></i>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-extra">
        <div className="dashboard-welcome-card">
          <h3>¡Gestiona tu farmacia de forma eficiente!</h3>
          <p>Accede a reportes, ventas, compras, inventario y mucho más desde el menú lateral. Utiliza la bitácora para auditar acciones y mantén el control total de tu negocio.</p>
        </div>
      </div>
    </main>
  );
};

export default DashboardMain;
