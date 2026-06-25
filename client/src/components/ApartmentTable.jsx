import React, { useState } from 'react';

function ApartmentTable({ house, onDeleteApartment, onDeleteResident, onAddResident, onUpdateResident }) {
  const [editingCell, setEditingCell] = useState(null);

  const rawColumns = house.columns?.length > 0
    ? house.columns
    : [...new Set(house.apartments.flatMap(apt =>
        apt.residents.flatMap(r => Object.keys(r.rawData || {}))
      ))];

  const handleCellClick = (aptId, resId, field) => {
    setEditingCell({ aptId, resId, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleUpdateRawData = (aptId, resId, colName, value) => {
    const resident = house.apartments.find(a => a.id === aptId)?.residents.find(r => r.id === resId);
    if (!resident) return;
    const newRawData = { ...resident.rawData, [colName]: value };
    if (colName === 'заказано доп. ключей') {
      const n = parseInt(value, 10);
      newRawData['сумма'] = isNaN(n) || n === 0 ? '' : String(n * 300);
    }
    onUpdateResident(aptId, resId, { rawData: newRawData });
    handleCellBlur();
  };

  const isYesNoColumn = (colName) => colName === 'наличие договора' || colName === 'выданы базовые ключи';

  const PAYMENT_OPTIONS = [
    { value: '', label: '—' },
    { value: 'договор', label: 'Договор' },
    { value: 'наличные', label: 'Наличные' },
    { value: 'карта', label: 'Карта' },
  ];

  const renderYesNoSelect = (aptId, resId, colName, value) => {
    const isYes = value === '+';
    return (
      <select
        className={`badge-select ${isYes ? 'badge-yes' : 'badge-no'}`}
        value={isYes ? 'yes' : 'no'}
        onChange={(e) => {
          handleUpdateRawData(aptId, resId, colName, e.target.value === 'yes' ? '+' : '');
        }}
      >
        <option value="yes">Да</option>
        <option value="no">Нет</option>
      </select>
    );
  };

  const renderPaymentSelect = (aptId, resId, colName, value) => {
    return (
      <select
        className={`badge-select badge-payment-${value || 'none'}`}
        value={value || ''}
        onChange={(e) => handleUpdateRawData(aptId, resId, colName, e.target.value)}
      >
        {PAYMENT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };

  const renderRawCell = (aptId, resId, colName, value) => {
    if (isYesNoColumn(colName)) {
      return renderYesNoSelect(aptId, resId, colName, value);
    }
    if (colName === 'оплата') {
      return renderPaymentSelect(aptId, resId, colName, value);
    }
    if (colName === 'сумма') {
      return <span className="cell-readonly">{value || ''}</span>;
    }
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
    const isComment = colName === 'комментарии';
    return (
      <span className={`editable ${isComment ? 'editable-comment' : ''}`} onClick={() => handleCellClick(aptId, resId, cellKey)}>
        {value || (isComment ? <span className="placeholder-text">Введите комментарий...</span> : '')}
      </span>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="apartment-table">
        <thead>
          <tr>
            <th style={{ width: '32px' }}></th>
            {rawColumns.map(col => (
              <th key={col}>
                {col}
                {col === 'выданы базовые ключи' && (
                  <span className="th-hint">баз. = 2 шт</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {house.apartments.length === 0 && (
            <tr>
              <td colSpan={rawColumns.length + 1} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                Нет добавленных квартир. Нажмите "+ Квартира" или импортируйте данные.
              </td>
            </tr>
          )}
          {house.apartments.map(apt => (
            <React.Fragment key={apt.id}>
              {apt.residents.length === 0 && (
                <tr>
                  <td></td>
                  <td colSpan={rawColumns.length} style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Нет жильцов
                  </td>
                </tr>
              )}
              {apt.residents.map((res) => (
                <tr key={res.id} className="resident-row">
                  <td className="row-delete">
                    <button className="btn-delete-row" onClick={() => onDeleteResident(apt.id, res.id)} title="Удалить жильца">✕</button>
                  </td>
                  {rawColumns.map(col => (
                    <td key={col}>{renderRawCell(apt.id, res.id, col, res.rawData?.[col])}</td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApartmentTable;
