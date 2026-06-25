const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.houses);
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  res.json(house);
});

router.post('/', (req, res) => {
  const db = readDB();
  const total = parseInt(req.body.totalApartments) || 0;
  const apartments = [];
  for (let i = 1; i <= total; i++) {
    apartments.push({
      id: uuidv4(),
      number: String(i),
      residents: []
    });
  }
  const house = {
    id: uuidv4(),
    address: req.body.address || '',
    totalApartments: total,
    connectedApartments: req.body.connectedApartments || 0,
    monthlyFee: req.body.monthlyFee || 0,
    apartments
  };
  db.houses.push(house);
  writeDB(db);
  res.status(201).json(house);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const index = db.houses.findIndex(h => h.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'House not found' });
  db.houses[index] = { ...db.houses[index], ...req.body, id: req.params.id };
  writeDB(db);
  res.json(db.houses[index]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  db.houses = db.houses.filter(h => h.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

router.post('/:id/apartments', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  const apartment = {
    id: uuidv4(),
    number: req.body.number || '',
    residents: []
  };
  house.apartments.push(apartment);
  writeDB(db);
  res.status(201).json(apartment);
});

router.put('/:houseId/apartments/:aptId', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.houseId);
  if (!house) return res.status(404).json({ error: 'House not found' });
  const aptIndex = house.apartments.findIndex(a => a.id === req.params.aptId);
  if (aptIndex === -1) return res.status(404).json({ error: 'Apartment not found' });
  house.apartments[aptIndex] = { ...house.apartments[aptIndex], ...req.body, id: req.params.aptId };
  writeDB(db);
  res.json(house.apartments[aptIndex]);
});

router.delete('/:houseId/apartments/:aptId', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.houseId);
  if (!house) return res.status(404).json({ error: 'House not found' });
  house.apartments = house.apartments.filter(a => a.id !== req.params.aptId);
  writeDB(db);
  res.json({ success: true });
});

router.put('/:houseId/apartments/:aptId/residents/:resId', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.houseId);
  if (!house) return res.status(404).json({ error: 'House not found' });
  const apt = house.apartments.find(a => a.id === req.params.aptId);
  if (!apt) return res.status(404).json({ error: 'Apartment not found' });
  const resIndex = apt.residents.findIndex(r => r.id === req.params.resId);
  if (resIndex === -1) return res.status(404).json({ error: 'Resident not found' });
  apt.residents[resIndex] = { ...apt.residents[resIndex], ...req.body, id: req.params.resId };
  writeDB(db);
  res.json(apt.residents[resIndex]);
});

router.delete('/:houseId/apartments/:aptId/residents/:resId', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.houseId);
  if (!house) return res.status(404).json({ error: 'House not found' });
  const apt = house.apartments.find(a => a.id === req.params.aptId);
  if (!apt) return res.status(404).json({ error: 'Apartment not found' });
  apt.residents = apt.residents.filter(r => r.id !== req.params.resId);
  writeDB(db);
  res.json({ success: true });
});

router.post('/:houseId/apartments/:aptId/residents', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.houseId);
  if (!house) return res.status(404).json({ error: 'House not found' });
  const apt = house.apartments.find(a => a.id === req.params.aptId);
  if (!apt) return res.status(404).json({ error: 'Apartment not found' });
  const resident = {
    id: uuidv4(),
    rawData: req.body.rawData || {},
    name: req.body.name || '',
    hasContract: req.body.hasContract || false,
    contractStatus: req.body.contractStatus || 'unsigned',
    keysSold: req.body.keysSold || 0,
    isPaid: req.body.isPaid || false,
    paymentMethod: req.body.paymentMethod || '',
    invoiceIssued: req.body.invoiceIssued || false,
    tubeStatus: req.body.tubeStatus || 'none',
    tubePayment: req.body.tubePayment || false
  };
  apt.residents.push(resident);
  writeDB(db);
  res.status(201).json(resident);
});

router.post('/import-raw', (req, res) => {
  const { columns, rows, mapping, houseSettings } = req.body;
  if (!rows || !Array.isArray(rows) || !mapping) {
    return res.status(400).json({ error: 'Invalid import data' });
  }
  const db = readDB();
  const houseAddressCol = mapping.address;
  const apartmentCol = mapping.apartment;
  const nameCol = mapping.name;
  const housesMap = {};

  for (const row of rows) {
    const address = houseAddressCol ? (row[houseAddressCol] || '').trim() : (houseSettings?.address || 'Импорт');
    const aptNum = apartmentCol ? (row[apartmentCol] || '').toString().trim() : '';
    const personName = nameCol ? (row[nameCol] || '').toString().trim() : '';

    if (!housesMap[address]) {
      const allColumns = [...new Set(rows.flatMap(r => Object.keys(r)))];
      housesMap[address] = {
        address,
        columns: allColumns,
        totalApartments: houseSettings?.totalApartments || 0,
        connectedApartments: houseSettings?.connectedApartments || 0,
        monthlyFee: houseSettings?.monthlyFee || 0,
        apartments: {}
      };
    }

    const house = housesMap[address];
    const aptKey = aptNum || '_no_apt';

    if (!house.apartments[aptKey]) {
      house.apartments[aptKey] = { number: aptNum, residents: [] };
    }

    const resident = {
      rawData: { ...row },
      name: personName,
      keysSold: 0,
      isPaid: false,
      paymentMethod: '',
      invoiceIssued: false,
      tubeStatus: 'none',
      tubePayment: false
    };

    house.apartments[aptKey].residents.push(resident);
  }

  for (const address of Object.keys(housesMap)) {
    const importHouse = housesMap[address];
    const existing = db.houses.find(h => h.address.toLowerCase() === address.toLowerCase());

    if (existing) {
      existing.columns = importHouse.columns;
      existing.totalApartments = importHouse.totalApartments || existing.totalApartments;
      existing.connectedApartments = importHouse.connectedApartments || existing.connectedApartments;
      existing.monthlyFee = importHouse.monthlyFee || existing.monthlyFee;
      for (const apt of Object.values(importHouse.apartments)) {
        const existingApt = existing.apartments.find(a => a.number === apt.number);
        if (existingApt) {
          existingApt.residents.push(...apt.residents.map(r => ({ ...r, id: uuidv4() })));
        } else {
          existing.apartments.push({
            id: uuidv4(),
            number: apt.number,
            residents: apt.residents.map(r => ({ ...r, id: uuidv4() }))
          });
        }
      }
    } else {
      const newHouse = {
        id: uuidv4(),
        address: importHouse.address,
        columns: importHouse.columns,
        totalApartments: importHouse.totalApartments,
        connectedApartments: importHouse.connectedApartments,
        monthlyFee: importHouse.monthlyFee,
        apartments: Object.values(importHouse.apartments).map(apt => ({
          id: uuidv4(),
          number: apt.number,
          residents: apt.residents.map(r => ({ ...r, id: uuidv4() }))
        }))
      };
      db.houses.push(newHouse);
    }
  }

  writeDB(db);
  res.json({ success: true, housesCount: db.houses.length });
});

module.exports = router;
