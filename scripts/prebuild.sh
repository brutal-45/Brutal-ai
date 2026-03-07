#!/bin/bash
# Pre-build script for Vercel
# Creates .z-ai-config from environment variables

echo "Creating ZAI config file..."

# Create config from environment variables
cat > ".z-ai-config" << EOF
{
  "baseUrl": "${ZAI_BASE_URL:-https://api.z-ai.dev/v1}",
  "apiKey": "${ZAI_API_KEY:-}",
  "chatId": "${ZAI_CHAT_ID:-}",
  "userId": "${ZAI_USER_ID:-}"
}
EOF

echo "ZAI config file created successfully!"
