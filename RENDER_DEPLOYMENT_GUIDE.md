# 🚀 Deploy AgriSmart Backend to Render

## Prerequisites
- GitHub repository: https://github.com/Lakshman0018/AGGRI_SMART.git
- Frontend already deployed at: https://digital-agrimart.onrender.com/

## Step-by-Step Deployment Guide

### 1. Create Render Account
- Go to https://render.com
- Sign up/Login with your GitHub account

### 2. Create New Web Service
1. Click **"New +"** button → Select **"Web Service"**
2. Connect your GitHub repository: `Lakshman0018/AGGRI_SMART`
3. Configure the service:
   - **Name**: `agrismart-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or upgrade as needed)

### 3. Set Environment Variables
Add the following environment variables in Render dashboard:

**Required Variables:**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://aggri_smart:lakshman%4069@cluster0.wwkcncb.mongodb.net/agri_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=THIS_IS_A_SUPER_SECURE_RANDOM_KEY_FOR_JWT_987654
REFRESH_TOKEN_SECRET=REFRESH_TOKEN_SUPER_SECRET_KEY_123456
CLIENT_URL=https://digital-agrimart.onrender.com/
OPENWEATHER_API_KEY=185d173fbf66e20d26b138058524f3c8
GEMINI_API_KEY=AIzaSyBxuYXXKbbr1Y1Aewmpdj2ROhypawy1_Dw
LOG_LEVEL=info
DISABLE_REDIS=true
```

**Optional Variables (if using email features):**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Deploy Backend
- Click **"Create Web Service"**
- Wait for the build and deployment to complete (~5-10 minutes)
- Once deployed, you'll get a URL like: `https://agrismart-backend.onrender.com`

### 5. Update Frontend Environment Variables in Netlify
1. Go to Netlify dashboard: https://app.netlify.com
2. Select your site: `shiny-swan-18d637`
3. Go to **Site settings** → **Environment variables**
4. Update these variables:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_WEATHER_API_KEY=185d173fbf66e20d26b138058524f3c8
VITE_GEMINI_API_KEY=AIzaSyBxuYXXKbbr1Y1Aewmpdj2ROhypawy1_Dw
```

5. **Trigger a new deployment** in Netlify:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

### 6. Test Your Application
1. Wait for both deployments to complete
2. Visit: https://shiny-swan-18d637.netlify.app
3. Test login, product listing, and other features
4. Check browser console for any errors

## Important Notes

### 🔥 Security Considerations
**IMPORTANT**: Your API keys are currently exposed in the codebase. For production:
- Generate new API keys from:
  - OpenWeatherMap: https://openweathermap.org/api
  - Google Gemini: https://makersuite.google.com/app/apikey
- Use Netlify environment variables instead of hardcoding
- Rotate JWT secrets to new secure random strings

### ⚡ Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds (cold start)
- 750 hours/month free tier
- Consider upgrading to paid plan for production use

### 🔄 Auto-Deploy Setup
- Enable **Auto-Deploy** in Render settings
- Any push to `main` branch will trigger automatic deployment

### 📊 Monitoring
- Monitor logs in Render dashboard
- Set up health check endpoint monitoring
- Check MongoDB Atlas metrics

## Troubleshooting

### Backend Not Starting
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### CORS Errors
- Ensure `CLIENT_URL` in backend includes your Netlify URL
- Check CORS configuration in `backend/server.js`

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set correctly in Netlify
- Check network tab in browser dev tools
- Ensure backend is running (check Render dashboard)

## Next Steps
1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerting
4. Implement CI/CD pipeline
5. Add rate limiting and security enhancements

---

**Your Deployment URLs:**
- Frontend:https://digital-agrimart.onrender.com/
- Backend: https://your-backend-url.onrender.com (after deployment)
