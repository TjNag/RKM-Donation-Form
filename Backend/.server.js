require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); // Use the pg library to handle PostgreSQL
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
// const PORT = process.env.PORT || 8081;
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Establish a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.qrqrxpjovdcsywygrjom:rkmg_offline_form@2024@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
    // connectionString: process.env.DATABASE_URL
});

// Simple query wrapper to use async/await
const query = async (sql, params) => {
    const client = await pool.connect();
    try {
        // console.log('Executing SQL:', sql, 'Params:', params);  // Add logging here
        const results = await client.query(sql, params);
        return results.rows;
    } catch (err) {
        // console.error('Query Failed:', sql, 'Error:', err); // Log detailed error info
        throw err;
    } finally {
        client.release();
    }
};

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
    const sql = 'SELECT password, user_type FROM admin_users WHERE username = $1';
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
    const sql = 'SELECT password FROM admin_users WHERE username = $1';
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
    const sql = 'INSERT INTO admin_users (username, password) VALUES ($1, $2)';
    try {
        await query(sql, [username, hashedPassword]);
        res.json({ success: true, message: 'User added successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE endpoint to delete a user by username
app.delete('/api/delete-user/:username', async (req, res) => {
    const { username } = req.params;  // Assuming the username to delete is passed in the body of the request.

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const sql = 'DELETE FROM admin_users WHERE username = $1 RETURNING username';
    try {
        const result = await query(sql, [username]);
        if (result.length > 0) {
            res.status(200).json({ success: true, message: 'User deleted successfully', deletedUser: result[0].username });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Failed to delete user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
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
            submittedby_user, name, address, district, city, state, "pinCode", "mobileNo", "altMobileNo", 
            email, "idType", "idNo", "purposeOfDonation", "donationMethod", amount, "chequeNo", dated, "onBank", 
            "isAccepted", "submissionDateTime"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()) RETURNING id`;

        params = [
            submittedby_user, name, address, district, city, state, pinCode, mobileNo, altMobileNo,
            email, idType, idNo, purposeOfDonation, donationMethod, amount, chequeNo, dated, onBank,
            isAccepted
        ];
    } else {
        sql = `INSERT INTO billingrecords (
            submittedby_user, name, address, district, city, state, "pinCode", "mobileNo", "altMobileNo", 
            email, "idType", "idNo", "purposeOfDonation", "donationMethod", amount, "isAccepted", "submissionDateTime"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()) RETURNING id`;

        params = [
            submittedby_user, name, address, district, city, state, pinCode, mobileNo, altMobileNo,
            email, idType, idNo, purposeOfDonation, donationMethod, amount, isAccepted
        ];
    }

    try {
        const result = await query(sql, params);
        const newRecordId = result[0].id;
        const newRecord = await query('SELECT id, "submissionDateTime" FROM billingrecords WHERE id = $1', [newRecordId,]);

        // Assuming the server is in UTC and the date in the DB is stored in UTC
        const dateInIST = new Date(newRecord[0].submissionDateTime);
        dateInIST.setHours(dateInIST.getHours() + 5);  // Offset for IST (+5:30 from UTC)
        dateInIST.setMinutes(dateInIST.getMinutes() + 30);

        res.json({ success: true, id: newRecordId, date: dateInIST });
    } catch (err) {
        next(err);
    }

});

// POST endpoint to update the receiptId after generating it
app.post('/api/update-receipt-id', async (req, res, next) => {
    const { id, receiptId } = req.body;
    const sql = 'UPDATE billingrecords SET "receiptId" = $1 WHERE id = $2';
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

    // Debugging log to check received query parameters
    // console.log('Received query params:', { column, value, startDate, endDate, showUnaccepted });

    // Filter by column and value if provided
    if (column && value && value.trim() !== '') {
        sql += ` AND "${column}" LIKE $1`;
        filters.push(`%${value}%`);
    }

    // Filter by date range if both startDate and endDate are provided
    if (startDate && endDate) {
        const startDay = new Date(startDate);
        const endDay = new Date(endDate);

        // Set startDay to the beginning of the day and endDay to the end of the day
        startDay.setHours(0, 0, 0, 0);
        endDay.setHours(23, 59, 59, 999);

        const startDayIso = startDay.toISOString();
        const endDayIso = endDay.toISOString();

        // Adjust the position of date filters based on whether value filtering is also applied
        if (filters.length > 0) {
            sql += ` AND "submissionDateTime" BETWEEN $${filters.length + 1}::timestamp AND $${filters.length + 2}::timestamp`;
        } else {
            sql += ` AND "submissionDateTime" BETWEEN $1::timestamp AND $2::timestamp`;
        }
        filters.push(startDayIso, endDayIso);
    }

    // Filter by unaccepted records if the flag is provided
    if (showUnaccepted && parseInt(showUnaccepted, 10) === 1) {
        sql += ' AND "isAccepted" = 0';
    }

    // Order by submissionDateTime in descending order
    sql += ' ORDER BY "submissionDateTime" desc';

    // Debugging log to check the final SQL query and filters
    // console.log('SQL Query:', sql, 'Filters:', filters);

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
    const sql = 'DELETE FROM billingrecords WHERE id = $1';
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

    const sql = 'DELETE FROM billingrecords WHERE id = ANY($1)';
    try {
        await query(sql, [ids]);
        res.status(200).send('Records deleted successfully');
    } catch (err) {
        next(err);
    }
});

app.post('/api/update-acceptance', async (req, res, next) => {
    const { id } = req.body;
    const isAccepted = req.body.isAccepted ? 1 : 0;
    const sql = 'UPDATE billingrecords SET "isAccepted" = 1 WHERE id = $1';
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