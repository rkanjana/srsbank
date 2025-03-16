require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

// Database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL Database');
        connection.release();
    }
});

// Submit a time-off request
app.post('/request-time-off', (req, res) => {
    const { emp_id, start_date, end_date, reason, manager_id } = req.body;
    const sql = `INSERT INTO time_off_requests (emp_id, start_date, end_date, reason, manager_id) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [emp_id, start_date, end_date, reason, manager_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Request submitted successfully!' });
    });
});

// Fetch all requests (For manager)
app.get('/requests', (req, res) => {
    const sql = `SELECT * FROM time_off_requests`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Approve or Deny a request
app.put('/update-status', (req, res) => {
    const { request_id, status } = req.body;

    if (!['Approved', 'Denied'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    const sql = `UPDATE time_off_requests SET status = ? WHERE request_id = ?`;
    db.query(sql, [status, request_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Request ID not found' });
        }
        res.json({ message: 'Status updated successfully!' });
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
