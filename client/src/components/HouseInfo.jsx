import React, { useState } from 'react';

function HouseInfo({ house, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    address: house.address,
    totalApartments: house.totalApartments,
    connectedApartments: house.connectedApartments,
    monthlyFee: house.monthlyFee
  });

  const handleSave = () => {
    onUpdate({
      address: form.address,
      totalApartments: parseInt(form.totalApartments) || 0,
      connectedApartments: parseInt(form.connectedApartments) || 0,
      monthlyFee: parseFloat(form.monthlyFee) || 0
    });
    setEditing(false);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (editing) {
    return (
      <div className="house-info" style={{ flexDirection: 'column', gap: '12px' }}>
        <div className="form-group">
          <label>Адрес</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label>Всего квартир</label>
            <input
              type="number"
              value={form.totalApartments}
              onChange={(e) => handleChange('totalApartments', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label>Подключено</label>
            <input
              type="number"
              value={form.connectedApartments}
              onChange={(e) => handleChange('connectedApartments', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label>Абонплата (руб/мес)</label>
            <input
              type="number"
              step="0.01"
              value={form.monthlyFee}
              onChange={(e) => handleChange('monthlyFee', e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-success btn-small" onClick={handleSave}>Сохранить</button>
          <button className="btn btn-secondary btn-small" onClick={() => setEditing(false)}>Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div className="house-info" style={{ cursor: 'pointer' }} onClick={() => setEditing(true)}>
      <div className="info-item">
        <span className="label">Адрес</span>
        <span className="value">{house.address}</span>
      </div>
      <div className="info-item">
        <span className="label">Всего квартир</span>
        <span className="value highlight">{house.totalApartments}</span>
      </div>
      <div className="info-item">
        <span className="label">Подключено</span>
        <span className="value highlight">{house.connectedApartments}</span>
      </div>
      <div className="info-item">
        <span className="label">Абонплата/мес</span>
        <span className="value highlight">{house.monthlyFee} руб.</span>
      </div>
      <div className="info-item">
        <span className="label">Фактически квартир</span>
        <span className="value">{house.apartments.length}</span>
      </div>
    </div>
  );
}

export default HouseInfo;
