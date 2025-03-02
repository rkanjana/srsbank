const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let storedOtp = null;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sbaccount.html'));
});

app.post('/submit', (req, res) => {
  const formData = req.body;
  console.log('Form Data Received:', formData);

  storedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', storedOtp);

  return res.json({ message: 'Form submitted successfully. OTP has been sent.' });
});


app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'No OTP provided.' });
  }

  if (otp === storedOtp) {

    const accountNumber = 'AC' + Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const password = Math.random().toString(36).slice(-8);

    return res.json({ message: 'OTP verified successfully!', accountNumber, password });
  } else {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
