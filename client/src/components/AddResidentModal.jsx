import React, { useState } from 'react';

const YES_NO_COLUMNS = ['наличие договора', 'выданы базовые ключи', 'Провели продажу'];

function AddResidentModal({ house, onClose, onAdd }) {
  const [aptNumber, setAptNumber] = useState('');
  const [customApt, setCustomApt] = useState('');
  const [rawData, setRawData] = useState({});

  const isYesNoCol = (col) => YES_NO_COLUMNS.includes(col);

  const isNumberCol = (col) =>
    ['заказано доп. ключей', 'выпущено ключей', 'выдано ключей', 'сумма', 'деньги', '№ подъезда', '№ квартиры'].includes(col);

  const effectiveApt = aptNumber === '__custom__' ? customApt.trim() : aptNumber;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!effectiveApt) return;

    const finalRawData = { ...rawData, '№ квартиры': effectiveApt };
    onAdd(effectiveApt, finalRawData);
  };

  const handleRawChange = (col, value) => {
    setRawData(prev => ({ ...prev, [col]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Добавить жильца</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Квартира</label>
            <select value={aptNumber} onChange={(e) => setAptNumber(e.target.value)} autoFocus>
              <option value="">— Выберите квартиру —</option>
              {house.apartments.map(apt => (
                <option key={apt.id} value={apt.number}>Кв. {apt.number}</option>
              ))}
              <option value="__custom__">Другой номер...</option>
            </select>
          </div>

          {aptNumber === '__custom__' && (
            <div className="form-group">
              <label>Номер квартиры</label>
              <input
                type="text"
                placeholder="Введите номер"
                value={customApt}
                onChange={(e) => setCustomApt(e.target.value)}
              />
            </div>
          )}

          <div className="form-divider"></div>

          {(house.columns || []).map(col => {
            if (col === '№ квартиры') return null;

            if (isYesNoCol(col)) {
              return (
                <div className="form-group" key={col}>
                  <label>{col}</label>
                  <select
                    value={rawData[col] === '+' ? 'yes' : 'no'}
                    onChange={(e) => handleRawChange(col, e.target.value === 'yes' ? '+' : '')}
                  >
                    <option value="no">Нет</option>
                    <option value="yes">Да</option>
                  </select>
                </div>
              );
            }

            if (isNumberCol(col)) {
              return (
                <div className="form-group" key={col}>
                  <label>{col}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={rawData[col] || ''}
                    onChange={(e) => handleRawChange(col, e.target.value)}
                  />
                </div>
              );
            }

            return (
              <div className="form-group" key={col}>
                <label>{col}</label>
                <input
                  type="text"
                  placeholder=""
                  value={rawData[col] || ''}
                  onChange={(e) => handleRawChange(col, e.target.value)}
                />
              </div>
            );
          })}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary" disabled={!effectiveApt}>Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddResidentModal;
