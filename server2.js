require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static("public"));

// Connect to MySQL
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
//In-memory storage for OTPs (Temporary)
const otpStore = {};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate and send OTP
app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    otpStore[email] = otp; // Store OTP temporarily

    setTimeout(() => {
        delete otpStore[email]; // OTP expires in 5 minutes
    }, 5 * 60 * 1000);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending OTP:", error);
            return res.status(500).json({ error: "Failed to send OTP" });
        }
        res.json({ message: "OTP sent successfully!" });
    });
});
// Verify OTP and allow login
app.post('/verify-otp', async (req, res) => {
    console.log("Received OTP verification request:", req.body);

    const { email, otp } = req.body;

    if (!email || !otp) {
        console.log("❌ Missing email or OTP");
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    console.log("Stored OTP:", otpStore[email], "Received OTP:", otp);

    if (otpStore[email] && otpStore[email] == otp) {
        console.log("✅ OTP matched!");

        delete otpStore[email]; // Remove OTP after verification

        // Fetch customer ID using email
        db.query(`SELECT customer_id FROM customer_registration1 WHERE email = ?`, [email], async (err, results) => {
            if (err) {
                console.error("❌ Error fetching customer ID:", err);
                return res.status(500).json({ error: "Failed to fetch customer details" });
            }
            if (results.length === 0) {
                console.log("❌ Customer not found for email:", email);
                return res.status(404).json({ error: "Customer not found" });
            }

            const customer_id = results[0].customer_id;
            const account_number = Math.floor(1000000000 + Math.random() * 900000000);
            const ifsc_code = "BANK123456";
            const account_type = "Savings";
            const password = Math.random().toString(36).slice(-8); // Generate random password

            const insertAccountSQL = `
                INSERT INTO customer_account3 (account_number, customer_id, balance, account_type, ifsc_code, password)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(insertAccountSQL, [account_number, customer_id, 0.00, account_type, ifsc_code, password], async (err) => {
                if (err) {
                    console.error("❌ Error creating account:", err);
                    return res.status(500).json({ error: "Failed to create account" });
                }

                console.log("✅ Account created successfully!");

                try {
                    await sendAccountEmail(email, account_number, password);
                    console.log("✅ Email sent successfully!");
                } catch (error) {
                    console.error("❌ Error sending email:", error);
                }

                return res.json({
                    message: "✅ OTP verified! Account created successfully.",
                    account_number,
                    password
                });
            });
        });
    } else {
        console.log("❌ Invalid OTP for email:", email);
        return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
});

// Function to Send Email
async function sendAccountEmail(email, account_number, password) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from:  process.env.EMAIL_USER,
        to: email,
        subject: "Your New Nexus Bank Account Details",
        text: `Welcome to SFC Bank!\n\nYour Account Number: ${account_number}\nYour Password: ${password}\n\nPlease keep these details secure.`
    };

    return transporter.sendMail(mailOptions);
}

//submit form
app.post('/submit', (req, res) => {
    const { accountHolderName, dob, nationality, Status, city, address, mailingAddress, contactNumber, branch, currency, document, documentnumber } = req.body;

    if (!accountHolderName || !dob || !nationality || !Status || !city || !address || !mailingAddress || !contactNumber || !branch || !currency || !document || !documentnumber) {
        return res.status(400).json({ error: "All required fields must be filled" });
    }

    const defaultState = "Andhra Pradesh"; // Set the default state

    const insertCustomerSQL = `INSERT INTO customer_registration1
    (name, dob, nationality, current_status, city, state, address, email, phone_no, branch, min_bal, document_type, verification_num, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; 

    db.query(insertCustomerSQL, 
        [accountHolderName, dob, nationality, Status, city, defaultState, address, mailingAddress, contactNumber, branch, currency, document, documentnumber, currency], 
        (err, result) => {
            if (err) {
                console.error("Error inserting customer registration:", err.sqlMessage || err);
                return res.status(500).json({ error: "Failed to register customer", details: err.sqlMessage });
            }
            res.json({ message: "Customer registered successfully!", customer_id: result.insertId });
        }
    );
});
app.post('/login', (req, res) => {
    const { account_number, password } = req.body;
  
    if (!account_number || !password) {
      return res.status(400).json({ message: 'Account number and password are required' });
    }
  
    db.query('SELECT * FROM customer_account3 WHERE account_number = ? AND password = ?', [account_number, password], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
  
      console.log(result);  // Add this to check if the query returns anything
  
      if (result.length > 0) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  });
  
// Employee Deposit Money into Customer Account
app.post("/deposit", (req, res) => {
    const { emp_id, account_number, amount } = req.body;

    if (!emp_id || !account_number || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid deposit details" });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: "Transaction start failed" });
        }

        // Step 1: Update the balance in customer_account3
        const updateBalanceQuery = `UPDATE customer_account3 SET balance = balance + ? WHERE account_number = ?`;
        db.query(updateBalanceQuery, [amount, account_number], (err, updateResult) => {
            if (err || updateResult.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(500).json({ error: "Account not found or balance update failed" });
                });
            }

            // Step 2: Insert the deposit record into transactions1
            const insertTransactionQuery = `INSERT INTO transactions1 (account_number, transaction_type, amount) VALUES (?, 'Deposit', ?)`;
            db.query(insertTransactionQuery, [account_number, amount], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: "Transaction log failed" });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: "Transaction commit failed" });
                        });
                    }

                    res.json({ message: `Successfully deposited ₹${amount} into account ${account_number}.` });
                });
            });
        });
    });
});

// Employee Registration (POST)
app.post('/register', (req, res) => {
    const { emp_id, password, name, designation, salary, location, address, email, phonenumber, manager_id } = req.body;
    const sql = `INSERT INTO employee2 (emp_id, password, name, designation, salary, location, address, email, phonenumber, manager_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [emp_id, password, name, designation, salary, location, address, email, phonenumber, manager_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Employee registered successfully!" });
    });
});

// Employee Login (POST)
app.post('/employee-login', (req, res) => {
    const { emp_id, password } = req.body;
    const sql = `SELECT * FROM employee2 WHERE emp_id = ?`;
    db.query(sql, [emp_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            if (result[0].password === password) {
                res.json({ message: "Login successful!", employee: result[0] });
            } else {
                res.status(401).json({ error: "Invalid Employee ID or Password" });
            }
        } else {
            res.status(401).json({ error: "Invalid Employee ID or Password" });
        }
    });
});
// Fetch user profile details (GET)
app.get('/user-profile', (req, res) => {
    const { account_number } = req.query; // Get account number from query string

    if (!account_number) {
        return res.status(400).json({ error: "Account number is required" });
    }

    // Query to fetch user profile and transactions
    const sql = `
        SELECT 
            c.name, 
            c.email, 
            ca.account_number, 
            ca.balance, 
            ca.account_type, 
            ca.ifsc_code, 
            t.transaction_type, 
            t.amount AS transaction_amount, 
            t.transaction_date 
        FROM 
            customer_registration1 c
        JOIN 
            customer_account3 ca ON c.customer_id = ca.customer_id
        LEFT JOIN 
            transactions1 t ON ca.account_number = t.account_number
        WHERE 
            ca.account_number = ? 
        ORDER BY 
            t.transaction_date DESC;
    `;
    
    db.query(sql, [account_number], (err, results) => {
        if (err) {
            console.error("Error fetching user profile:", err.message);
            return res.status(500).json({ error: "Failed to fetch profile details" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const data = results[0]; // Assuming only one result

        // If there are multiple transactions, you might want to group or process them
        const transactions = results.map(row => ({
            transaction_type: row.transaction_type,
            transaction_amount: row.transaction_amount,
            transaction_date: row.transaction_date
        }));

        res.json({
            message: "User profile fetched successfully",
            profile: {
                name: data.name,
                email: data.email,
                account_number: data.account_number,
                balance: data.balance,
                account_type: data.account_type,
                ifsc_code: data.ifsc_code,
                transactions: transactions
            }
        });
    });
});



// Request Leave (POST)
app.post("/request-leave", (req, res) => {
    const { emp_id, start_date, end_date, reason, manager_id } = req.body;

    if (!emp_id || !manager_id) {
        return res.status(400).json({ error: "Employee ID or Manager ID is missing" });
    }

    const sql = `INSERT INTO leave_requests (emp_id, start_date, end_date, reason, manager_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [emp_id, start_date, end_date, reason, manager_id, 'Pending'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Leave request submitted successfully!" });
    });
});

// Fetch Latest Leave Status for an Employee (GET)
app.get("/get-leave-status/:emp_id", (req, res) => {
    const { emp_id } = req.params;
    const sql = `SELECT start_date, end_date, status FROM leave_requests WHERE emp_id = ? ORDER BY request_id DESC LIMIT 1`;

    db.query(sql, [emp_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const { start_date, end_date, status } = results[0];
            res.json({ message: `Your leave from ${start_date} to ${end_date} is ${status}.` });
        } else {
            res.json({ message: "No leave requests found." });
        }
    });
});

// Manager fetches pending leave requests (GET)
app.get("/manager-requests/:manager_id", (req, res) => {
    const { manager_id } = req.params;
    const sql = `SELECT * FROM leave_requests WHERE manager_id = ? AND status = 'Pending'`;
    
    db.query(sql, [manager_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Manager approves or rejects leave request (PUT)
app.put("/approve-leave/:request_id", (req, res) => {
    const { request_id } = req.params;
    const { status } = req.body; // 'Approved' or 'Denied'

    if (!['Approved', 'Denied'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Use 'Approved' or 'Denied'." });
    }

    // Check if the request exists and is still pending
    const checkQuery = `SELECT status FROM leave_requests WHERE request_id = ?`;
    db.query(checkQuery, [request_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Leave request not found." });
        
        if (result[0].status !== 'Pending') {
            return res.status(400).json({ error: `Request is already ${result[0].status}.` });
        }

        // If still pending, update the status
        const updateQuery = `UPDATE leave_requests SET status = ? WHERE request_id = ?`;
        db.query(updateQuery, [status, request_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Leave request ${status.toLowerCase()} successfully!` });
        });
    });
});

// Start server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
