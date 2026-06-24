import React from 'react';

function HouseList({ houses, onSelect }) {
  if (houses.length === 0) return null;

  return (
    <div className="house-list">
      {houses.map(house => {
        const connected = house.apartments ? house.apartments.filter(apt => apt.residents.some(r => r.hasContract)).length : 0;
        return (
          <div key={house.id} className="house-card" onClick={() => onSelect(house.id)}>
            <div className="house-card-address">{house.address}</div>
            <div className="house-card-stats">
              <div className="house-card-stat">
                <span className="house-card-stat-label">Абонплата</span>
                <span className="house-card-stat-value">{house.monthlyFee} руб/мес</span>
              </div>
              <div className="house-card-stat">
                <span className="house-card-stat-label">Подключено</span>
                <span className="house-card-stat-value">{connected} из {house.totalApartments}</span>
              </div>
              <div className="house-card-stat">
                <span className="house-card-stat-label">Квартир в базе</span>
                <span className="house-card-stat-value">{house.apartments ? house.apartments.length : 0}</span>
              </div>
            </div>
            <div className="house-card-footer">
              Открыть →
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default HouseList;
