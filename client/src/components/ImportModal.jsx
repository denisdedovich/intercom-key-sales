import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function ImportModal({ onClose, onImport }) {
  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ address: '', apartment: '', name: '' });
  const [houseSettings, setHouseSettings] = useState({ address: '', totalApartments: 0, connectedApartments: 0, monthlyFee: 0 });
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (file) => {
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          if (results.data.length === 0) {
            setError('Файл пустой');
            return;
          }
          setColumns(results.meta.fields || Object.keys(results.data[0]));
          setRows(results.data);
          setStep(2);
        },
        error: (err) => setError('Ошибка чтения CSV: ' + err.message)
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length === 0) {
          setError('Файл пустой');
          return;
        }
        setColumns(Object.keys(data[0]));
        setRows(data);
        setStep(2);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Поддерживаются только CSV и Excel (.xlsx, .xls) файлы.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const canProceedToStep3 = mapping.address || mapping.apartment || mapping.name;

  const handleImport = async () => {
    setImporting(true);
    setError('');
    try {
      await axios.post(`${API_URL}/houses/import-raw`, {
        columns,
        rows,
        mapping,
        houseSettings: !mapping.address ? houseSettings : undefined
      });
      onImport();
    } catch (err) {
      setError('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      setImporting(false);
    }
  };

  const previewRows = rows.slice(0, 10);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <h2>Импорт данных из файла</h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: step >= s ? '#667eea' : '#e5e7eb'
            }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Шаг 1: Выберите файл для загрузки
            </p>
            <div
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileRef.current.click()}
              style={{
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f9fafb',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📄</div>
              <p style={{ fontSize: '15px', color: '#374151', fontWeight: 600 }}>
                Перетащите файл сюда или нажмите для выбора
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                CSV, Excel (.xlsx, .xls)
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Шаг 2: Укажите какие столбцы соответствуют полям (остальные отобразятся как есть)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>Столбец "Адрес дома"</label>
                <select value={mapping.address} onChange={(e) => setMapping(prev => ({ ...prev, address: e.target.value }))}>
                  <option value="">-- Не задан --</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Столбец "Номер квартиры"</label>
                <select value={mapping.apartment} onChange={(e) => setMapping(prev => ({ ...prev, apartment: e.target.value }))}>
                  <option value="">-- Не задан --</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Столбец "ФИО"</label>
                <select value={mapping.name} onChange={(e) => setMapping(prev => ({ ...prev, name: e.target.value }))}>
                  <option value="">-- Не задан --</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            </div>

            {!mapping.address && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#92400e', fontWeight: 600, marginBottom: '8px' }}>
                  Столбец адреса не задан — укажите параметры дома:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Адрес</label>
                    <input type="text" value={houseSettings.address} onChange={(e) => setHouseSettings(prev => ({ ...prev, address: e.target.value }))} placeholder="ул. Ленина, д. 10" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Всего кв.</label>
                    <input type="number" value={houseSettings.totalApartments || ''} onChange={(e) => setHouseSettings(prev => ({ ...prev, totalApartments: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Подключено</label>
                    <input type="number" value={houseSettings.connectedApartments || ''} onChange={(e) => setHouseSettings(prev => ({ ...prev, connectedApartments: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Абонплата</label>
                    <input type="number" value={houseSettings.monthlyFee || ''} onChange={(e) => setHouseSettings(prev => ({ ...prev, monthlyFee: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ maxHeight: '250px', overflow: 'auto', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <table className="apartment-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col} style={{
                        background: [mapping.address, mapping.apartment, mapping.name].includes(col) ? '#e8eaff' : '#f8fafc'
                      }}>
                        {col}
                        {[mapping.address, mapping.apartment, mapping.name].includes(col) && (
                          <span style={{ color: '#667eea', marginLeft: '4px' }}>
                            {col === mapping.address ? ' (адрес)' : col === mapping.apartment ? ' (кв)' : ' (ФИО)'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i}>
                      {columns.map(col => (
                        <td key={col}>{row[col] || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > 10 && (
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                Показано 10 из {rows.length} строк
              </p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Шаг 3: Предпросмотр — столбцы из файла + колонки учета
            </p>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div className="info-item">
                <span className="label">Строк</span>
                <span className="value highlight">{rows.length}</span>
              </div>
              <div className="info-item">
                <span className="label">Столбцов</span>
                <span className="value highlight">{columns.length}</span>
              </div>
              <div className="info-item">
                <span className="label">Адрес</span>
                <span className="value">{mapping.address ? `Столбец: ${mapping.address}` : houseSettings.address || '—'}</span>
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <table className="apartment-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    {columns.filter(c => c !== mapping.address).map(col => (
                      <th key={col}>{col}</th>
                    ))}
                    <th style={{ background: '#dcfce7', color: '#166534' }}>Ключи</th>
                    <th style={{ background: '#dcfce7', color: '#166534' }}>Оплачен</th>
                    <th style={{ background: '#dcfce7', color: '#166534' }}>Способ</th>
                    <th style={{ background: '#dcfce7', color: '#166534' }}>Счет</th>
                    <th style={{ background: '#dcfce7', color: '#166534' }}>Трубка</th>
                    <th style={{ background: '#dcfce7', color: '#166534' }}>Оплата трубки</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {columns.filter(c => c !== mapping.address).map(col => (
                        <td key={col}>{row[col] || ''}</td>
                      ))}
                      <td style={{ textAlign: 'center' }}>0</td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-unpaid">Нет</span></td>
                      <td><span className="badge badge-none">—</span></td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-unpaid">Нет</span></td>
                      <td><span className="badge badge-not-installed">—</span></td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-unpaid">Нет</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > 10 && (
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                Предпросмотр: 10 из {rows.length} строк. Остальные будут импортированы.
              </p>
            )}
          </>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Назад</button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          {step === 2 && (
            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!canProceedToStep3}>
              Далее
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-success" onClick={handleImport} disabled={importing}>
              {importing ? 'Импорт...' : 'Импортировать'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
