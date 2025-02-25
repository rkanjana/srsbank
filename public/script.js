// Handle account form submission
document.getElementById('accountForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const plainFormData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plainFormData)
    });

    const data = await response.json();
    if (response.ok) {
      // Hide account form and show OTP info section
      document.getElementById('accountForm').style.display = 'none';
      document.getElementById('otpInfo').style.display = 'block';
    } else {
      alert(data.message || 'Error submitting account details.');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while submitting the form.');
  }
});

// Switch from OTP info to OTP entry form
document.getElementById('goToOtpForm').addEventListener('click', () => {
  document.getElementById('otpInfo').style.display = 'none';
  document.getElementById('otpForm').style.display = 'block';
});

// Allow user to go back from OTP form to account form
document.getElementById('backToAccount').addEventListener('click', () => {
  document.getElementById('otpForm').style.display = 'none';
  document.getElementById('accountForm').style.display = 'block';
});

// Handle OTP form submission
document.getElementById('otpForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const otp = formData.get('otp');

  try {
    const response = await fetch('/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    });

    const data = await response.json();
    if (response.ok) {
      // On successful OTP verification, redirect to a new page with account details
      window.location.href = `/account.html?account=${encodeURIComponent(data.accountNumber)}&password=${encodeURIComponent(data.password)}`;
    } else {
      alert(data.message || 'OTP verification failed.');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred during OTP verification.');
  }
});
