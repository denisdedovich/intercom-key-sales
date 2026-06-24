import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import HouseList from './components/HouseList';
import HouseInfo from './components/HouseInfo';
import ApartmentTable from './components/ApartmentTable';
import AddHouseModal from './components/AddHouseModal';
import AddApartmentModal from './components/AddApartmentModal';
import ImportModal from './components/ImportModal';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [houses, setHouses] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [showAddApartment, setShowAddApartment] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const fetchHouses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/houses`);
      setHouses(res.data);
    } catch (err) {
      console.error('Error fetching houses:', err);
    }
  }, []);

  const fetchHouse = useCallback(async (id) => {
    if (!id) { setSelectedHouse(null); return; }
    try {
      const res = await axios.get(`${API_URL}/houses/${id}`);
      setSelectedHouse(res.data);
    } catch (err) {
      console.error('Error fetching house:', err);
    }
  }, []);

  useEffect(() => { fetchHouses(); }, [fetchHouses]);
  useEffect(() => { fetchHouse(selectedHouseId); }, [selectedHouseId, fetchHouse]);

  const handleAddHouse = async (houseData) => {
    try {
      const res = await axios.post(`${API_URL}/houses`, houseData);
      setHouses(prev => [...prev, res.data]);
      setSelectedHouseId(res.data.id);
      setShowAddHouse(false);
    } catch (err) {
      console.error('Error adding house:', err);
    }
  };

  const handleDeleteHouse = async () => {
    if (!selectedHouseId) return;
    if (!window.confirm('Удалить этот дом?')) return;
    try {
      await axios.delete(`${API_URL}/houses/${selectedHouseId}`);
      setHouses(prev => prev.filter(h => h.id !== selectedHouseId));
      setSelectedHouseId(null);
      setSelectedHouse(null);
    } catch (err) {
      console.error('Error deleting house:', err);
    }
  };

  const handleUpdateHouse = async (updatedData) => {
    try {
      await axios.put(`${API_URL}/houses/${selectedHouseId}`, updatedData);
      fetchHouse(selectedHouseId);
    } catch (err) {
      console.error('Error updating house:', err);
    }
  };

  const handleAddApartment = async (aptData) => {
    try {
      await axios.post(`${API_URL}/houses/${selectedHouseId}/apartments`, aptData);
      fetchHouse(selectedHouseId);
      setShowAddApartment(false);
    } catch (err) {
      console.error('Error adding apartment:', err);
    }
  };

  const handleUpdateApartment = async (aptId, data) => {
    try {
      await axios.put(`${API_URL}/houses/${selectedHouseId}/apartments/${aptId}`, data);
      fetchHouse(selectedHouseId);
    } catch (err) {
      console.error('Error updating apartment:', err);
    }
  };

  const handleDeleteApartment = async (aptId) => {
    if (!window.confirm('Удалить эту квартиру?')) return;
    try {
      await axios.delete(`${API_URL}/houses/${selectedHouseId}/apartments/${aptId}`);
      fetchHouse(selectedHouseId);
    } catch (err) {
      console.error('Error deleting apartment:', err);
    }
  };

  const handleAddResident = async (aptId, residentData) => {
    try {
      await axios.post(`${API_URL}/houses/${selectedHouseId}/apartments/${aptId}/residents`, residentData);
      fetchHouse(selectedHouseId);
    } catch (err) {
      console.error('Error adding resident:', err);
    }
  };

  const handleUpdateResident = async (aptId, resId, data) => {
    try {
      await axios.put(`${API_URL}/houses/${selectedHouseId}/apartments/${aptId}/residents/${resId}`, data);
      fetchHouse(selectedHouseId);
      fetchHouses();
    } catch (err) {
      console.error('Error updating resident:', err);
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Учет продажи ключей для домофонов</h1>
        <p>Управление ключами, трубками и оплатой</p>
      </div>

      <div className="controls-bar">
        {selectedHouse ? (
          <>
            <button className="btn btn-secondary" onClick={() => { setSelectedHouseId(null); setSelectedHouse(null); }}>
              ← Назад к списку
            </button>
            <span className="controls-address">{selectedHouse.address}</span>
            <button className="btn btn-success" onClick={() => setShowAddApartment(true)}>
              + Квартира
            </button>
            <button className="btn btn-danger btn-small" onClick={handleDeleteHouse}>
              Удалить дом
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => setShowAddHouse(true)}>
              + Добавить дом
            </button>
            <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
              Импорт из файла
            </button>
          </>
        )}
      </div>

      {selectedHouse && (
        <>
          <HouseInfo house={selectedHouse} onUpdate={handleUpdateHouse} />
          <ApartmentTable
            house={selectedHouse}
            onDeleteApartment={handleDeleteApartment}
            onAddResident={handleAddResident}
            onUpdateResident={handleUpdateResident}
          />
        </>
      )}

      {!selectedHouse && (
        <>
          {houses.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🏢</div>
              <h3>Нет добавленных домов</h3>
              <p>Добавьте первый дом для начала работы</p>
            </div>
          ) : (
            <HouseList houses={houses} onSelect={setSelectedHouseId} />
          )}
        </>
      )}

      {showAddHouse && (
        <AddHouseModal onClose={() => setShowAddHouse(false)} onAdd={handleAddHouse} />
      )}

      {showAddApartment && (
        <AddApartmentModal onClose={() => setShowAddApartment(false)} onAdd={handleAddApartment} />
      )}

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onImport={() => { fetchHouses(); setShowImport(false); }} />
      )}
    </div>
  );
}

export default App;
