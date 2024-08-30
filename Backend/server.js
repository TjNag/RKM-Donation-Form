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

// Establish a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rkmg_offline_form'
});

// Simple query wrapper to use async/await
const query = (sql, params) => new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
    });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    res.status(500).send({ error: "Internal Server Error" });
});

// Fetch Users Endpoint
app.get('/api/get-users', async (req, res, next) => {
    const sql = 'SELECT username FROM admin_users';
    try {
        const results = await query(sql);
        res.json(results);
    } catch (err) {
        next(err);
    }
});

// adminLogin Endpoint
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

// Login Endpoint
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

// Add user endpoint
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

// POST endpoint to handle form submissions
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

// DELETE endpoint to delete a record by ID
app.delete('/api/delete-record/:id', async (req, res, next) => {
    const { id } = req.params;
    const sql = 'DELETE FROM billingrecords WHERE id = ?';
    try {
        await query(sql, [id]);
        res.status(200).send('Record deleted successfully');
    } catch (err) {
        next(err);
    }
});

// DELETE endpoint to delete multiple records by IDs
app.delete('/api/delete-records', async (req, res, next) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('No records selected for deletion');
    }

    const sql = 'DELETE FROM billingrecords WHERE id IN (?)';
    try {
        await query(sql, [ids]);
        res.status(200).send('Records deleted successfully');
    } catch (err) {
        next(err);
    }
});

// Fetch and format bill details for printing
app.get('/api/print-bill/:id', async (req, res, next) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM billingrecords WHERE id = ?';
    try {
        const result = await query(sql, [id]);
        if (result.length === 0) {
            res.status(404).send('Bill not found');
            return;
        }
        const bill = result[0];
        const html = `
            <html>
            <head>
                <title>Print Bill ID: ${bill.id}</title>
            </head>
            <body>
                <h1>Bill Details</h1>
                <p>Name: ${bill.name}</p>
                <p>Address: ${bill.address}</p>
                <p>Amount: ${bill.amount}</p>
                <!-- Add more fields as needed -->
            </body>
            </html>
        `;
        res.send(html);
    } catch (err) {
        next(err);
    }
});

// GET endpoint to fetch records of a specific user between a start date/time and end date/time
app.get('/api/user-records-by-datetime', async (req, res, next) => {
    const { username, startDate, startTime, endDate, endTime } = req.query;

    // Combine the date and time to create datetime strings
    const startDateTime = `${startDate} ${startTime}`;
    const endDateTime = `${endDate} ${endTime}`;

    const sql = `
        SELECT receiptId, name, mobileNo, idType, idNo, purposeOfDonation, donationMethod, amount, submissionDateTime
        FROM billingrecords
        WHERE submittedby_user = ? AND submissionDateTime BETWEEN ? AND ?
    `;

    try {
        const results = await query(sql, [username, startDateTime, endDateTime]);
        res.json(results);
    } catch (err) {
        next(err);
    }
});

// GET endpoint to download records as an Excel file
app.get('/api/download-records', async (req, res, next) => {
    const { column, value, startDate, endDate } = req.query;
    let sql = 'SELECT * FROM billingrecords WHERE 1=1';
    const filters = [];

    if (column && value) {
        sql += ` AND ${mysql.escapeId(column)} LIKE ?`;
        filters.push(`%${value}%`);
    }

    if (startDate) {
        sql += ' AND DATE(submissionDateTime) >= ?';
        filters.push(startDate);
    }

    if (endDate) {
        sql += ' AND DATE(submissionDateTime) <= ?';
        filters.push(endDate);
    }

    try {
        const results = await query(sql, filters);

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
            { header: 'Cheque No', key: 'chequeNo', width: 20 },
            { header: 'Dated', key: 'dated', width: 20 },
            { header: 'On Bank', key: 'onBank', width: 30 },
            { header: 'Submission DateTime', key: 'submissionDateTime', width: 30 }
        ];
        results.forEach(record => {
            worksheet.addRow(record);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="records.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        next(err);
    }
});

app.post('/api/update-acceptance', async (req, res, next) => {
    const { id } = req.body;
    const sql = 'UPDATE billingrecords SET isAccepted = 1 WHERE id = ?';
    try {
        await query(sql, [id]);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
