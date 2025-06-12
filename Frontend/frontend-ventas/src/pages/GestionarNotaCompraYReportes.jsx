import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, DollarSign, Package, TrendingUp, BarChart3, FileText } from 'lucide-react';

const PurchaseNotesManager = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Estado para notas de compra
  const [purchaseNotes, setPurchaseNotes] = useState([
    {
      id: 1,
      number: 'NC-001',
      supplier: 'Laboratorios Roemmers',
      date: '2024-06-01',
      total: 25420.50,
      status: 'completed',
      items: 45,
      description: 'Medicamentos para dolor y fiebre'
    },
    {
      id: 2,
      number: 'NC-002',
      supplier: 'Farmacéutica Bayer',
      date: '2024-06-05',
      total: 18750.00,
      status: 'pending',
      items: 32,
      description: 'Antiinflamatorios y analgésicos'
    },
    {
      id: 3,
      number: 'NC-003',
      supplier: 'Laboratorio Pfizer',
      date: '2024-06-08',
      total: 32300.75,
      status: 'completed',
      items: 28,
      description: 'Antibióticos y medicamentos especializados'
    },
    {
      id: 4,
      number: 'NC-004',
      supplier: 'Distribuidora Medifarm',
      date: '2024-06-10',
      total: 15200.00,
      status: 'pending',
      items: 55,
      description: 'Productos de cuidado personal y vitaminas'
    }
  ]);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    supplier: '',
    date: '',
    total: '',
    items: '',
    description: '',
    status: 'pending'
  });

  // Datos para reportes
  const monthlyData = [
    { month: 'Ene', amount: 65000, orders: 18 },
    { month: 'Feb', amount: 72000, orders: 22 },
    { month: 'Mar', amount: 58000, orders: 16 },
    { month: 'Abr', amount: 81000, orders: 25 },
    { month: 'May', amount: 68000, orders: 19 },
    { month: 'Jun', amount: 91671, orders: 24 }
  ];

  const supplierData = [
    { name: 'Laboratorios Roemmers', amount: 185000, percentage: 28 },
    { name: 'Farmacéutica Bayer', amount: 165000, percentage: 25 },
    { name: 'Laboratorio Pfizer', amount: 145000, percentage: 22 },
    { name: 'Distribuidora Medifarm', amount: 95000, percentage: 14 },
    { name: 'Otros laboratorios', amount: 71000, percentage: 11 }
  ];

  // Filtrar notas
  const filteredNotes = purchaseNotes.filter(note => {
    const matchesSearch = note.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || note.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Manejar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNote) {
      setPurchaseNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...formData, number: note.number }
          : note
      ));
    } else {
      const newNote = {
        id: Date.now(),
        number: `NC-${String(purchaseNotes.length + 1).padStart(3, '0')}`,
        ...formData,
        total: parseFloat(formData.total),
        items: parseInt(formData.items)
      };
      setPurchaseNotes(prev => [...prev, newNote]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      supplier: '',
      date: '',
      total: '',
      items: '',
      description: '',
      status: 'pending'
    });
    setEditingNote(null);
    setShowModal(false);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      supplier: note.supplier,
      date: note.date,
      total: note.total.toString(),
      items: note.items.toString(),
      description: note.description,
      status: note.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar esta nota de compra?')) {
      setPurchaseNotes(prev => prev.filter(note => note.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Calcular estadísticas
  const totalAmount = purchaseNotes.reduce((sum, note) => sum + note.total, 0);
  const totalOrders = purchaseNotes.length;
  const completedOrders = purchaseNotes.filter(note => note.status === 'completed').length;
  const avgOrderValue = totalAmount / totalOrders || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Farmacia Britman - Gestión de Compras</h1>
              <p className="text-gray-600">Administra las compras de medicamentos y productos farmacéuticos</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Notas de Compra
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Reportes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'notes' ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Compras Farmacéuticas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Bs. {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Órdenes de Medicamentos</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Promedio por Orden</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Bs. {avgOrderValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por laboratorio o número..."
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Nota
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Laboratorio/Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNotes.map((note) => (
                      <tr key={note.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {note.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{note.supplier}</div>
                            <div className="text-sm text-gray-500">{note.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(note.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Bs. {note.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(note.status)}`}>
                            {getStatusText(note.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(note)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Reports Tab */
          <div className="space-y-6">
            {/* Report Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900">Reportes de Compras Farmacéuticas</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="date"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Generar Reporte
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compras Mensuales de Medicamentos</h3>
              <div className="h-64 flex items-end space-x-4">
                {monthlyData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(item.amount / 65000) * 200}px` }}
                    ></div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium text-gray-900">{item.month}</div>
                      <div className="text-xs text-gray-500">Bs. {(item.amount / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Laboratorios y Proveedores</h3>
                <div className="space-y-4">
                  {supplierData.map((supplier, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${supplier.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Bs. {supplier.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{supplier.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Estadístico</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Compras Farmacéuticas:</span>
                    <span className="font-semibold">Bs. {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Órdenes de Medicamentos:</span>
                    <span className="font-semibold">{totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio por Orden:</span>
                    <span className="font-semibold">Bs. {avgOrderValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Órdenes Completadas:</span>
                    <span className="font-semibold">{completedOrders}/{totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa de Completitud:</span>
                    <span className="font-semibold">{((completedOrders/totalOrders)*100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNote ? 'Editar Nota de Compra' : 'Nueva Nota de Compra'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laboratorio/Proveedor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laboratorio Pfizer, Farmacéutica Bayer..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total (Bs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.total}
                    onChange={(e) => setFormData(prev => ({ ...prev, total: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Productos/Medicamentos
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.items}
                    onChange={(e) => setFormData(prev => ({ ...prev, items: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de Medicamentos
                </label>
                <textarea
                  placeholder="Detalle los medicamentos y productos farmacéuticos adquiridos..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingNote ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseNotesManager;