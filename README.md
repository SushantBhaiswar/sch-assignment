# sch-assignment
🧾 PR Management Assignment – Setup Guide

🚀 1. Clone the Repository

git clone git@github.com:SushantBhaiswar/sch-assignment.git
cd sch-assignment/

🛠️ 2. Set Up the Environment
Create a .env file in the root directory with the following content:

# Node.js API Environment Variables
NODE_ENV=assignment
NODE_PORT=3000
REDIS_URL=redis://redis:6379

# Python API Environment Variables
FLASK_ENV=development
FLASK_APP=app.py
FLASK_PORT=5000
OPENAI_API_KEY= OPEN-API-KEY-HERE

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Docker Compose Configuration
COMPOSE_PROJECT_NAME=assesment


🐳 3. Start Services via Docker Compose
Make sure Docker is installed and running. Then, from the root of the project:
docker-compose up --build

🌐 4. Access the Swagger API Documentation
Once everything is running, open your browser and go to:
http://localhost


🔐 5. Authorize the APIs
Some routes require authentication headers. Click the Authorize 🔒 button in the Swagger UI (top right), and enter:
Header Names
Values
x-user-id
User1234
x-role
buyer

✅ Allowed roles: buyer, manager, admin, viewer
 You can use any value for x-user-id, but x-role must match one of the allowed roles.
Once authorized, you can try out authenticated endpoints like:
GET /api/pr/getPRs
