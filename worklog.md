# Brutal.ai Development Worklog

---
Task ID: 1
Agent: Main
Task: Configure API key to work for all users

Work Log:
- Set up ~/.z-ai-config with user's API key
- Updated .env file with API key and base URL
- Fixed zai-config.ts to use correct API endpoint (https://open.bigmodel.cn/api/paas/v4)
- Updated chat route to initialize config and use correct models
- Added better error handling for insufficient balance errors
- Updated .env.example with correct base URL

Stage Summary:
- API key configured in both config file and environment variables
- Correct API endpoint: https://open.bigmodel.cn/api/paas/v4
- Available models: glm-4.5, glm-4.5-air, glm-4.6, glm-4.7, glm-5
- Default model: glm-4.5-air
- Issue: API key shows insufficient balance (error 1113)
- User needs to add credits at https://open.bigmodel.cn
