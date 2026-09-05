# Services Layer

This directory contains the business logic separated from the framework (Next.js) layer.

## Structure

```
lib/services/
├── index.ts           # Barrel exports
├── order.service.ts   # Order creation, state transitions, events
├── recipient.service.ts  # Recipient data management, PII encryption
├── org.service.ts     # Org/YSWS management, authorization
├── auth.service.ts    # Authentication context, role checks
├── audit.service.ts   # Audit logging, compliance
└── email.service.ts   # Email templates, queue processing
```

## Usage

```typescript
import { createOrder, getOrderById } from "@/lib/services/order.service";
import { upsertRecipient, completeRecipientDetails } from "@/lib/services/recipient.service";
import { getAuthContext, requireRole } from "@/lib/services/auth.service";
import { auditLog } from "@/lib/services/audit.service";
import { processEmailQueue } from "@/lib/services/email.service";
```

## Principles

1. **Framework-agnostic** - No Next.js imports (no `next/cache`, `next/navigation`, etc.)
2. **Single responsibility** - Each service handles one domain
3. **Type-safe** - Uses Prisma types and explicit interfaces
4. **Testable** - Pure functions with injected dependencies
5. **Auditable** - All mutations create audit logs

## Migration Guide

When refactoring existing actions/API routes:

1. Move business logic to appropriate service
2. Keep actions/routes as thin wrappers
3. Use `revalidatePath` / `redirect` only in actions
4. Pass `requestId` from middleware for correlation