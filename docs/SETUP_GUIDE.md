# Helpdesk MVP Setup Guide

Complete setup guide for getting the helpdesk MVP running.

## Prerequisites

- Node.js 18+ and Bun installed
- PostgreSQL database (local or remote)
- Cloudflare account (for R2 storage)
- Email service account (Resend, SendGrid, or AWS SES)

## Step 1: Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your configuration:**
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `VITE_PUBLIC_SITE_URL` to your site URL
   - Configure email service (choose one):
     - Resend: Set `RESEND_API_KEY`
     - SendGrid: Set `SENDGRID_API_KEY`
     - AWS SES: Set `AWS_SES_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - Configure R2: Set `R2_BUCKET_NAME`
   - Set `BETTER_AUTH_SECRET` (generate a random secret)

## Step 2: Install Dependencies

```bash
bun install
```

## Step 3: Database Setup

1. **Create database:**
   ```sql
   CREATE DATABASE helpdesk;
   ```

2. **Generate migrations:**
   ```bash
   cd packages/storage
   bun run db:generate
   ```

3. **Apply migrations:**
   ```bash
   bun run db:push
   ```

## Step 4: Configure Email Service

Edit `packages/core/src/services/email.ts` and replace `MockEmailService` with your chosen provider:

### Option 1: Resend (Recommended)

```typescript
import { Resend } from 'resend';

export class ResendEmailService implements EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    await this.resend.emails.send({
      from: options.from || 'support@yourdomain.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}

export function getEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, using mock service');
    return new MockEmailService();
  }
  return new ResendEmailService(apiKey);
}
```

### Option 2: SendGrid

```typescript
import sgMail from '@sendgrid/mail';

export class SendGridEmailService implements EmailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    await sgMail.send({
      from: options.from || 'support@yourdomain.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
```

### Option 3: AWS SES

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export class SESEmailService implements EmailService {
  private client: SESClient;

  constructor(region: string = 'us-east-1') {
    this.client = new SESClient({ region });
  }

  async send(options: EmailOptions): Promise<void> {
    const command = new SendEmailCommand({
      Source: options.from || 'support@yourdomain.com',
      Destination: {
        ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
      },
      Message: {
        Subject: { Data: options.subject },
        Body: {
          Html: { Data: options.html },
          Text: options.text ? { Data: options.text } : undefined,
        },
      },
    });

    await this.client.send(command);
  }
}
```

## Step 5: Set Up Cloudflare R2

1. **Create R2 Bucket:**
   - Go to Cloudflare Dashboard → R2
   - Click "Create bucket"
   - Name it (e.g., `helpdesk-uploads`)
   - Note the bucket name

2. **Configure Environment:**
   - Add `R2_BUCKET_NAME=helpdesk-uploads` to `.env`
   - In Cloudflare Workers, bind the bucket to your worker

3. **Configure CORS (if needed):**
   - If accessing files directly from frontend, configure CORS on the bucket

## Step 6: Start Development Server

```bash
bun run dev
```

The application should now be running at `http://localhost:3000`

## Step 7: Verify Setup

1. **Test Database:**
   - Check that tables were created: `tickets`, `ticket_comments`, `knowledge_base_articles`, etc.

2. **Test Email:**
   - Create a test ticket
   - Check console logs (if using mock) or email provider dashboard

3. **Test File Upload:**
   - Try uploading a file to a ticket
   - Verify it appears in R2 bucket

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure database exists

### Migration Errors
- Make sure all schema files are exported in `packages/storage/src/db/schema/index.ts`
- Check for TypeScript errors in schema files
- Verify Drizzle config is correct

### Email Not Sending
- Check API keys are set correctly
- Verify email service is configured (not using mock)
- Check email provider dashboard for errors

### R2 Upload Issues
- Verify bucket name is correct
- Check bucket binding in Cloudflare Workers
- Ensure CORS is configured if needed

## Next Steps

- Customize email templates
- Set up production environment
- Configure domain and SSL
- Set up monitoring and logging
- Add additional features as needed

---

**Need Help?** Check the documentation in `docs/` folder or review the code comments.
