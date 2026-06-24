import React, { useState } from 'react';

function ApartmentTable({ house, onDeleteApartment, onAddResident, onUpdateResident }) {
  const [editingCell, setEditingCell] = useState(null);
  const [newResidentAptId, setNewResidentAptId] = useState(null);

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
    onUpdateResident(aptId, resId, { rawData: newRawData });
    handleCellBlur();
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

  const totalCols = rawColumns.length + 1;

  return (
    <div className="table-wrapper">
      <table className="apartment-table">
        <thead>
          <tr>
            {rawColumns.map(col => (
              <th key={col}>{col}</th>
            ))}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {house.apartments.length === 0 && (
            <tr>
              <td colSpan={totalCols} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                Нет добавленных квартир. Нажмите "+ Квартира" или импортируйте данные.
              </td>
            </tr>
          )}
          {house.apartments.map(apt => (
            <React.Fragment key={apt.id}>
              {apt.residents.length === 0 && (
                <tr>
                  <td colSpan={rawColumns.length} style={{ color: '#9ca3af', fontStyle: 'italic' }}>
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
              {apt.residents.map((res) => (
                <tr key={res.id}>
                  {rawColumns.map(col => (
                    <td key={col}>{renderRawCell(apt.id, res.id, col, res.rawData?.[col])}</td>
                  ))}
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-small" onClick={() => setNewResidentAptId(apt.id)}>+ Жилец</button>
                      {apt.residents.length === 1 && (
                        <button className="btn btn-danger btn-small" onClick={() => onDeleteApartment(apt.id)}>Удалить</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {newResidentAptId === apt.id && (
                <tr>
                  <td colSpan={rawColumns.length}>
                    <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      Новая запись для квартиры
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-success btn-small" onClick={() => {
                        onAddResident(apt.id, {
                          name: '',
                          rawData: {},
                          hasContract: false,
                          contractStatus: 'unsigned',
                          keysSold: 0,
                          isPaid: false,
                          paymentMethod: '',
                          invoiceIssued: false,
                          tubeStatus: 'none',
                          tubePayment: false
                        });
                        setNewResidentAptId(null);
                      }}>Добавить</button>
                      <button className="btn btn-secondary btn-small" onClick={() => setNewResidentAptId(null)}>Отмена</button>
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
