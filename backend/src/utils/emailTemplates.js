export const getVerificationEmailTemplate = (otp) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050E3C;
      font-family: 'Courier New', Courier, monospace; 
      color: #ffffff;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #002455;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #FF3838;
      margin-bottom: 24px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .title {
      font-size: 20px;
      margin-bottom: 16px;
      color: #ffffff;
    }
    .text {
      color: #aeb9cc;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .otp-box {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid #FF3838;
      border-radius: 12px;
      padding: 24px;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #ffffff;
      margin-bottom: 32px;
      display: inline-block;
    }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #6b7c93;
    }
    .link {
      color: #FF3838;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">AnarchKey</div>
      <h1 class="title">Verify your email address</h1>
      <p class="text">
        Welcome to AnarchKey. Please use the verification code below to complete your registration. This code will expire in 10 minutes.
      </p>
      <div class="otp-box">
        ${otp}
      </div>
      <p class="text">
        If you didn't request this, you can safely ignore this email.
      </p>
      <div class="footer">
        &copy; ${new Date().getFullYear()} AnarchKey. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
