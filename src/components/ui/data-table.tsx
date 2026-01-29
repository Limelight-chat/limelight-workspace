'use client'

import React, { useState } from 'react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    maxHeight?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    maxHeight = 'max-h-[600px]',
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 200, // Default rows per page as requested (100-500 ish)
            },
        },
        state: {
            sorting,
        },
    })

    return (
        <div className="bg-[#131313] rounded-2xl overflow-hidden border border-[#232222]">
            <div className={`overflow-x-auto ${maxHeight} overflow-y-auto`}>
                <table className="w-full text-sm">
                    <thead className="border-b border-[#232222] sticky top-0 bg-[#1a1919] z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <th
                                            key={header.id}
                                            className="text-left px-4 py-3.5 text-slate-400 font-medium whitespace-nowrap"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? 'flex items-center gap-2 cursor-pointer select-none group hover:text-slate-200 transition-colors'
                                                            : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: <ArrowUp className="w-3.5 h-3.5 text-orange-500" />,
                                                        desc: <ArrowDown className="w-3.5 h-3.5 text-orange-500" />,
                                                    }[header.column.getIsSorted() as string] ?? (
                                                            header.column.getCanSort() ? (
                                                                <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            ) : null
                                                        )}
                                                </div>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-[#232222]/50">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="even:bg-[#1a1919]/50 hover:bg-[#1f1e1e] transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-4 py-3 text-slate-300 whitespace-nowrap"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="h-24 text-center text-slate-500"
                                >
                                    No results.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-[#1a1919] border-t border-[#232222] px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span>
                        {table.getFilteredRowModel().rows.length} row{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} loaded
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="flex items-center gap-1">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">Rows per page:</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value))
                            }}
                            className="bg-[#232222] border border-[#2e2d2d] rounded px-1 py-0.5 text-slate-300 text-xs focus:outline-hidden cursor-pointer"
                        >
                            {[100, 200, 500].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                            <option value={data.length}>All</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            className="p-1 rounded-md hover:bg-[#232222] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                            className="p-1 rounded-md hover:bg-[#232222] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
