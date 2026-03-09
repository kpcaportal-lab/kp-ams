# Next.js Migration - Setup & Deployment Guide

## 🎉 Migration Complete!

Your project has been successfully migrated from Vite + React Router to **Next.js**. This guide covers the final steps to get your application running.

##⚡ Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
```

This will install all Next.js dependencies and remove Vite packages.

### 2. Configure Environment
**Development (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Production (vercel.json or .env.production):**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test the Application
- ✅ Navigate to login page
- ✅ Test login functionality
- ✅ Check all protected routes work
- ✅ Verify navigation between pages

### 5. Build for Production
```bash
npm run build
npm start
```

## 📁 What Changed

### Before (Vite)
```
client/
├── main.tsx (entry point)
├── App.tsx (router setup)
├── vite.config.ts
├── package.json (with vite, react-router-dom)
└── pages/ (just components)
```

### After (Next.js)
```
client/
├── src/app/ (App Router - file-based routing)
│   ├── layout.tsx (root layout)
│   ├── page.tsx (root redirect)
│   ├── (auth)/login/page.tsx
│   └── (protected)/* (all protected pages)
├── middleware.ts (edge route protection)
├── next.config.ts
├── tsconfig.json (Next.js config)
├── package.json (with next, without router)
└── NEXTJS_MIGRATION.md (detailed guide)
```

## 🔄 Key Differences in Development

### Navigation
**Before:**
```typescript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
```

**After:**
```typescript
import { useNavigate } from '@/hooks/useNavigate';
const navigate = useNavigate();
navigate('/dashboard');
```

Custom hook handles Next.js navigation automatically.

### Environment Variables
**Before:**
```typescript
const baseURL = import.meta.env.VITE_API_URL;
```

**After:**
```typescript
const baseURL = process.env.NEXT_PUBLIC_API_URL;
```

Must use `NEXT_PUBLIC_` prefix for client-side access.

## 🛡️ Route Protection

### Middleware Protection (Edge Level)
Handled in `middleware.ts`:
- ✅ Redirects unauthenticated users to `/login`
- ✅ Allows `/login` without token
- ✅ Runs on every request

### Layout Protection (JS Level)
Handled in `app/(protected)/layout.tsx`:
- ✅ Secondary auth check
- ✅ Wraps protected routes with main Layout
- ✅ Uses Zustand auth store

## 🚀 Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

```bash
npm run build
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Server
```bash
npm install
npm run build
npm start
```

## 📊 Performance Improvements

With Next.js, you get:
- ✅ **Server-side rendering** for faster initial loads
- ✅ **Automatic code splitting** per route
- ✅ **Image optimization** with next/image
- ✅ **API routes** if needed later
- ✅ **Built-in SEO** with metadata
- ✅ **Better caching** strategies

## 🔧 Troubleshooting

### Issue: "Cannot find module '@/...'"
**Fix:** Ensure tsconfig.json has paths configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Style not loading
**Fix:** Check `src/app/globals.css` is being imported in layout.

### Issue: API requests failing
**Fix:** 
1. Verify `NEXT_PUBLIC_API_URL` is set in `.env.local`
2. Check Express backend is running
3. Verify CORS is enabled on backend

### Issue: Middleware not working
**Fix:** Restart dev server after middleware changes

### Issue: Build fails with TypeScript errors
**Fix:**
```bash
npx tsc --noEmit  # Check errors
npm run build     # Try building again
```

## 📚 File Structure Reference

```
client/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   └── login/page.tsx
│   │   ├── (protected)/              # Protected routes group
│   │   │   ├── layout.tsx            # Wraps protected routes
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx          # List page
│   │   │   │   └── [id]/page.tsx     # Detail page
│   │   │   ├── proposals/
│   │   │   ├── assignments/
│   │   │   ├── billing/page.tsx
│   │   │   └── users/page.tsx
│   │   ├── api/                      # API routes (if needed)
│   │   │   └── health/route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Root page (redirect)
│   │   └── globals.css               # Global styles
│   ├── components/                   # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── NavLink.tsx               # NEW - Next.js nav
│   │   ├── ProtectedRoute.tsx
│   │   └── modals/
│   ├── hooks/                        # Custom hooks
│   │   └── useNavigate.ts            # NEW - Router wrapper
│   ├── pages/                        # Page components (wrapped)
│   ├── store/                        # Zustand stores
│   ├── lib/                          # Utils & API client
│   ├── types/                        # TypeScript types
│   └── assets/                       # Static assets
├── public/                           # Static files (next.js)
├── middleware.ts                     # Edge middleware
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind CSS
├── postcss.config.js                 # PostCSS
├── .env.local                        # Env variables
├── package.json                      # Dependencies
└── NEXTJS_MIGRATION.md               # Migration guide
```

## ✅ Verification Checklist

Before deploying to production:
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts successfully
- [ ] Login page loads at `/login`
- [ ] Can log in with valid credentials
- [ ] Redirected to dashboard after login
- [ ] All routes in sidebar work
- [ ] Navigation between pages works
- [ ] Logout works and redirects to login
- [ ] Protected routes redirect to login when not authenticated
- [ ] `npm run build` completes without errors
- [ ] `npm start` runs production build
- [ ] All routes work in production build

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Deployment](https://nextjs.org/docs/deployment)

## 🆘 Getting Help

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review the NEXTJS_MIGRATION.md file
3. Check Next.js documentation
4. Review error messages in terminal carefully

---

**Happy coding with Next.js! 🚀**
