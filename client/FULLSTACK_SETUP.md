# Full Stack Setup: Next.js + Prisma + Neon + Clerk + Cloudflare R2 + Vercel

Complete guide to set up your modern tech stack.

## 🎯 Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Database**: Neon (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Clerk
- **File Storage**: Cloudflare R2
- **Hosting**: Vercel

## 📋 Setup Checklist

### Phase 1: Local Development Setup (15 mins)

#### 1. Install Dependencies
```bash
cd client
npm install
```

#### 2. Set up Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Get your connection string: `postgresql://user:password@ep-xxxx.neon.tech/neon?sslmode=require`
4. Add to `.env.local`:
```env
DATABASE_URL="postgresql://..."
```

#### 3. Initialize Prisma
```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
# When prompted, name your migration something like "init"

# View database (optional)
npm run prisma:studio
```

#### 4. Set up Clerk Authentication

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Copy your keys:
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`
4. Configure Redirect URLs:
   - Sign in: `http://localhost:3000/sign-in`
   - Sign up: `http://localhost:3000/sign-up`
   - After sign in: `http://localhost:3000/dashboard`
   - After sign up: `http://localhost:3000/dashboard`
5. Update `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### 5. Set up Cloudflare R2

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **R2** under Storage
3. Create bucket: `kp-ams`
4. Create API token:
   - Click "Manage R2 API Tokens"
   - Create token with "Edit" permissions
   - Copy: **Access Key ID** and **Secret Access Key**
5. Find your **Account ID** in URL or account overview
6. Configure public URL:
   - Go to bucket settings
   - Add custom domain OR use auto-generated: `https://bucket-name.accountid.r2.cloudflarestorage.com`
7. Update `.env.local`:
```env
NEXT_PUBLIC_R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
NEXT_PUBLIC_R2_BUCKET_NAME=kp-ams
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket-url.r2.cloudflarestorage.com
```

#### 6. Test Local Setup
```bash
npm run dev
# Open http://localhost:3000
# Test: Navigate to /sign-in
```

### Phase 2: Deploy to Vercel (10 mins)

#### 1. Push to GitHub
```bash
git add .
git commit -m "Add full stack setup"
git push origin main
```

#### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Add all environment variables:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
NEXT_PUBLIC_R2_BUCKET_NAME=kp-ams
NEXT_PUBLIC_R2_PUBLIC_URL=https://...
```

6. Click "Deploy"
7. Wait for build to complete
8. Update Clerk redirect URLs to production domain:
   - Sign in: `https://yourdomain.vercel.app/sign-in`
   - Sign up: `https://yourdomain.vercel.app/sign-up`
   - After sign in: `https://yourdomain.vercel.app/dashboard`
   - After sign up: `https://yourdomain.vercel.app/dashboard`

#### 3. Run Production Migrations
```bash
# Migrate production database
DATABASE_URL="your-production-url" npm run prisma:migrate
```

### Phase 3: Migrate Express Backend Logic (Optional)

If migrating from Express to Next.js API routes:

```bash
# Create API route template
# src/app/api/[resource]/route.ts
```

API routes already created:
- ✅ `POST /api/upload` - File upload to R2
- ✅ `GET /api/clients` - List clients
- ✅ `POST /api/clients` - Create client
- ✅ `GET /api/clients/[id]` - Get client
- ✅ `PUT /api/clients/[id]` - Update client
- ✅ `DELETE /api/clients/[id]` - Delete client

Create more as needed using the same pattern.

## 🗂️ Key Files & Locations

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/prisma.ts` | Prisma client instance |
| `src/lib/auth.ts` | Clerk auth helpers |
| `src/lib/r2.ts` | Cloudflare R2 upload/delete |
| `src/middleware.ts` | Clerk middleware |
| `.env.local` | Local environment vars |
| `.env.example` | Environment template |
| `vercel.json` | Vercel config |

## 📖 Common Tasks

### Create a New Database Table

1. Update `prisma/schema.prisma`
2. Run migration:
```bash
npm run prisma:migrate
# Follow prompts, name your migration
```
3. Prisma client auto-updated

### Add a New API Route

```typescript
// src/app/api/proposals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const proposals = await prisma.proposal.findMany({
      where: { createdBy: user.id },
    });
    
    return NextResponse.json(proposals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Upload File to R2

```typescript
import { uploadToR2 } from '@/lib/r2';

const result = await uploadToR2(buffer, filename, mimetype);
// result: { url, key, size }
```

### Get Current User

```typescript
import { getCurrentUser, requireAuth } from '@/lib/auth';

// Safe (can be null)
const user = await getCurrentUser();

// Throws if not authenticated
const user = await requireAuth();
```

### Query Database

```typescript
import { prisma } from '@/lib/prisma';

const clients = await prisma.client.findMany({
  where: { createdBy: userId },
  include: { spocs: true },
});
```

## 🆘 Troubleshooting

### "Unauthorized" errors
- Ensure Clerk is properly configured
- Check middleware.ts is protecting routes
- Verify ENV variables are set

### Database connection failed
- Test connection: `npm run prisma:studio`
- Check `DATABASE_URL` in `.env.local`
- Ensure Neon database exists

### File upload fails
- Verify R2 credentials
- Check bucket name matches
- Ensure public URL is correctly configured

### Build fails on Vercel
- Check all ENV variables are set in Vercel dashboard
- Run `npm run build` locally to debug
- Check Prisma schema matches database

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2)
- [Vercel Docs](https://vercel.com/docs)

## ✅ Deployment Checklist

Before going to production:
- [ ] All ENV variables added to Vercel
- [ ] Database migrations run on production
- [ ] Clerk redirect URLs updated for production domain
- [ ] R2 bucket public access configured
- [ ] Test file upload on production
- [ ] Test authentication flow
- [ ] Custom domain configured (optional)
- [ ] Vercel analytics enabled (optional)

---

**Your application is now production-ready! 🚀**
