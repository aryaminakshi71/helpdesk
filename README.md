# Helpdesk MVP

A modern helpdesk SaaS application built with:
- **TanStack Start** - Frontend framework
- **oRPC** - Type-safe API layer
- **Drizzle ORM** - Database toolkit
- **Cloudflare R2** - File storage
- **Better Auth** - Authentication

## Quick Start

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**
   ```bash
   bun run db:generate
   bun run db:push
   ```

4. **Start development server:**
   ```bash
   bun run dev
   ```

## Project Structure

```
helpdesk/
├── apps/
│   ├── api/          # oRPC API server
│   └── web/          # TanStack Start frontend
├── packages/
│   ├── core/         # Shared validators & services
│   └── storage/      # Database schemas & R2 helpers
├── docs/             # Documentation
└── scripts/          # Setup scripts
```

## Features

- ✅ Ticket management (CRUD, assignment, comments)
- ✅ Knowledge base articles
- ✅ SLA tracking
- ✅ File attachments (R2 storage)
- ✅ Email notifications
- ✅ Dashboard with metrics

## Documentation

See `docs/` folder for:
- `SETUP_GUIDE.md` - Complete setup instructions
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `NEXT_STEPS.md` - Next steps guide

## License

Private
