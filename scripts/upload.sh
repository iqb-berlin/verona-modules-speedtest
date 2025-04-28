#!/bin/bash

USERNAME="richard"

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <filepath>"
    exit 1
fi

if [ -z "$IQB_STUDIO_PW" ]; then
    read -sp "Enter password: " IQB_STUDIO_PW
fi

# Login
TOKEN=$(curl --silent --show-error --header "Content-Type: application/json" --header "app-version: 12.1.1" \
--request POST \
--data "{\"username\": \"$USERNAME\", \"password\": \"$IQB_STUDIO_PW\"}" \
https://www.iqb-studio.de/api/login)

# Remove quotes from token
TOKEN=${TOKEN:1:-1}

# Upload file
curl --header "Authorization: Bearer $TOKEN" \
--request POST \
--form "file=@$1" \
https://www.iqb-studio.de/api/admin/verona-modules
