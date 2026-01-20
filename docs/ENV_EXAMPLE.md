# Environment Variables Template

Copy this to `.env` in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/helpdesk

# Auth
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (Optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cloudflare R2
R2_BUCKET_NAME=helpdesk-uploads
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# Site URL
VITE_PUBLIC_SITE_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

## Notes

- `.env.example` is blocked by gitignore, so use this file as a reference
- Generate `BETTER_AUTH_SECRET` using: `openssl rand -base64 32`
- For local development, you can use a local PostgreSQL instance
- R2 credentials are only needed for file uploads in production
