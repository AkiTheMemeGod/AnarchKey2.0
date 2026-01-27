#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:5001/api/auth}
EMAIL="test+verify_$(date +%s)@example.com"
PASSWORD="password123"
USERNAME="verifytest"

echo "Using Email: $EMAIL"

echo "1) Registering user..."
REGISTER_RESP=$(curl -s -X POST "$BASE_URL/register" -H "Content-Type: application/json" -d "{\"username\": \"$USERNAME\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
echo "$REGISTER_RESP"

# Get OTP from Mongo? Or just parse the response?
# The register controller sends email but doesn't return OTP in response (good).
# However, we only have file access here. We can't easily check email.
# BUT, we can read the database if we had a tool for it, OR we can cheat for testing IF the register endpoint returned it?
# Wait, looking at authControllers.js:
# res.status(201).json({ "message": "User Registered. Please verify your email.", token, User: newUser });
# It returns the User object which includes the OTP! logic error in the original code or intended for debugging?
# "User: newUser" -> newUser has otp field.
# NICE! We can extract OTP from the registration response.

OTP=$(echo "$REGISTER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('User',{}).get('otp',''))")

if [ -z "$OTP" ]; then
  echo "Could not extract OTP from registration response. FAILED."
  exit 1
fi
echo "Extracted OTP: $OTP"

echo "2) Attempting login BEFORE verification (Should Fail)..."
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" -H "Content-Type: application/json" -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
HTTP_CODE=$(echo "$LOGIN_RESP" | tail -n1)
BODY=$(echo "$LOGIN_RESP" | head -n-1)

echo "Login Response Code: $HTTP_CODE"
echo "Login Response Body: $BODY"

if [ "$HTTP_CODE" != "400" ]; then
  echo "Expected 400 Bad Request, got $HTTP_CODE. FAILED."
  exit 1
fi

if [[ "$BODY" != *"Please verify your email first"* ]]; then
   echo "Expected error message 'Please verify your email first'. FAILED."
   exit 1
fi

echo "Login correctly blocked."

echo "3) Verifying OTP..."
# verifyOtp requires auth token?
# export async function verifyOtp(req, res)
# It uses req.user.id, so yes it needs authentication.
# Wait, if I can't login, I can't get a token to verify OTP?
# Let's check authRoutes.js to see if verifyOtp is protected.
# We didn't check authRoutes.js content yet.
# But authControllers.register_User returns a 'token'. 
# "const token = jwt.sign(...)"
# And it sends it in the response: res.status(201).json({ ..., token, ... })
# So we DO have a token from registration!
# We can use that token to verify.

TOKEN=$(echo "$REGISTER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")

VERIFY_RESP=$(curl -s -X POST "$BASE_URL/verifyotp" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"otp\": \"$OTP\"}")
echo "Verify Response: $VERIFY_RESP"

# Check if verification worked?
# response is { msg: "Email verified successfully" }

echo "4) Attempting login AFTER verification (Should Succeed)..."
LOGIN_RESP_2=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" -H "Content-Type: application/json" -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
HTTP_CODE_2=$(echo "$LOGIN_RESP_2" | tail -n1)

echo "Login Response Code: $HTTP_CODE_2"

if [ "$HTTP_CODE_2" != "200" ]; then
   echo "Expected 200 OK, got $HTTP_CODE_2. FAILED."
   exit 1
fi

echo "Login succeeded after verification. PASSED."
exit 0
