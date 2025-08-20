# 🚀 Deployment Guide - Grind Synap 3.0

## 🎯 **Quick Deployment (5 minutes)**

### **Option 1: Vercel + Railway (Recommended) ⭐**

---

## 📋 **Prerequisites**

- [ ] GitHub account
- [ ] Supabase project set up
- [ ] EmailJS configured
- [ ] All environment variables ready

---

## 🏗️ **Backend Deployment - Railway**

### **Step 1: Prepare Backend**
```bash
# Make sure your backend has a start script
cd backEnd
npm install
```

### **Step 2: Deploy to Railway**
1. **Go to [Railway.app](https://railway.app/)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your `Grind_Synap3.0` repository**
6. **Select the `backEnd` folder as root**

### **Step 3: Configure Environment Variables**
In Railway dashboard, add these variables:
```env
NODE_ENV=production
PORT=4000
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters-long
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
FRONTEND_BASE=https://your-vercel-app.vercel.app
```

### **Step 4: Get Your Backend URL**
- Railway will give you a URL like: `https://grind-synap-backend.railway.app`
- **Save this URL** - you'll need it for frontend deployment

---

## 🎨 **Frontend Deployment - Vercel**

### **Step 1: Update Frontend Environment**
Update `frontEnd/.env.production`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE=https://your-railway-backend-url.railway.app
VITE_EMAILJS_SERVICE_ID=service_99yk4us
VITE_EMAILJS_TEMPLATE_ID=template_munfg1w
VITE_EMAILJS_INVITATION_TEMPLATE_ID=template_abekdac
VITE_EMAILJS_PUBLIC_KEY=4h8Dq7z_reAUzHagL
```

### **Step 2: Deploy to Vercel**
1. **Go to [Vercel.com](https://vercel.com/)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your `Grind_Synap3.0` repository**
5. **Configure build settings**:
   - **Root Directory**: `frontEnd`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### **Step 3: Add Environment Variables**
In Vercel dashboard → Settings → Environment Variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE=your-railway-backend-url
VITE_EMAILJS_SERVICE_ID=service_99yk4us
VITE_EMAILJS_TEMPLATE_ID=template_munfg1w
VITE_EMAILJS_INVITATION_TEMPLATE_ID=template_abekdac
VITE_EMAILJS_PUBLIC_KEY=4h8Dq7z_reAUzHagL
```

---

## 🔄 **Update CORS Settings**

### **Step 1: Update Backend CORS**
After frontend deployment, update your Railway backend environment:
```env
FRONTEND_BASE=https://your-vercel-app.vercel.app
```

---

## ✅ **Alternative Options**

### **Option 2: Netlify + Railway**
- Deploy frontend to **Netlify** instead of Vercel
- Same process, just use Netlify's dashboard

### **Option 3: All-in-One Platforms**

#### **Render.com**
- Deploy both frontend and backend
- Free tier available
- Easy setup with GitHub

#### **Heroku**
- Classic choice for Node.js apps
- Easy PostgreSQL integration
- Free tier (with limitations)

---

## 🎯 **One-Click Deployment Commands**

### **Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontEnd
vercel --prod
```

### **Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd backEnd
railway login
railway deploy
```

---

## 📊 **Deployment Checklist**

### **Before Deployment:**
- [ ] Test locally with production environment variables
- [ ] Update all URLs in environment files
- [ ] Verify Supabase database is accessible
- [ ] Test EmailJS configuration
- [ ] Check file upload functionality

### **After Deployment:**
- [ ] Test user registration and login
- [ ] Verify event creation works
- [ ] Test email notifications
- [ ] Check all API endpoints
- [ ] Test on mobile devices

---

## 🐛 **Common Issues & Solutions**

### **CORS Errors**
```javascript
// Update FRONTEND_BASE in backend environment
FRONTEND_BASE=https://your-actual-vercel-url.vercel.app
```

### **Build Failures**
```bash
# Clear cache and reinstall
npm ci
rm -rf node_modules package-lock.json
npm install
```

### **Environment Variables Not Loading**
- Restart the deployment service
- Verify variable names match exactly
- Check for typos in URLs

---

## 🔗 **Quick Links**

- **Railway**: [railway.app](https://railway.app)
- **Vercel**: [vercel.com](https://vercel.com)
- **Netlify**: [netlify.com](https://netlify.com)
- **Render**: [render.com](https://render.com)

---

## 💡 **Pro Tips**

1. **Use Railway for backend** - Better Node.js support
2. **Use Vercel for frontend** - Optimized for React/Vite
3. **Set up custom domains** for professional URLs
4. **Enable auto-deploy** from GitHub for continuous deployment
5. **Monitor logs** during first deployment

---

## 🎉 **Success!**

After deployment, your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`

**Test everything** and share your live hackathon platform! 🚀
