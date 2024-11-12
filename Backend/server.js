require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Establish a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rkmg_offline_form'
});

// Utility function to handle MySQL queries
const query = (sql, params) =>
    new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
});

// Fetch all users
app.get('/api/get-users', async (req, res, next) => {
    try {
        const users = await query('SELECT username FROM admin_users');
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// User login (Admin)
app.post('/api/adminlogin', async (req, res, next) => {
    const { username, password } = req.body;
    const sql = 'SELECT password, user_type FROM admin_users WHERE username = ?';
    try {
        const results = await query(sql, [username]);
        if (results.length > 0) {
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                if (results[0].user_type === 'admin') {
                    res.json({ success: true });
                } else {
                    res.status(403).send('Access denied. Admins only.');
                }
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        next(err);
    }
});
// User login (Normal)
app.post('/api/login', async (req, res, next) => {
    const { username, password } = req.body;
    const sql = 'SELECT password FROM admin_users WHERE username = ?';
    try {
        const results = await query(sql, [username]);
        if (results.length > 0) {
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                res.json({ success: true });
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        next(err);
    }
});

// Add a new user
app.post('/api/add-user', async (req, res, next) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO admin_users (username, password) VALUES (?, ?)';
    try {
        await query(sql, [username, hashedPassword]);
        res.json({ success: true, message: 'User added successfully' });
    } catch (err) {
        next(err);
    }
});

// Delete user by username
app.delete('/api/delete-user/:username', async (req, res, next) => {
    const { username } = req.params;
    try {
        const result = await query('DELETE FROM admin_users WHERE username = ?', [username]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'User deleted successfully' });
        }
        res.status(404).json({ error: 'User not found' });
    } catch (err) {
        next(err);
    }
});

// Submit donation form
app.post('/api/submit-form', async (req, res, next) => {
    const {
        submittedby_user, name, address, district, city, state, pinCode, mobileNo,
        altMobileNo, email, idType, idNo, purposeOfDonation, donationMethod, amount,
        chequeNo, dated, onBank, isAccepted
    } = req.body;

    if (!submittedby_user) {
        return res.status(400).send('submittedby_user cannot be empty');
    }

    let sql;
    let params;

    if (donationMethod === 'Cheque') {
        if (!chequeNo || chequeNo.length !== 6) {
            return res.status(400).send('Invalid cheque number');
        }
        if (!dated || !onBank) {
            return res.status(400).send('Cheque details are incomplete');
        }

        sql = `INSERT INTO billingrecords (
            submittedby_user, name, address, district, city, state, pinCode, mobileNo, altMobileNo, 
            email, idType, idNo, purposeOfDonation, donationMethod, amount, chequeNo, dated, onBank, 
            isAccepted, submissionDateTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        params = [
            submittedby_user, name, address, district, city, state, pinCode, mobileNo, altMobileNo,
            email, idType, idNo, purposeOfDonation, donationMethod, amount, chequeNo, dated, onBank,
            isAccepted
        ];
    } else {
        sql = `INSERT INTO billingrecords (
            submittedby_user, name, address, district, city, state, pinCode, mobileNo, altMobileNo, 
            email, idType, idNo, purposeOfDonation, donationMethod, amount, isAccepted, submissionDateTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        params = [
            submittedby_user, name, address, district, city, state, pinCode, mobileNo, altMobileNo,
            email, idType, idNo, purposeOfDonation, donationMethod, amount, isAccepted
        ];
    }

    try {
        const result = await query(sql, params);
        const newRecordId = result.insertId;
        const newRecord = await query('SELECT id, submissionDateTime FROM billingrecords WHERE id = ?', [newRecordId]);
        res.json({ success: true, id: newRecordId, date: newRecord[0].submissionDateTime });
    } catch (err) {
        next(err);
    }
});
// POST endpoint to update the receiptId after generating it
app.post('/api/update-receipt-id', async (req, res, next) => {
    const { id, receiptId } = req.body;
    const sql = 'UPDATE billingrecords SET receiptId = ? WHERE id = ?';
    try {
        await query(sql, [receiptId, id]);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});


// Delete record by ID
app.delete('/api/delete-record/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM billingrecords WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            return res.status(200).send('Record deleted successfully');
        }
        res.status(404).send('Record not found');
    } catch (err) {
        next(err);
    }
});

// Delete multiple records by IDs
app.delete('/api/delete-records', async (req, res, next) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).send('No records selected for deletion');

    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM billingrecords WHERE id IN (${placeholders})`;
    try {
        const result = await query(sql, ids);
        res.status(result.affectedRows > 0 ? 200 : 404).send('Records deleted successfully');
    } catch (err) {
        next(err);
    }
});

// Update acceptance status
app.post('/api/update-acceptance', async (req, res, next) => {
    const { id } = req.body;
    try {
        const result = await query('UPDATE billingrecords SET isAccepted = 1 WHERE id = ?', [id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        next(err);
    }
});
// Check login status
app.get('/api/check-login', (req, res) => {
    if (req.session.user && req.session.user.isAdmin) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});
// Fetch records with optional filters
// GET endpoint to fetch all records with optional filters, including date range
app.get('/api/records', async (req, res, next) => {
    const { column, value, startDate, endDate, showUnaccepted } = req.query;
    let sql = 'SELECT * FROM billingrecords WHERE 1=1';
    const filters = [];
    const adjustedStartDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1));
    const adjustedEndDate = new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1));

    if (column && value) {
        sql += ` AND ${mysql.escapeId(column)} LIKE ?`;
        filters.push(`%${value}%`);
    }

    if (startDate) {
        sql += ' AND DATE(submissionDateTime) >= ?';
        filters.push(adjustedStartDate);
    }

    if (endDate) {
        sql += ' AND DATE(submissionDateTime) <= ?';
        filters.push(adjustedEndDate);
    }

    if (showUnaccepted && parseInt(showUnaccepted, 10) === 1) {
        sql += ' AND isAccepted = 0';
    }

    try {
        const results = await query(sql, filters);
        res.json(results);
    } catch (err) {
        next(err);
    }
});

// Fetch distinct user records by mobileNo
app.get('/api/search-by-mobile', async (req, res, next) => {
    const { mobileNo } = req.query;

    if (!mobileNo) {
        return res.status(400).json({ error: 'mobileNo query parameter is required.' });
    }

    try {
        const sql = `
            SELECT DISTINCT name, address, district, city, state, pinCode, mobileNo, altMobileNo, email, idType, idNo
            FROM billingrecords
            WHERE mobileNo = ?
        `;
        const results = await query(sql, [mobileNo]);

        if (results.length === 0) {
            return res.json({ message: 'No records found.', data: [] });
        }

        res.json({ message: 'Records fetched successfully.', data: results });
    } catch (err) {
        next(err);
    }
});


// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
