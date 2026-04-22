# tai-grid

A generic, reusable React/TypeScript component library for rendering paginated data tables and infinite-scroll list views backed by a REST API.

The library has no knowledge of any specific application domain. It accepts data, column definitions, and callbacks as props, and the consuming application is responsible for all business logic.

---

## Requirements

- React 19+
- The consuming app must provide a CSRF token via a `<meta name="csrf-token">` tag or an `XSRF-TOKEN` cookie (standard Laravel convention).

---

## Installation

The library is distributed as a local package or git submodule. Install it by pointing to the local path or the git URL:

```bash
npm install ../grid
# or
npm install git+https://github.com/turkuai/grid.git
```

Import the stylesheet once in your app entry point:

```tsx
import 'tai-grid/style.css';
```

---

## Components

### Grid

Client-side table with sorting and pagination.

```tsx
import { Grid, type RowAction } from 'tai-grid';

const actions: RowAction[] = [
  { icon: <Icon />, tooltip: 'Action', onClick: (row) => doSomething(row) },
];

<Grid
  columns={['name', 'email']}
  data={rows}
  allowEditing
  onEditRow={handleEdit}
  onDeleteRow={handleDelete}
  rowActions={actions}
/>
```

**Key props:** `columns`, `data`, `allowEditing`, `allowDelete`, `onEditRow`, `onDeleteRow`, `rowActions`, `columnRenderers`, `onRowClick`, `pageSize`, `height`

**RowAction type:**
```ts
type RowAction = {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (row: RowData) => void;
  className?: string;
};
```

---

### ServerGrid

Grid + server-side pagination, search, add, edit, delete via REST API.

```tsx
<ServerGrid
  columns={['name', 'email']}
  path="users"
  allowEditing
  allowDelete
  formComponent={UserForm}
  getApiBase={() => 'https://api.example.com'}
  showNot={(msg, type) => notify(msg, type)}
  rowActions={actions}
  transformAddPayload={(p) => ({ name: p.name })}
  transformEditPayload={(p) => ({ name: p.name })}
/>
```

**Key props:** `path`, `getApiBase`, `showNot`, `formComponent`, `transformAddPayload`, `transformEditPayload`, `query`, `showAddButton`, `viewMode`

Library strips `id`, `created_at`, `updated_at` automatically. Use `transformEditPayload` / `transformAddPayload` for app-specific validation and cleanup.

**API:** GET `/api/{path}?page=N&search=query`, POST/PATCH/DELETE `/api/{path}(/{id})`. Responses can be array or object with any array-valued key.

---

### DataSetView

Infinite scroll backed by custom loader.

```tsx
<DataSetView loadPage={(page) => fetchPage(page)} render={Row} />
```

---

## Build

```bash
npm run build
```

Output to `dist/`. Reference `dist/` in consuming apps, not `src/`.

---

## Design

- Library is domain-agnostic. No app-specific field names, messages, or rules.
- Custom row buttons via `rowActions`. App owns icon, tooltip, handler.
- Validation and field cleanup via `transformAddPayload`/`transformEditPayload`.
- Server errors passed through as-is.
