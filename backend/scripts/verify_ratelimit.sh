#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:5001/api/v1/sdk}

echo "Testing Rate Limiter on $BASE_URL/secrets"

LIMIT_TRIGGERED=false

# 1. Spam with empty body (uses PLACEHOLDER_KEY)
echo "1) Spamming with default placeholder key..."
for i in {1..105}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/secrets" -H "Content-Type: application/json" -d '{"access_token": "ebb8d52303c31bb59f30a4141c0daa2986919df2121a2fea9fbd59144e31ba3b55ae4153f3cf26d12d8d4cbdfd176fee3e9d957c084e9368cb2d658b2733d611", "secret_name":"MODEL"}')
  # echo "Request $i: HTTP $HTTP_CODE"
  if [ "$HTTP_CODE" == "429" ]; then
    echo "Rate limit triggered at request $i for placeholder key."
    LIMIT_TRIGGERED=true
    break
  fi
done

if [ "$LIMIT_TRIGGERED" = false ]; then
  echo "Rate limit NOT triggered after 105 requests for placeholder. FAILED."
  exit 1
fi

# 2. Try with a different key (Should NOT be limited)
echo "2) Testing with a different key (Should pass)..."
DIFFERENT_KEY_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/secrets" -H "Content-Type: application/json" -d '{"access_token": "ebb8d52303c31bb59f30a4141c0daa2986919df2121a2fea9fbd59144e31ba3b55ae4153f3cf26d12d8d4cbdfd176fee3e9d957c084e9368cb2d658b2733d611", "secret_name":"MODEL"}')
echo "Response for different key: HTTP $DIFFERENT_KEY_RESP"

if [ "$DIFFERENT_KEY_RESP" == "429" ]; then
  echo "Different key was ALSO rate limited! Isolation failed."
  exit 1
fi

echo "Different key was NOT limited (HTTP $DIFFERENT_KEY_RESP). Isolation passed."
echo "PASSED."
exit 0
