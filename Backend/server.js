require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const ExcelJS = require('exceljs');
const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Establish a MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rkmg_offline_form'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the MySQL database:', err);
        return;
    }
    console.log('Successfully connected to the MySQL database.');
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT password FROM admin_users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Database error');
        }
        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) {
                    return res.status(500).send('Authentication error');
                }
                if (isMatch) {
                    res.json({ success: true });
                } else {
                    res.status(401).send('Invalid credentials');
                }
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Add user endpoint
app.post('/api/add-user', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO admin_users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Failed to add user:', err);
            return res.status(500).send('Failed to add user');
        }
        res.json({ success: true, message: 'User added successfully' });
    });
});

// POST endpoint to handle form submissions
app.post('/api/submit-form', (req, res) => {
    const { name, address, district, city, state, pinCode, mobileNo, altMobileNo, email, idType, idNo, purposeOfDonation, donationMethod, amount } = req.body;
    const sql = `
        INSERT INTO billingrecords
        (name, address, district, city, state, pinCode, mobileNo, altMobileNo, email, idType, idNo, purposeOfDonation, donationMethod, amount, submissionDateTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
    `;
    db.query(sql, [name, address, district, city, state, pinCode, mobileNo, altMobileNo, email, idType, idNo, purposeOfDonation, donationMethod, amount], (err, results) => {
        if (err) {
            console.error('Failed to insert data:', err);
            return res.status(500).send('Failed to insert data');
        }
        res.status(200).send('Data submitted successfully');
    });
});

// GET endpoint to fetch all records with optional filters
app.get('/api/records', (req, res) => {
    const { column, value } = req.query;
    let sql = 'SELECT * FROM billingrecords WHERE 1=1';
    if (column && value) {
        sql += ` AND ${mysql.escapeId(column)} LIKE ?`;
        db.query(sql, [`%${value}%`], (err, results) => {
            if (err) {
                console.error('Failed to fetch records:', err);
                return res.status(500).send('Failed to fetch records');
            }
            res.json(results);
        });
    } else {
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Failed to fetch records:', err);
                return res.status(500).send('Failed to fetch records');
            }
            res.json(results);
        });
    }
});

// GET endpoint to download records as an Excel file
app.get('/api/download-records', async (req, res) => {
    const { column, value } = req.query;
    let sql = 'SELECT * FROM billingrecords WHERE 1=1';
    const filters = [];
    if (column && value) {
        sql += ` AND ${mysql.escapeId(column)} LIKE ?`;
        filters.push(`%${value}%`);
    }

    db.query(sql, filters, async (err, results) => {
        if (err) {
            console.error('Failed to fetch records:', err);
            return res.status(500).send('Failed to fetch records');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Records');
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'District', key: 'district', width: 20 },
            { header: 'City', key: 'city', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'Pin Code', key: 'pinCode', width: 15 },
            { header: 'Mobile Number', key: 'mobileNo', width: 20 },
            { header: 'Alt Mobile Number', key: 'altMobileNo', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'ID Type', key: 'idType', width: 20 },
            { header: 'ID Number', key: 'idNo', width: 25 },
            { header: 'Purpose of Donation', key: 'purposeOfDonation', width: 30 },
            { header: 'Donation Method', key: 'donationMethod', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Submission DateTime', key: 'submissionDateTime', width: 30 }
        ];
        results.forEach(record => {
            worksheet.addRow(record);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="records.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    });
});

// DELETE endpoint to delete a record by ID
app.delete('/api/delete-record/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM billingrecords WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Failed to delete record:', err);
            return res.status(500).send('Failed to delete record');
        }
        res.status(200).send('Record deleted successfully');
    });
});

// DELETE endpoint to delete multiple records by IDs
app.delete('/api/delete-records', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('No records selected for deletion');
    }

    const sql = 'DELETE FROM billingrecords WHERE id IN (?)';
    db.query(sql, [ids], (err, results) => {
        if (err) {
            console.error('Failed to delete records:', err);
            return res.status(500).send('Failed to delete records');
        }
        res.status(200).send('Records deleted successfully');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
