const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Parse JSON request bodies
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// For demonstration, store OTP in memory
let storedOtp = null;

/**
 * GET / 
 * Serve the main sbaccount.html file.
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sbaccount.html'));
});

/**
 * POST /submit
 * Handle account form submission, generate an OTP, and return a JSON response.
 */
app.post('/submit', (req, res) => {
  const formData = req.body;
  console.log('Form Data Received:', formData);

  // Generate a random 6-digit OTP
  storedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', storedOtp);

  return res.json({ message: 'Form submitted successfully. OTP has been sent.' });
});

/**
 * POST /verify-otp
 * Verify the provided OTP. On success, generate an account number and password.
 */
app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'No OTP provided.' });
  }

  if (otp === storedOtp) {
    // Generate a random 10-digit account number prefixed with "AC"
    const accountNumber = 'AC' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    // Generate a random 8-character alphanumeric password
    const password = Math.random().toString(36).slice(-8);

    return res.json({ message: 'OTP verified successfully!', accountNumber, password });
  } else {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
