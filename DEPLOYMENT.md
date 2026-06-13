# Spreetail - Deployment Guide

## Overview

This guide covers deploying the Spreetail Expense Sharing application to Railway.

## Prerequisites

- Railway account (free tier available)
- Git repository with the Spreetail code
- Basic knowledge of cloud deployment

## Deployment Architecture

```
┌─────────────────────┐
│  Frontend (React)   │ ← Railway Static Site
│  portless           │
└──────────┬──────────┘
           │
           │ API Calls
           │
┌──────────▼──────────┐
│  Backend (Spring)   │ ← Railway Service
│  Port 8080          │
└──────────┬──────────┘
           │
           │ JDBC
           │
┌──────────▼──────────┐
│  PostgreSQL DB      │ ← Railway Database
│  Port 5432          │
└─────────────────────┘
```

## Step 1: Deploy Backend

### 1.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

### 1.2 Create PostgreSQL Database

1. Click **"New Project"** → **"New Service"**
2. Select **PostgreSQL**
3. Railway will provide:
   - Connection URL
   - Username
   - Password
   - Database name

**Save these credentials!**

### 1.3 Configure Environment Variables

1. Click on your PostgreSQL service
2. Go to **"Variables"** tab
3. Note the **DATABASE_URL** variable

### 1.4 Deploy Spring Boot Backend

1. Click **"New Project"** → **"New Service"**
2. Select **"Deploy from GitHub repo"**
3. Connect your `spreetail` repository
4. Configure the service:
   - **Root directory**: `backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/expense-sharing-1.0.0.jar`

5. Add Environment Variables:
   ```
   SPRING_DATASOURCE_URL=${DATABASE_URL}
   SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
   SPRING_DATASOURCE_USERNAME=${PGUSER}
   SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   JWT_SECRET=c3ByZWV0YWlsLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9uLWFuZC12YWxpZGF0aW9uLW11c3QtYmUtMjU2LWJpdHMtbG9uZw==
   JWT_EXPIRATION=86400000
   ```

6. Click **"Deploy"**

7. Railway will automatically:
   - Clone the repository
   - Build with Maven
   - Start the application

8. Once deployed, note the backend URL (e.g., `https://spreetail-backend-production.up.railway.app`)

### 1.5 Verify Backend Deployment

1. Click on the backend service
2. Go to **"Deployments"** tab
3. Wait for status to be **"Success"**
4. Test the health endpoint:
   ```bash
   curl https://your-backend-url.railway.app/api/auth/register \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@test.com","password":"test123"}'
   ```

---

## Step 2: Deploy Frontend

### 2.1 Configure API URL

1. Open `frontend/src/api.js`
2. Update the `API_BASE_URL` to use your Railway backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app/api';
   ```

3. Commit and push the changes:
   ```bash
   git add frontend/src/api.js
   git commit -m "feat: update API URL for Railway deployment"
   git push origin main
   ```

### 2.2 Deploy React Frontend

1. Click **"New Project"** → **"New Service"**
2. Select **"Static Site"**
3. Connect your `spreetail` repository
4. Configure:
   - **Root directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Click **"Deploy"**

6. Once deployed, note the frontend URL

### 2.3 Verify Frontend Deployment

1. Open the frontend URL in a browser
2. You should see the Spreetail login page
3. Test registration and login

---

## Step 3: Connect Frontend to Backend

### 3.1 Update CORS Configuration

The backend should already have CORS configured for Railway domains. If needed, update `CorsConfig.java`:

```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-url.railway.app"
));
```

### 3.2 Redeploy Backend

After any CORS changes, the backend needs to be redeployed:
1. Go to the backend service on Railway
2. Click **"Redeploy"**
3. Wait for deployment to complete

---

## Railway Configuration Files

### railway.json

Create a `railway.json` file in the root directory for Railway CLI deployment:

```json
{
  "$schema": "https://schema.railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "mvn spring-boot:run",
    "healthcheckPath": "/actuator/health"
  }
}
```

---

## Docker Deployment (Alternative)

If you prefer Docker deployment:

### Backend Dockerfile

```dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/expense-sharing-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/spreetail
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=postgres
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=spreetail
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with: `docker-compose up -d`

---

## Railway CLI Deployment

### Install Railway CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

### Initialize Project

```bash
railway init
```

### Add Services

```bash
railway add postgresql
railway add
```

### Link to GitHub

```bash
railway link
```

### Deploy

```bash
railway up
```

---

## Monitoring and Logs

### View Logs on Railway

1. Click on a service
2. Go to **"Logs"** tab
3. View real-time logs
4. Filter by time or log level

### Common Issues

#### Issue: Backend fails to start
- Check the logs for error messages
- Verify environment variables
- Ensure PostgreSQL is accessible

#### Issue: Frontend can't connect to backend
- Verify CORS configuration
- Check backend service is running
- Verify API_BASE_URL in frontend

#### Issue: Database connection errors
- Verify DATABASE_URL is correct
- Check PostgreSQL service status
- Ensure password is correct

---

## Domain Configuration

### Custom Domain for Frontend

1. Go to your frontend service on Railway
2. Click **"Settings"**
3. Go to **"Networking"**
4. Add your custom domain
5. Update DNS records as instructed by Railway

### Custom Domain for Backend

Similar process for the backend service.

---

## Environment Variables Summary

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SPRING_DATASOURCE_URL` | JDBC URL | Yes | - |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | Driver class | Yes | `org.postgresql.Driver` |
| `SPRING_DATASOURCE_USERNAME` | DB username | Yes | - |
| `SPRING_DATASOURCE_PASSWORD` | DB password | Yes | - |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Hibernate DDL mode | Yes | `update` |
| `JWT_SECRET` | JWT signing key | Yes | - |
| `JWT_EXPIRATION` | Token expiration (ms) | No | `86400000` |

---

## Scaling

### Horizontal Scaling

For high traffic, you can scale the backend:

1. Go to backend service settings
2. Click **"Scale"**
3. Increase the number of instances

### Database Scaling

Railway automatically scales PostgreSQL based on usage.

---

## Cost Estimate (Railway Free Tier)

- **Static Site (Frontend)**: $0/month
- **Service (Backend)**: $5/month (after 500 hours free)
- **PostgreSQL**: $5/month (after 512MB free)

**Estimated monthly cost**: ~$10

---

## Rollback

If a deployment fails:

1. Go to **"Deployments"** tab
2. Click on a previous successful deployment
3. Click **"Redeploy"**

---

## Post-Deployment Checklist

- [ ] Backend service is running (green status)
- [ ] Frontend service is running (green status)
- [ ] PostgreSQL database is accessible
- [ ] User registration works
- [ ] User login works
- [ ] Create group works
- [ ] Add member works
- [ ] Create expense works (all split types)
- [ ] Balance calculation works
- [ ] Settlement suggestion works
- [ ] CORS is properly configured

---

## Support

For Railway-specific issues:
- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

For application issues:
- Check GitHub Issues: https://github.com/phanipaladugula/spreetail/issues

---

## Production Checklist

Before going to production:

- [ ] Update JWT_SECRET to a strong, unique value
- [ ] Enable SSL/TLS (Railway provides this by default)
- [ ] Set up monitoring and alerts
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up backup strategy
- [ ] Review and update security headers
- [ ] Test all edge cases
- [ ] Load test the application
- [ ] Document team onboarding process
- [ ] Set up CI/CD pipeline