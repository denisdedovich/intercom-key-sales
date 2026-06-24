import React, { useState } from 'react';

function ApartmentTable({ house, onUpdateApartment, onDeleteApartment, onAddResident, onUpdateResident }) {
  const [editingCell, setEditingCell] = useState(null);
  const [newResidentAptId, setNewResidentAptId] = useState(null);
  const [newResidentName, setNewResidentName] = useState('');

  const rawColumns = house.columns || [];
  const hasRawData = rawColumns.length > 0;

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

  const handleUpdateRawData = (aptId, resId, colName, value) => {
    const resident = house.apartments.find(a => a.id === aptId)?.residents.find(r => r.id === resId);
    if (!resident) return;
    const newRawData = { ...resident.rawData, [colName]: value };
    onUpdateResident(aptId, resId, { rawData: newRawData });
    handleCellBlur();
  };

  const renderEditableText = (aptId, resId, field, value) => {
    if (editingCell?.aptId === aptId && editingCell?.resId === resId && editingCell?.field === field) {
      return (
        <input
          type="text"
          defaultValue={value || ''}
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
          defaultValue={value || 0}
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
          defaultValue={value || ''}
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
          defaultValue={value || 'none'}
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

  const renderContractStatus = (aptId, resId, value) => {
    if (editingCell?.aptId === aptId && editingCell?.resId === resId && editingCell?.field === 'hasContract') {
      return (
        <select
          defaultValue={value ? 'yes' : 'no'}
          autoFocus
          onBlur={(e) => handleUpdateField(aptId, resId, 'hasContract', e.target.value === 'yes')}
          onChange={(e) => handleUpdateField(aptId, resId, 'hasContract', e.target.value === 'yes')}
        >
          <option value="no">Нет</option>
          <option value="yes">Да</option>
        </select>
      );
    }
    return (
      <span
        className={`badge ${value ? 'badge-installed' : 'badge-not-installed'}`}
        onClick={() => handleCellClick(aptId, resId, 'hasContract')}
        style={{ cursor: 'pointer' }}
      >
        {value ? 'Да' : 'Нет'}
      </span>
    );
  };

  const renderRawCell = (aptId, resId, colName, value) => {
    const cellKey = `raw_${colName}`;
    if (editingCell?.aptId === aptId && editingCell?.resId === resId && editingCell?.field === cellKey) {
      return (
        <input
          type="text"
          defaultValue={value || ''}
          autoFocus
          onBlur={(e) => handleUpdateRawData(aptId, resId, colName, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdateRawData(aptId, resId, colName, e.target.value);
            if (e.key === 'Escape') handleCellBlur();
          }}
        />
      );
    }
    return (
      <span className="editable" onClick={() => handleCellClick(aptId, resId, cellKey)}>
        {value || '—'}
      </span>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="apartment-table">
        <thead>
          <tr>
            <th>Кв.</th>
            {rawColumns.map(col => (
              <th key={col}>{col}</th>
            ))}
            <th>ФИО</th>
            <th>Ключи</th>
            <th>Оплачен</th>
            <th>Договор</th>
            <th>Способ оплаты</th>
            <th>Счет</th>
            <th>Статус трубки</th>
            <th>Оплата трубки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {house.apartments.length === 0 && (
            <tr>
              <td colSpan={rawColumns.length + 10} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                Нет добавленных квартир. Нажмите "+ Квартира" или импортируйте данные.
              </td>
            </tr>
          )}
          {house.apartments.map(apt => (
            <React.Fragment key={apt.id}>
              {apt.residents.length === 0 && (
                <tr>
                  <td style={{ fontWeight: 600 }}>{apt.number}</td>
                  <td colSpan={rawColumns.length + 8} style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Нет жильцов
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-small" onClick={() => setNewResidentAptId(apt.id)}>+ Жилец</button>
                      <button className="btn btn-danger btn-small" onClick={() => onDeleteApartment(apt.id)}>Удалить</button>
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
                  {rawColumns.map(col => (
                    <td key={col}>{renderRawCell(apt.id, res.id, col, res.rawData?.[col])}</td>
                  ))}
                  <td>{renderEditableText(apt.id, res.id, 'name', res.name)}</td>
                  <td style={{ textAlign: 'center' }}>{renderEditableNumber(apt.id, res.id, 'keysSold', res.keysSold)}</td>
                   <td style={{ textAlign: 'center' }}>
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={res.isPaid}
                        onChange={() => onUpdateResident(apt.id, res.id, { isPaid: !res.isPaid })}
                      />
                    </div>
                  </td>
                  <td>{renderContractStatus(apt.id, res.id, res.hasContract || false)}</td>
                  <td>{renderPaymentMethod(apt.id, res.id, res.paymentMethod)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={res.invoiceIssued}
                        onChange={() => onUpdateResident(apt.id, res.id, { invoiceIssued: !res.invoiceIssued })}
                      />
                    </div>
                  </td>
                  <td>{renderTubeStatus(apt.id, res.id, res.tubeStatus)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={res.tubePayment}
                        onChange={() => onUpdateResident(apt.id, res.id, { tubePayment: !res.tubePayment })}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {idx === 0 && (
                        <button className="btn btn-secondary btn-small" onClick={() => setNewResidentAptId(apt.id)}>+ Жилец</button>
                      )}
                      {apt.residents.length === 1 && idx === 0 && (
                        <button className="btn btn-danger btn-small" onClick={() => onDeleteApartment(apt.id)}>Удалить</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {newResidentAptId === apt.id && (
                <tr>
                  {apt.residents.length === 0 && <td style={{ fontWeight: 600 }}>{apt.number}</td>}
                  <td colSpan={rawColumns.length + 9}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="ФИО жильца"
                        value={newResidentName}
                        onChange={(e) => setNewResidentName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newResidentName.trim()) {
                            onAddResident(apt.id, {
                              name: newResidentName.trim(),
                              rawData: {},
                              hasContract: false,
                              keysSold: 0,
                              isPaid: false,
                              paymentMethod: '',
                              invoiceIssued: false,
                              tubeStatus: 'none',
                              tubePayment: false
                            });
                            setNewResidentName('');
                            setNewResidentAptId(null);
                          }
                        }}
                        autoFocus
                        style={{ flex: 1, padding: '6px 10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
                      />
                      <button className="btn btn-success btn-small" onClick={() => {
                        if (newResidentName.trim()) {
                          onAddResident(apt.id, {
                            name: newResidentName.trim(),
                            rawData: {},
                            hasContract: false,
                            keysSold: 0,
                            isPaid: false,
                            paymentMethod: '',
                            invoiceIssued: false,
                            tubeStatus: 'none',
                            tubePayment: false
                          });
                          setNewResidentName('');
                          setNewResidentAptId(null);
                        }
                      }}>Добавить</button>
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
