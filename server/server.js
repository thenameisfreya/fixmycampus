const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const issueRoutes = require('./routes/issues');
const userRoutes = require('./routes/users');
const resourceRoutes = require('./routes/resources');
const handleErrors = require('./middleware/handleErrors');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/api/status', (req, res) => res.json({ 
  message: 'FixMyCampus API is running',
  timestamp: new Date()
}));

app.use(handleErrors);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully');
    app.listen(PORT, () => console.log(Server started on port ${PORT}));
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
};

startServer();