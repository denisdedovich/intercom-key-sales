import React, { useState } from 'react';

function AddHouseModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    address: '',
    totalApartments: '',
    connectedApartments: '',
    monthlyFee: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.address.trim()) return;
    onAdd({
      address: form.address.trim(),
      totalApartments: parseInt(form.totalApartments) || 0,
      connectedApartments: parseInt(form.connectedApartments) || 0,
      monthlyFee: parseFloat(form.monthlyFee) || 0
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Добавить новый дом</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Адрес дома</label>
            <input
              type="text"
              placeholder="ул. Примерная, д. 10"
              value={form.address}
              onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Всего квартир</label>
            <input
              type="number"
              placeholder="50"
              min="0"
              value={form.totalApartments}
              onChange={(e) => setForm(prev => ({ ...prev, totalApartments: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Подключено квартир</label>
            <input
              type="number"
              placeholder="30"
              min="0"
              value={form.connectedApartments}
              onChange={(e) => setForm(prev => ({ ...prev, connectedApartments: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Абонплата в месяц (руб. с квартиры)</label>
            <input
              type="number"
              step="0.01"
              placeholder="150"
              min="0"
              value={form.monthlyFee}
              onChange={(e) => setForm(prev => ({ ...prev, monthlyFee: e.target.value }))}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHouseModal;
