const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const clientRoutes = require('./src/routes/clientRoutes');
const userRoutes = require('./src/routes/userRoutes');
const serverRoutes = require('./src/routes/serverRoutes');
const env = require('dotenv').config({ path: './.env' });

const DatabaseManager = require('./src/DatabaseManager');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: env.parsed.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

const PORT = process.env.PORT || 3000;

// Routes
app.use('/', clientRoutes);
app.use('/users', userRoutes);
app.use('/server', serverRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});