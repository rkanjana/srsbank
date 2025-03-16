require("dotenv").config(); // Load .env variables
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();  // Initialize Express
app.use(express.json());
app.use(cors());

// Connect to MySQL using .env variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to MySQL database.");
    }
});

// Start server on PORT from .env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Employee Login Route (POST)
app.post('/employee-login', (req, res) => {
    const { emp_id, password } = req.body;
    
    const sql = `SELECT * FROM employee1 WHERE emp_id = ? AND password = ?`;
    db.query(sql, [emp_id, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length > 0) {
            res.json({ message: "Login successful!", employee: result[0] });
        } else {
            res.status(401).json({ error: "Invalid Employee ID or Password" });
        }
    });
});

// Fetch Employee Data Route (GET)
app.get("/employee-data", (req, res) => {
    const sql = "SELECT * FROM employee2"; 
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});
app.get("/employee-data", (req, res) => {
    const { emp_id } = req.query;
    const sql = "SELECT * FROM employee2 WHERE emp_id = ?"; 
    db.query(sql, [emp_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ error: "Employee not found" });
        }
    });
});
app.get("/employee-data", (req, res) => {
    const { emp_id } = req.query;
    const sql = "SELECT name, email, last_paid_salary, loan_status FROM employee2 WHERE emp_id = ?"; 
    db.query(sql, [emp_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length > 0) {
            res.json(result[0]); // Return the first row (employee data)
        } else {
            res.status(404).json({ error: "Employee not found" });
        }
    });
});
