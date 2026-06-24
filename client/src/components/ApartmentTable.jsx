import React, { useState } from 'react';

function ApartmentTable({ house, onUpdateApartment, onDeleteApartment, onAddResident, onUpdateResident }) {
  const [editingCell, setEditingCell] = useState(null);
  const [newResidentAptId, setNewResidentAptId] = useState(null);
  const [newResidentName, setNewResidentName] = useState('');

  const handleCellClick = (aptId, resId, field) => {
    setEditingCell({ aptId, resId, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleUpdateField = (aptId, resId, field, value) => {
    onUpdateResident(aptId, resId, { [field]: value });
    handleCellBlur();
  };

  const handleTogglePaid = (aptId, resId, currentValue) => {
    onUpdateResident(aptId, resId, { isPaid: !currentValue });
  };

  const handleToggleInvoice = (aptId, resId, currentValue) => {
    onUpdateResident(aptId, resId, { invoiceIssued: !currentValue });
  };

  const handleToggleTubePayment = (aptId, resId, currentValue) => {
    onUpdateResident(aptId, resId, { tubePayment: !currentValue });
  };

  const handleAddResident = (aptId) => {
    if (!newResidentName.trim()) return;
    onAddResident(aptId, {
      name: newResidentName.trim(),
      keysSold: 0,
      isPaid: false,
      paymentMethod: '',
      invoiceIssued: false,
      tubeStatus: 'none',
      tubePayment: false
    });
    setNewResidentName('');
    setNewResidentAptId(null);
  };

  const renderEditableText = (aptId, resId, field, value) => {
    if (editingCell?.aptId === aptId && editingCell?.resId === resId && editingCell?.field === field) {
      return (
        <input
          type="text"
          defaultValue={value}
          autoFocus
          onBlur={(e) => handleUpdateField(aptId, resId, field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdateField(aptId, resId, field, e.target.value);
            if (e.key === 'Escape') handleCellBlur();
          }}
        />
      );
    }
    return (
      <span className="editable" onClick={() => handleCellClick(aptId, resId, field)}>
        {value || '—'}
      </span>
    );
  };

  const renderEditableNumber = (aptId, resId, field, value) => {
    if (editingCell?.aptId === aptId && editingCell?.resId === resId && editingCell?.field === field) {
      return (
        <input
          type="number"
          defaultValue={value}
          autoFocus
          min="0"
          onBlur={(e) => handleUpdateField(aptId, resId, field, parseInt(e.target.value) || 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdateField(aptId, resId, field, parseInt(e.target.value) || 0);
            if (e.key === 'Escape') handleCellBlur();
          }}
        />
      );
    }
    return (
      <span className="editable" onClick={() => handleCellClick(aptId, resId, field)}>
        {value}
      </span>
    );
  };

  const renderPaymentMethod = (aptId, resId, value) => {
    if (editingCell?.aptId === aptId && editingCell?.resId === resId && editingCell?.field === 'paymentMethod') {
      return (
        <select
          defaultValue={value}
          autoFocus
          onBlur={(e) => handleUpdateField(aptId, resId, 'paymentMethod', e.target.value)}
          onChange={(e) => handleUpdateField(aptId, resId, 'paymentMethod', e.target.value)}
        >
          <option value="">Не выбран</option>
          <option value="cash">Наличные</option>
          <option value="transfer">Перевод</option>
        </select>
      );
    }
    const labels = { cash: 'Наличные', transfer: 'Перевод' };
    const classes = { cash: 'badge-cash', transfer: 'badge-transfer' };
    return (
      <span className={`badge ${classes[value] || 'badge-none'}`} onClick={() => handleCellClick(aptId, resId, 'paymentMethod')} style={{ cursor: 'pointer' }}>
        {labels[value] || 'Не выбран'}
      </span>
    );
  };

  const renderTubeStatus = (aptId, resId, value) => {
    if (editingCell?.aptId === aptId && editingCell?.resId === resId && editingCell?.field === 'tubeStatus') {
      return (
        <select
          defaultValue={value}
          autoFocus
          onBlur={(e) => handleUpdateField(aptId, resId, 'tubeStatus', e.target.value)}
          onChange={(e) => handleUpdateField(aptId, resId, 'tubeStatus', e.target.value)}
        >
          <option value="none">Не установлена</option>
          <option value="installed">Установлена</option>
          <option value="needs_purchase">Требуется покупка</option>
        </select>
      );
    }
    const labels = { none: 'Не установлена', installed: 'Установлена', needs_purchase: 'Требуется покупка' };
    const classes = { none: 'badge-not-installed', installed: 'badge-installed', needs_purchase: 'badge-needs-purchase' };
    return (
      <span className={`badge ${classes[value] || 'badge-none'}`} onClick={() => handleCellClick(aptId, resId, 'tubeStatus')} style={{ cursor: 'pointer' }}>
        {labels[value] || 'Не установлена'}
      </span>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="apartment-table">
        <thead>
          <tr>
            <th>Кв.</th>
            <th>ФИО</th>
            <th>Кол-во ключей</th>
            <th>Оплачен</th>
            <th>Способ оплаты</th>
            <th>Счет выставлен</th>
            <th>Статус трубки</th>
            <th>Оплата трубки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {house.apartments.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                Нет добавленных квартир. Нажмите "+ Квартира" чтобы добавить.
              </td>
            </tr>
          )}
          {house.apartments.map(apt => (
            <React.Fragment key={apt.id}>
              {apt.residents.length === 0 && (
                <tr>
                  <td style={{ fontWeight: 600 }}>{apt.number}</td>
                  <td colSpan="7" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Нет жильцов
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => setNewResidentAptId(apt.id)}
                      >
                        + Жилец
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => onDeleteApartment(apt.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {apt.residents.map((res, idx) => (
                <tr key={res.id}>
                  {idx === 0 && (
                    <td rowSpan={apt.residents.length + (newResidentAptId === apt.id ? 1 : 0)} style={{ fontWeight: 600 }}>
                      {apt.number}
                    </td>
                  )}
                  <td>{renderEditableText(apt.id, res.id, 'name', res.name)}</td>
                  <td style={{ textAlign: 'center' }}>{renderEditableNumber(apt.id, res.id, 'keysSold', res.keysSold)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={res.isPaid}
                        onChange={() => handleTogglePaid(apt.id, res.id, res.isPaid)}
                      />
                    </div>
                  </td>
                  <td>{renderPaymentMethod(apt.id, res.id, res.paymentMethod)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={res.invoiceIssued}
                        onChange={() => handleToggleInvoice(apt.id, res.id, res.invoiceIssued)}
                      />
                    </div>
                  </td>
                  <td>{renderTubeStatus(apt.id, res.id, res.tubeStatus)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={res.tubePayment}
                        onChange={() => handleToggleTubePayment(apt.id, res.id, res.tubePayment)}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {idx === 0 && (
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setNewResidentAptId(apt.id)}
                        >
                          + Жилец
                        </button>
                      )}
                      {apt.residents.length === 1 && idx === 0 && (
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => onDeleteApartment(apt.id)}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {newResidentAptId === apt.id && (
                <tr>
                  {apt.residents.length === 0 && <td style={{ fontWeight: 600 }}>{apt.number}</td>}
                  <td colSpan={apt.residents.length === 0 ? 7 : 8}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="ФИО жильца"
                        value={newResidentName}
                        onChange={(e) => setNewResidentName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddResident(apt.id)}
                        autoFocus
                        style={{ flex: 1, padding: '6px 10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
                      />
                      <button className="btn btn-success btn-small" onClick={() => handleAddResident(apt.id)}>Добавить</button>
                      <button className="btn btn-secondary btn-small" onClick={() => { setNewResidentAptId(null); setNewResidentName(''); }}>Отмена</button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApartmentTable;
