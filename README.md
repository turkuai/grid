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

A pure client-side table. Receives data as a prop and handles sorting and pagination locally.

```tsx
import { Grid, type RowAction } from 'tai-grid';

const actions: RowAction[] = [
  {
    icon: <MyIcon />,
    tooltip: 'Do something',
    onClick: (row) => console.log(row),
  },
];

<Grid
  columns={['name', 'email']}
  data={rows}
  allowEditing
  allowDelete
  onEditRow={(row) => handleEdit(row)}
  onDeleteRow={(row) => handleDelete(row)}
  onRowClick={(row) => handleClick(row)}
  rowActions={actions}
/>
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Array<string \| ColumnConfig>` | required | Column keys or config objects |
| `data` | `RowData[]` | `[]` | Rows to display |
| `allowEditing` | `boolean` | `false` | Show edit button per row |
| `allowDelete` | `boolean` | `false` | Show delete button per row |
| `pageSize` | `number` | `20` | Rows per page |
| `height` | `string` | `'500px'` | CSS height of the table container |
| `onEditRow` | `(row) => void` | required | Called when edit is clicked |
| `onDeleteRow` | `(row) => void` | required | Called when delete is clicked |
| `onRowClick` | `(row) => void` | — | Called when a row is clicked |
| `rowActions` | `RowAction[]` | — | Extra action buttons rendered per row |
| `columnRenderers` | `Record<string, ComponentType>` | — | Custom cell renderers per column key |

**ColumnConfig**

```ts
type ColumnConfig = {
  field: string;
  displayName?: string;
  valueGetter?: (row: RowData) => unknown;
};
```

**RowAction**

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

Extends `Grid` with server-side pagination, search, add, edit, and delete over a REST API. All HTTP requests include CSRF credentials.

```tsx
import { ServerGrid } from 'tai-grid';

<ServerGrid
  columns={['name', 'email']}
  path="users"
  allowEditing
  allowDelete
  pageSize={20}
  showAddButton
  formComponent={MyForm}
  getApiBase={() => 'https://example.com'}
  showNot={(msg, type) => notify(msg, type)}
  query={searchQuery}
  rowActions={actions}
  transformAddPayload={(payload) => ({ name: payload.name })}
  transformEditPayload={(payload) => ({ name: payload.name })}
/>
```

**Additional Props**

| Prop | Type | Description |
|---|---|---|
| `path` | `string` | API endpoint, e.g. `users` → `/api/users` |
| `getApiBase` | `() => string` | Returns the base URL for all requests |
| `showNot` | `(msg, type) => void` | Notification callback (`'success'` or `'error'`) |
| `showAddButton` | `boolean` | Show the top-right add button |
| `formComponent` | `ComponentType` | Form rendered inside add/edit dialogs |
| `transformAddPayload` | `(payload) => payload` | Transform or validate data before POST |
| `transformEditPayload` | `(payload, ctx) => payload` | Transform or validate data before PATCH |
| `query` | `string` | Search string appended as `?search=` |
| `viewMode` | `'grid' \| 'list'` | Switch between table and infinite-scroll list |
| `renderItem` | `ComponentType` | Item renderer when `viewMode='list'` |
| `loadPage` | `(page) => Promise<RowData[]>` | Custom page loader for list mode |

The library automatically strips `id`, `created_at`, and `updated_at` from edit payloads before calling `transformEditPayload`. Any additional field filtering (passwords, computed fields, etc.) is the responsibility of the consuming app via `transformEditPayload`.

**API conventions**

- Endpoints are resolved as `/api/{path}`.
- GET accepts `?page=N&search=query`.
- POST to `/api/{path}`, PATCH to `/api/{path}/{id}`, DELETE to `/api/{path}/{id}`.
- Responses can be a plain array or an object with any array-valued key. `totalPages` is read from the response root if present.

---

### DataSetView

Infinite-scroll list backed by a custom page loader.

```tsx
import { DataSetView } from 'tai-grid';

<DataSetView
  loadPage={(page) => fetchPage(page)}
  render={({ data }) => <MyCard data={data} />}
/>
```

---

## Build

```bash
npm run build
```

Output goes to `dist/`. The consuming app should reference the `dist/` build, not `src/` directly.

---

## Design principles

- The library knows nothing about the consuming application. No domain-specific field names, error messages, or business rules live here.
- Extra per-row buttons are injected via `rowActions`. The consuming app owns the icon, tooltip, and handler.
- Payload transformation and validation belong in the app via `transformAddPayload` / `transformEditPayload`.
- Error messages from failed requests are passed through directly from the server response.
