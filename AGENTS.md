# AGENTS.md

## Project Overview

**pssmstore** - A password/secrets management application built with Bun, Prisma
(SQLite), React 19, and TanStack Router.

## Architecture

```
pssmstore/
├── appserver/              # Bun backend server
│   ├── bun-main.ts         # Server entry point (port 8783)
│   ├── database/
│   │   ├── conn.ts         # Prisma client initialization
│   │   ├── db-ops/         # Database operations
│   │   └── models/         # Type definitions/models
│   ├── routes/             # API routes (POST/GET handlers)
│   │   ├── folders.ts      # /api/folders
│   │   ├── pages.ts        # /api/pages
│   │   ├── secrets.ts      # /api/secrets
│   │   └── resolver.ts     # Other routes
│   └── utilities/
│       ├── envvar.ts       # envar(), envarOptional()
│       └── errors.ts       # Error handling
├── appclient/              # React 19 frontend
│   ├── main/               # Entry point, router setup
│   ├── routes/             # TanStack Router pages (file-based)
│   │   ├── __root.tsx      # Root layout
│   │   ├── index.tsx       # Home
│   │   ├── folders.tsx     # Folders page
│   │   ├── pages.tsx       # Pages page
│   │   ├── secrets.tsx     # Secrets page
│   │   └── about.tsx       # About page
│   ├── components/ds/      # Design system
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   ├── Dialog.tsx
│   │   ├── DataGrid.tsx
│   │   └── Select.tsx
│   ├── tn-collections/     # TanStack DB collections (sync layer)
│   │   ├── query-client.ts # TanStack Query client
│   │   ├── folders-collection.ts
│   │   ├── pages-collection.ts
│   │   └── secrets-collection.ts
│   ├── utilities/          # Frontend utilities
│   ├── index.html          # Entry HTML
│   └── routeTree.gen.ts    # Auto-generated (do not edit)
├── app-common/             # Shared across appserver & appclient
│   ├── cipher/             # Encryption utilities
│   ├── logger.ts           # Logging
│   ├── random.ts           # randomHex(), randomInt()
│   └── type-guards.ts      # Type predicates
├── prisma/
│   ├── schema.prisma       # Data model (source of truth)
│   ├── generated/          # Auto-generated Prisma client
│   └── seed/               # Database seeding
```

## Data Model

**3-level hierarchy**: Folders → Pages → Secrets

| Model      | Fields                           | Notes                 |
| ---------- | -------------------------------- | --------------------- |
| identities | id, username, email, password    | User accounts         |
| folders    | id, name, created_at, updated_at | Container for pages   |
| pages      | id, name, folder_id, ...         | Container for secrets |
| secrets    | id, page_id, key, value, ...     | Key-value data        |

**Relations**:

- `pages.folder_id` → `folders.id`
- `secrets.page_id` → `pages.id`
- `secrets` has unique constraint on `(page_id, key)`

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Runtime    | Bun                                    |
| Database   | SQLite via Prisma                      |
| Validation | Arktype                                |
| Frontend   | React 19, TanStack Router, TanStack DB |
| Styling    | Tailwind CSS v4                        |

## Key Commands

- `bun run dev` - Start development server (http://localhost:8783)
- `bun run db:push` - Generate Prisma client and push schema
- `bun run db:seed` - Seed the database
- `bun run routes:generate` - Generate TanStack Router routes
- `bun run routes:watch` - Watch mode for TanStack Router generation
- `bun run fmt` - Format code with Deno

---

## Backend Patterns (appserver/)

### API Route Structure

Routes are defined in `appserver/routes/*.ts` as export objects:

```typescript
export const FolderRoutes = {
	"/api/folders": {
		POST: async (req: Request): Promise<Response> => {
			const body = await req.json();
			// handle POST
			return Response.json(data);
		},
		GET: async (req: Request): Promise<Response> => {
			// handle GET
			return Response.json(data);
		},
	},
};
```

**Key patterns**:

- Route handlers receive `Request`, return `Promise<Response>`
- Parse URL query strings using `new URL(req.url)` + `qs.parse()`
- Use `Response.json()` for JSON responses
- Error handling: wrap in try-catch, return 500 with error message
- Routes are registered in `bun-main.ts` using spread operator

### Database Access

- Import `prisma` from `../../prisma/prisma-client`
- Use standard Prisma operations: `prisma.folders.create()`,
  `prisma.pages.findMany()`
- Where clause filters: use `{ where: { field: { equals: value } } }`
- No pagination yet; implement if needed using `skip`/`take`

### Environment Variables

- Required: use `envar("KEY")` - throws if missing
- Optional: use `envarOptional("KEY", "default")` - returns default if missing
- Common: `PORT` defaults to "8783" if unset

---

## Frontend Patterns (appclient/)

### TanStack Router Setup

- File-based routing: each `.tsx` in `routes/` becomes a route
- Use `createFileRoute(path)` with `component` export
- Auto-generated `routeTree.gen.ts` - **do not edit manually**
- Run `bun run routes:watch` during development
- Navigate with `useNavigate()` hook

**Example**:

```typescript
export const Route = createFileRoute("/folders")({
	component: FoldersPage,
});
```

### TanStack DB Collections (Real-time Sync)

**Purpose**: Declarative data sync between frontend and backend

**Pattern**:

1. Define Arktype schema for validation
2. Create collection with `queryCollectionOptions`
3. Implement `queryFn` to fetch from `/api/*`
4. Implement `onInsert` to POST mutations back
5. Use `useLiveQuery()` in components to get live data

**Example** (`appclient/tn-collections/folders-collection.ts`):

```typescript
export const foldersCollection = createCollection(
	queryCollectionOptions({
		queryKey: ["folders"],
		schema: folderSchema,
		queryFn: async (ctx) => {
			const response = await fetch("/api/folders?...");
			return response.json();
		},
		onInsert: async (ctx) => {
			const mutations = ctx.transaction.mutations;
			await Promise.all(
				mutations.map((m) =>
					fetch("/api/folders", {
						method: "POST",
						body: JSON.stringify(m.modified),
					})
				),
			);
		},
		getKey: (item) => item.id,
	}),
);
```

**In components**:

```typescript
const { data: folders } = useLiveQuery((q) =>
	q.from({ folders: foldersCollection })
);
```

### Form Handling

- Use `useTransition()` for async operations within forms
- Use `startTransition()` wrapper for mutations
- Manual state: `useState()` for form values, errors
- Validation before submit (not after)
- On success: reset form, close dialogs, update state
- On error: set error state and display

**Example**:

```typescript
const [folderName, setFolderName] = useState("");
const [error, setError] = useState<string | null>(null);
const [isPending, startTransition] = useTransition();

const handleCreate = () => {
  if (!folderName.trim()) {
    setError("Required");
    return;
  }
  startTransition(async () => {
    try {
      await foldersCollection.insert({...});
      setFolderName(""); // reset
    } catch (err) {
      setError(err.message);
    }
  });
};
```

### Design System Components

Located in `appclient/components/ds/`:

- **Button**: `onClick`, `type`, `variant="outline"|"solid"`, `loading`,
  `disabled`
- **TextInput**: `label`, `value`, `onChange`, `error`, `required`, `autoFocus`
- **Dialog**: `open`, `onOpenChange`, `title`, `description` (children =
  content)
- **DataGrid**: `columns` (array of {header, key, render?}), `data`,
  `onRowClick`
- **Select**: (see component for API)

All support standard HTML attributes and `ref` prop.

### Styling

- Tailwind CSS v4 - use utility classes directly
- Color system: `foreground`, `background`, `primary`, `secondary`, etc. (check
  CSS)
- Responsive: `md:`, `lg:`, etc. prefixes
- Dark mode support (verify implementation)

---

## React 19 Agent Expectations

Default to React 19 idioms; avoid legacy patterns.

### Mandatory Features

- Use **Suspense** for async data/rendering (when applicable)
- Use **`useOptimistic`** for optimistic UI updates (when appropriate)
- Use **`use()` API** to consume promises/context during render

### Prohibited Patterns

- No custom loading/pending state where Actions suffice
- Avoid `useEffect` for data fetching or sync
- Avoid `forwardRef` - accept `ref` as a standard prop

### Component Conventions

- Accept `ref` as a standard prop in custom components
- Render context via `<Context>` instead of `.Provider`
- Place metadata (`<title>`, `<meta>`) directly in components

### Performance

- Assume concurrent rendering and replay
- Do not prematurely memoize
- Prefer declarative data/control flow over imperative optimization

---

## Common Utilities

### app-common/random.ts

- `randomHex(length = 8)` - Generate random hex string (crypto-secure)
- `randomInt(min, max)` - Generate random integer in range

**Usage**: Generate IDs for new records before inserting

### app-common/type-guards.ts

Common type predicates for validation. Check file for available guards.

### app-common/logger.ts

Shared logging utilities. Use for both backend and frontend logging.

---

## Development Workflow

1. **Schema changes**: Edit `prisma/schema.prisma`, run `bun run db:push`
2. **New API endpoint**: Create handler in `appserver/routes/*.ts`, register in
   `bun-main.ts`
3. **New page**: Create `.tsx` in `appclient/routes/`, run
   `bun run routes:watch`
4. **New collection sync**: Create file in `appclient/tn-collections/`, export
   from index
5. **New DS component**: Create in `appclient/components/ds/`, export from index
6. **Formatting**: Run `bun run fmt` before committing

---

## Troubleshooting

| Issue                         | Solution                                |
| ----------------------------- | --------------------------------------- |
| Routes not generating         | Run `bun run routes:generate`           |
| Prisma client out of sync     | Run `bun run db:push`                   |
| Collection not syncing        | Verify fetch URL matches API route      |
| TypeScript errors after edits | Check that schema is pushed & generated |

---

## Naming Conventions

- **Files**: kebab-case (e.g., `folders-collection.ts`)
- **Components**: PascalCase (e.g., `FoldersPage`)
- **Functions**: camelCase (e.g., `formatDate`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)
- **API routes**: lowercase with slashes (e.g., `/api/folders`)
- **IDs**: Generated via `randomHex()`, used throughout
