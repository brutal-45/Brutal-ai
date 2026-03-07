// Pre-build script for Vercel (Node.js version)
// Creates .z-ai-config from environment variables
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), '.z-ai-config');

const config = {
  baseUrl: process.env.ZAI_BASE_URL || 'https://api.z-ai.dev/v1',
  apiKey: process.env.ZAI_API_KEY || '',
  chatId: process.env.ZAI_CHAT_ID || '',
  userId: process.env.ZAI_USER_ID || '',
};

console.log('Creating ZAI config file...');

try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('ZAI config file created successfully!');
} catch (error) {
  console.error('Error creating ZAI config file:', error);
  process.exit(1);
}
