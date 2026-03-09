# Next.js Migration Guide

This project has been migrated from Vite + React Router to **Next.js** with the App Router.

## ✅ What Was Changed

### Architecture
- **Before**: Vite SPA + Express backend + React Router
- **After**: Next.js Full Stack with App Router + Express backend

### Key Migrations
1. **Routing**: React Router → Next.js App Router
   - Routes now use file-system based routing in `src/app/`
   - Route params use `[id]` folder syntax instead of `:id`
   - Route groups like `(auth)` and `(protected)` organize routes logically

2. **Build System**: Vite → Next.js
   - Replaced `vite.config.ts` with `next.config.ts`
   - Updated `package.json` scripts for Next.js
   - Removed Vite-specific dependencies

3. **Environment Variables**: `import.meta.env` → `process.env`
   - Uses `NEXT_PUBLIC_*` prefix for client-side env vars
   - Updated `src/lib/api.ts` to use `process.env.NEXT_PUBLIC_API_URL`

4. **Middleware**: Created `middleware.ts`
   - Handles route protection at the Edge
   - Redirects unauthenticated users to `/login`

### Components & Pages
- ✅ All existing React components work as-is
- ✅ All pages are now wrapped in Next.js route files
- ✅ Auth store (Zustand) works unchanged
- ✅ API client (axios) works with updated env variables

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Set Environment Variables
Create or update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

## 📁 New Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (protected)/       # Protected route group
│   │   │   ├── layout.tsx     # Wraps all protected routes
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── proposals/
│   │   │   ├── assignments/
│   │   │   ├── billing/
│   │   │   └── users/
│   │   ├── api/               # Next.js API routes
│   │   │   └── health/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Root page (redirect)
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   ├── pages/                 # Page components (wrapped by app routes)
│   ├── store/                 # Zustand stores
│   ├── lib/                   # Utility functions
│   ├── types/                 # TypeScript types
│   └── ... (other assets)
├── middleware.ts              # Edge middleware for route protection
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript config for Next.js
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
└── package.json               # Updated for Next.js
```

## 🔒 Protected Routes

The middleware (`middleware.ts`) automatically handles:
- ✅ Redirecting unauthenticated users to `/login`
- ✅ Allowing `/login` without authentication
- ✅ Protecting all other routes with JWT token check

The protected layout (`app/(protected)/layout.tsx`) provides:
- ✅ Secondary auth check for JavaScript-level protection
- ✅ Wraps routes with the main `Layout` component
- ✅ Handles role-based access if needed

## 🔄 API Integration

The API client remains unchanged in functionality:
- ✅ Uses `axios` with JWT token from localStorage
- ✅ Automatically attaches bearer token to requests
- ✅ Handles 401 errors and redirects to login
- ✅ Environment-based API URL configuration

## 📝 Notes & Considerations

### Breaking Changes
- ❌ React Router imports removed - won't work if accidentally imported
- ❌ Vite plugins/config no longer used
- ❌ `index.html` replaced by Next.js system (kept for reference)

### What Stayed the Same
- ✅ All existing components unchanged
- ✅ All existing pages unchanged  
- ✅ Auth store (Zustand) unchanged
- ✅ API client logic unchanged (env vars updated)
- ✅ Styling (Tailwind, PostCSS) unchanged

### Optional: Migrate API Routes
You can optionally move Express endpoints to Next.js API routes (`src/app/api/*`), but the current setup works with the separate Express backend.

## 🛠️ Troubleshooting

### Issue: "Cannot find module '@/...'"
**Solution**: Make sure `tsconfig.json` has the `paths` alias configured:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Environment variables not loading
**Solution**: Ensure variables start with `NEXT_PUBLIC_` for client-side access and are in `.env.local`

### Issue: Middleware not protecting routes
**Solution**: Check that `middleware.ts` is in the project root and settings match your needs

### Issue: API requests failing with CORS
**Solution**: Ensure the Express backend has CORS enabled and API URL is correct in `.env.local`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)

---

**Migration completed** - All systems ready for Next.js! 🎉
