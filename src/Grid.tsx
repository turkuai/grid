import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type CellContext,
    type ColumnDef,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import './styles/Grid.css';

type RowData = Record<string, unknown>;

type ColumnRendererProps = {
    value: unknown;
    data: RowData;
};

type ColumnConfig = {
    field: string;
    displayName?: string;
    valueGetter?: (row: RowData) => unknown;
};

type GridLabels = {
    actionsHeader?: string;
    edit?: string;
    add?: string;
    delete?: string;
    previous?: string;
    next?: string;
    page?: string;
    of?: string;
};

const formatHeader = (str: unknown) =>
    typeof str !== 'string'
        ? ''
        : str
              .split('_')
              .map((w) => w[0]!.toUpperCase() + w.slice(1))
              .join(' ');

const getField = (col: string | ColumnConfig) => (typeof col === 'object' ? col.field : col);

const getHeader = (col: string | ColumnConfig) => (typeof col === 'object' && col.displayName) || formatHeader(getField(col));

type GridProps = {
    columns: Array<string | ColumnConfig> | null;
    columnRenderers?: Record<string, React.ComponentType<ColumnRendererProps>>;
    data?: RowData[];
    allowEditing?: boolean;
    allowDelete?: boolean;
    pageSize?: number;
    height?: string;
    onEditRow: (row: RowData) => void;
    onDeleteRow: (row: RowData) => void;
    onRowClick?: (row: RowData) => void;
    onAddUsers?: (row: RowData) => void;
    labels?: GridLabels;
};

export default function Grid({
    columns,
    columnRenderers = {},
    data = [],
    allowEditing = false,
    allowDelete = false,
    pageSize = 20,
    height = '500px',
    onEditRow,
    onDeleteRow,
    onRowClick,
    onAddUsers,
    labels = {},
}: GridProps): React.JSX.Element {
    const [rows, setRows] = useState<RowData[]>(Array.isArray(data) ? data : []);

    useEffect(() => {
        setRows(Array.isArray(data) ? data : []);
    }, [data]);

    const gridLabels = useMemo(
        () => ({
            actionsHeader: labels.actionsHeader ?? 'Actions',
            edit: labels.edit ?? 'Edit',
            add: labels.add ?? 'Add',
            delete: labels.delete ?? 'Delete',
            previous: labels.previous ?? 'Previous',
            next: labels.next ?? 'Next',
            page: labels.page ?? 'Page',
            of: labels.of ?? 'of',
        }),
        [labels.actionsHeader, labels.edit, labels.add, labels.delete, labels.previous, labels.next, labels.page, labels.of],
    );

    const cols = useMemo<ColumnDef<RowData>[]>(() => {
        const list = Array.isArray(columns) && columns.length > 0 ? columns : rows[0] ? Object.keys(rows[0]) : [];

        const dataCols = list.map((col) => {
            const id = getField(col);
            const colObj = typeof col === 'object' ? col : { field: id };
            return {
                id,
                accessorKey: id,
                header: getHeader(col),
                enableSorting: true,
                cell: ({ row, getValue }: CellContext<RowData, unknown>) => {
                    const value = colObj.valueGetter ? colObj.valueGetter(row.original) : getValue();
                    const Renderer = columnRenderers[id];
                    return Renderer ? <Renderer value={value} data={row.original} /> : value != null ? String(value) : '';
                },
            };
        });
        if (!allowEditing && !allowDelete && !onAddUsers) return dataCols;
        return [
            ...dataCols,
            {
                id: 'actions',
                header: gridLabels.actionsHeader,
                enableSorting: false,
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <div className="grid-actions">
                            {allowEditing && (
                                <button
                                    type="button"
                                    onClick={() => onEditRow?.(r)}
                                    className="icon-btn"
                                    aria-label={gridLabels.edit}
                                    title={gridLabels.edit}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 21l3.75-1 11.1-11.1a1.5 1.5 0 000-2.12L14.23 2.16a1.5 1.5 0 00-2.12 0L1 13.27V17h3.73L3 21z"
                                            fill="#111827"
                                        />
                                    </svg>
                                </button>
                            )}
                            {onAddUsers && (
                                <button
                                    type="button"
                                    onClick={() => onAddUsers?.(r)}
                                    className="icon-btn"
                                    aria-label={gridLabels.add}
                                    title={gridLabels.add}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                                            fill="#0891b2"
                                        />
                                    </svg>
                                </button>
                            )}
                            {allowDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDeleteRow?.(r)}
                                    className="icon-btn danger"
                                    aria-label={gridLabels.delete}
                                    title={gridLabels.delete}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9z" fill="#DC2626" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ];
    }, [columns, columnRenderers, rows, allowEditing, allowDelete, onEditRow, onDeleteRow, onAddUsers, gridLabels]);

    const table = useReactTable({
        data: rows,
        columns: cols,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize } },
    });

    return (
        <div className="grid-wrapper" style={{ width: '100%', height, overflowX: 'auto' }}>
            <table className="data-grid-table">
                <thead>
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((h) => (
                                <th key={h.id} onClick={h.column.getToggleSortingHandler()} className={h.column.getCanSort() ? 'sortable' : ''}>
                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                    {h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} onClick={() => onRowClick?.(row.original)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {table.getPageCount() > 1 && (
                <div className="grid-pagination">
                    <button type="button" className="btn-page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        {gridLabels.previous}
                    </button>
                    <span>
                        {gridLabels.page} {table.getState().pagination.pageIndex + 1} {gridLabels.of} {table.getPageCount()}
                    </span>
                    <button type="button" className="btn-page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        {gridLabels.next}
                    </button>
                </div>
            )}
        </div>
    );
}
