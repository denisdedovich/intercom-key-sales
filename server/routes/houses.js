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
  const house = {
    id: uuidv4(),
    address: req.body.address || '',
    totalApartments: req.body.totalApartments || 0,
    connectedApartments: req.body.connectedApartments || 0,
    monthlyFee: req.body.monthlyFee || 0,
    apartments: []
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

router.post('/:houseId/apartments/:aptId/residents', (req, res) => {
  const db = readDB();
  const house = db.houses.find(h => h.id === req.params.houseId);
  if (!house) return res.status(404).json({ error: 'House not found' });
  const apt = house.apartments.find(a => a.id === req.params.aptId);
  if (!apt) return res.status(404).json({ error: 'Apartment not found' });
  const resident = {
    id: uuidv4(),
    name: req.body.name || '',
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

module.exports = router;
