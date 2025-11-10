const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); 

const app = express();
app.use(express.json());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Backend connected to MongoDB!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
