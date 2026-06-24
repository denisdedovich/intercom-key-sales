const express = require('express');
const cors = require('cors');
const housesRouter = require('./routes/houses');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/houses', housesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
