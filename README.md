# Helpdesk

A modern helpdesk and ticketing system for managing customer support requests and team collaboration.

## ✨ Features

- Ticket management system
- Customer support portal
- Team collaboration
- Email integration
- Knowledge base
- SLA tracking
- Analytics and reporting
- Multi-channel support
- Custom workflows

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ or Bun 1.3+
- PostgreSQL database
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/aryaminakshi71/helpdesk.git
cd helpdesk

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

## 📚 Tech Stack

- **Frontend**: React with TanStack Router
- **Backend**: Hono API with oRPC
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Deployment**: Cloudflare Pages + Workers
- **Package Manager**: Bun
- **Testing**: Playwright, Vitest

## 🏗️ Project Structure

```
helpdesk/
├── apps/
│   ├── web/          # Frontend application
│   └── api/          # Backend API
├── packages/         # Shared packages
│   ├── auth/         # Authentication package
│   ├── storage/      # Database package
│   ├── core/         # Core utilities
│   └── logger/       # Logging package
└── ...
```

## 🔧 Development

```bash
# Run development server
bun run dev

# Run type checking
bun run typecheck

# Run linter
bun run lint

# Format code
bun run format

# Run tests
bun run test

# Run E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui
```

## 📦 Deployment

### Cloudflare Pages (Frontend)

1. Connect your GitHub repository to Cloudflare Pages
2. Configure build settings:
   - Build command: `bun run build --filter=helpdesk-web`
   - Output directory: `apps/web/dist`
3. Add environment variables in Cloudflare dashboard

### Cloudflare Workers (Backend)

The API can be deployed to Cloudflare Workers if needed. See deployment documentation for details.

## 📝 Environment Variables

See `.env.example` for required environment variables.

**Demo Mode:**
- Set `VITE_DEMO_EMAIL` and `VITE_DEMO_PASSWORD` for demo login functionality
- Defaults to `demo@helpdesk.example` / `demo123456` if not set

## 🧪 Testing

The project includes comprehensive E2E tests using Playwright:

```bash
# Run all E2E tests
bun run test:e2e

# Run with UI
bun run test:e2e:ui
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/aryaminakshi71/helpdesk)
- [Documentation](https://github.com/aryaminakshi71/helpdesk/wiki)

## 👤 Author

Arya Labs

---

Made with ❤️ by Arya Labs
