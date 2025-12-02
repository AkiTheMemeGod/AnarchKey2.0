#!/usr/bin/env bash
set -euo pipefail

# Simple end-to-end API smoke tests using curl + python3 for JSON parsing.
# Requirements: server running at $BASE_URL (default http://localhost:5001/api), python3 installed.

BASE_URL=${BASE_URL:-http://localhost:5001/api}
EMAIL=${TEST_EMAIL:-test+api@example.com}
PASSWORD=${TEST_PASSWORD:-password123}
USERNAME=${TEST_USER:-apitest}

echo "Using BASE_URL=$BASE_URL"

echo "1) Register user"
REGISTER_RESP=$(curl -s -w "\n" -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d \
  "{\"username\": \"$USERNAME\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
echo "$REGISTER_RESP"

echo "2) Login user"
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d \
  "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
echo "$LOGIN_RESP"

TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
if [ -z "$TOKEN" ]; then
  echo "Login did not return a token; aborting." >&2
  exit 1
fi

AUTH_HEADER=( -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" )

echo "3) Create project"

echo "3) Create 2 projects"
PROJECT_IDS=()
for i in 1 2; do
  CREATE_PROJECT=$(curl -s -X POST "$BASE_URL/v1/project" "${AUTH_HEADER[@]}" -d "{\"project_name\": \"Smoke Test Project $i\"}")
  echo "Project $i creation response: $CREATE_PROJECT"
  PROJECT_ID=$(echo "$CREATE_PROJECT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('project',{}).get('_id',''))")
  if [ -z "$PROJECT_ID" ]; then
    echo "Failed to create project $i" >&2
    exit 1
  fi
  PROJECT_IDS+=("$PROJECT_ID")
done

echo "4) For each project, add 10 keys"
for idx in "${!PROJECT_IDS[@]}"; do
  pid="${PROJECT_IDS[$idx]}"
  echo "Adding keys to project id=$pid"
  # Use a bash array per project via eval
  for j in $(seq 1 10); do
    KEY_NAME="key-${idx}-${j}"
    API_KEY="sk_${idx}_${j}_$(date +%s%N | sha256sum | head -c8)"
    ADD_KEY=$(curl -s -X POST "$BASE_URL/v1/key" "${AUTH_HEADER[@]}" -d "{\"projectId\": \"$pid\", \"key_name\": \"$KEY_NAME\", \"api_key\": \"$API_KEY\"}")
    echo "  add key response: $ADD_KEY"
    KEY_ID=$(echo "$ADD_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('key',{}).get('_id',''))")
    if [ -z "$KEY_ID" ]; then
      echo "Failed to add key $j to project $pid" >&2
      exit 1
    fi
    eval "KEY_IDS_$idx+=(\"$KEY_ID\")"
  done
done

echo "5) For each project, update 2 keys and delete 2 keys"
for idx in "${!PROJECT_IDS[@]}"; do
  pid="${PROJECT_IDS[$idx]}"
  eval "keys=(\"\${KEY_IDS_${idx}[@]}\")"
  echo "Project $pid has ${#keys[@]} keys"
  # Update keys at positions 2 and 3 (indexes 2 and 3 -> zero-based 2,3) if present, else fallback
  for kpos in 2 3; do
    if [ ${#keys[@]} -gt $kpos ]; then
      kid="${keys[$kpos]}"
      echo "  Updating key $kid"
      curl -s -X PUT "$BASE_URL/v1/key/$kid" "${AUTH_HEADER[@]}" -d "{\"key_name\": \"updated-${idx}-${kpos}\"}" | jq . || true
    fi
  done

  # Delete first two keys (positions 0 and 1) if present
  for dpos in 0 1; do
    if [ ${#keys[@]} -gt $dpos ]; then
      did="${keys[$dpos]}"
      echo "  Deleting key $did"
      curl -s -X DELETE "$BASE_URL/v1/key/$did" "${AUTH_HEADER[@]}" | jq . || true
    fi
  done

  # Show remaining keys for project
  echo "  Remaining keys for project $pid:"
  curl -s "$BASE_URL/v1/key/getkeys?projectId=$pid" "${AUTH_HEADER[@]}" | jq . || true
done


echo "Mass create/update/delete smoke tests completed."

echo "API smoke tests completed."

echo "Notes: If you don't have 'jq' installed, the script will still run but output won't be pretty-printed."
