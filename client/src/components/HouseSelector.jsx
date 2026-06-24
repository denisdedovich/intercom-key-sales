import React from 'react';

function HouseSelector({ houses, selectedId, onSelect }) {
  return (
    <select
      className="house-select"
      value={selectedId || ''}
      onChange={(e) => onSelect(e.target.value || null)}
    >
      <option value="">-- Выберите адрес дома --</option>
      {houses.map(house => (
        <option key={house.id} value={house.id}>
          {house.address}
        </option>
      ))}
    </select>
  );
}

export default HouseSelector;
