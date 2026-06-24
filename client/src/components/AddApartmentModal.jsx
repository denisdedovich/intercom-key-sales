import React, { useState } from 'react';

function AddApartmentModal({ onClose, onAdd }) {
  const [number, setNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!number.trim()) return;
    onAdd({ number: number.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Добавить квартиру</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Номер квартиры</label>
            <input
              type="text"
              placeholder="1"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              autoFocus
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

export default AddApartmentModal;
