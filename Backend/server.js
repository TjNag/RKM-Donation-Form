const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(bodyParser.json());  // Parse JSON bodies

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Replace with your MySQL username
    password: '',  // Replace with your MySQL password
    database: 'rkmg_offline_form'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as ID ' + db.threadId);
});

// POST endpoint to handle form submissions
app.post('/submit-form', (req, res) => {
    const { name, address, district, city, state, pinCode, mobileNo, altMobileNo, email, idType, idNo, purposeOfDonation, amount } = req.body;
    const sql = `
        INSERT INTO BillingRecords
        (name, address, district, city, state, pinCode, mobileNo, altMobileNo, email, idType, idNo, purposeOfDonation, amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [name, address, district, city, state, pinCode, mobileNo, altMobileNo, email, idType, idNo, purposeOfDonation, amount], (error, results) => {
        if (error) {
            console.error('Failed to insert data into database: ' + error.stack);
            res.status(500).send('Failed to store data');
        } else {
            console.log('Data inserted successfully: ' + results.insertId);
            res.status(200).send('Data stored successfully');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
