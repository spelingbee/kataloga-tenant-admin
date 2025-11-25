# Port Configuration

## Application Ports

The project uses the following ports for different applications:

| Application | Port | URL | Description |
|------------|------|-----|-------------|
| **Backend API** | 3000 | http://localhost:3000 | NestJS backend API |
| **Frontend** | 3000 | http://localhost:3000 | Customer-facing Nuxt app |
| **Super Admin** | 3002 | http://localhost:3002 | Super admin panel |
| **Tenant Admin** | 3003 | http://localhost:3003 | Tenant admin dashboard |

## Development Server

To start the tenant-admin development server:

```bash
cd apps/tenant-admin
pnpm dev
```

The application will be available at: **http://localhost:3003**

## Port Configuration

The port is configured in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devServer: {
    port: 3003,
  },
  // ...
})
```

## Changing the Port

If you need to use a different port:

1. Update `nuxt.config.ts`:
```typescript
devServer: {
  port: YOUR_PORT,
}
```

2. Update `.env` if needed:
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Port Conflicts

If you encounter a port conflict:

1. Check which process is using the port:
```bash
# Windows
netstat -ano | findstr :3003

# Linux/Mac
lsof -i :3003
```

2. Either:
   - Stop the conflicting process
   - Change the port in `nuxt.config.ts`

## API Connection

The tenant-admin connects to the backend API at:
- **Development**: http://localhost:3000 (configured in `.env`)
- **Production**: Set via `NUXT_PUBLIC_API_BASE_URL` environment variable

## CORS Configuration

Make sure the backend allows requests from the tenant-admin port. Check `apps/backend/src/main.ts`:

```typescript
const allowedOrigins = [
  'http://localhost:3000',  // Frontend
  'http://localhost:3002',  // Super Admin
  'http://localhost:3003',  // Tenant Admin (add this)
];
```

## Running Multiple Apps

You can run all applications simultaneously:

```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev

# Terminal 3 - Super Admin
cd apps/super-admin
pnpm dev

# Terminal 4 - Tenant Admin
cd apps/tenant-admin
pnpm dev
```

All applications will be accessible on their respective ports.
