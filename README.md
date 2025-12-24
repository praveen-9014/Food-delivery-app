# 🚀 Food Delivery App - Deployment Guide

## 📁 Project Structure
```
food-delivery-clean/
├── frontend/          # React frontend for Vercel
└── backend/           # Node.js backend for Render
```

## 🔧 Deployment Steps

### 1️⃣ Setup MongoDB Atlas
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Add database user (username: `admin`, password: `your-password`)
4. Whitelist all IPs (0.0.0.0/0)
5. Get connection string: `mongodb+srv://admin:password@cluster.mongodb.net/food-delivery`

### 2️⃣ Deploy Backend to Render
1. Sign up at [render.com](https://render.com)
2. Create "Web Service"
3. Connect GitHub repository
4. **Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/food-delivery
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=*
   ```
6. Deploy and note your URL: `https://your-app.onrender.com`

### 3️⃣ Deploy Frontend to Vercel
1. Sign up at [vercel.com](https://vercel.com)
2. Import GitHub repository
3. **Settings:**
   - Root Directory: `frontend`
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Environment Variable:**
   ```
   REACT_APP_API_URL=https://your-render-backend.onrender.com
   ```
5. Deploy and note your URL: `https://your-app.vercel.app`

### 4️⃣ Update CORS
1. Go back to Render
2. Update environment variable:
   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
3. Redeploy

## ✅ Test Your App
1. Visit your Vercel URL
2. Sign up with test account
3. Browse restaurants and place order
4. Check both frontend and backend are working

## 🔍 Troubleshooting
- **CORS Errors**: Check CORS_ORIGIN matches Vercel URL exactly
- **Database Issues**: Verify MongoDB connection string and IP whitelist
- **API Errors**: Check REACT_APP_API_URL in Vercel settings

## 📝 Important Notes
- Replace `your-password`, `your-app` with actual values
- Render free tier sleeps after 15 minutes (first request may be slow)
- Both services offer free tiers perfect for this project

## 🎉 Success!
Your Food Delivery App is now live with:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.onrender.com