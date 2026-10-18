const express = require('express');

const connectDB = require('./config/db');

const studentRoutes = require('./routes/studentRoutes');

const app = express();

connectDB();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(express.json());

app.use('/api/students', studentRoutes);

app.get('/', (req, res) => {
	res.redirect('/api/students');
});

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
