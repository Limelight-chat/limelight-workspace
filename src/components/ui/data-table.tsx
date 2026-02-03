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
                pageSize: 10,
            },
        },
        state: {
            sorting,
        },
    })

    // Pagination Logic for "Previous 1 2 ... 9 10 Next"
    const pageIndex = table.getState().pagination.pageIndex
    const pageCount = table.getPageCount()

    // Helper to generate page numbers
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5 // Total numbers to show including ellipsis

        if (pageCount <= maxVisiblePages) {
            for (let i = 0; i < pageCount; i++) {
                pages.push(i)
            }
        } else {
            // Always show first, last, and current window
            if (pageIndex < 3) {
                // Near start: 1 2 3 ... 10
                pages.push(0, 1, 2, 'ellipsis', pageCount - 1)
            } else if (pageIndex > pageCount - 4) {
                // Near end: 1 ... 8 9 10
                pages.push(0, 'ellipsis', pageCount - 3, pageCount - 2, pageCount - 1)
            } else {
                // Middle: 1 ... 4 5 6 ... 10
                pages.push(0, 'ellipsis', pageIndex - 1, pageIndex, pageIndex + 1, 'ellipsis', pageCount - 1)
            }
        }
        return pages
    }

    return (
        <div className="bg-[#131313] rounded-2xl overflow-hidden border border-[#232222] shadow-sm">
            <div className={`overflow-x-auto ${maxHeight} overflow-y-auto`}>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-[#1a1919] border-b border-[#232222] sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <th
                                            key={header.id}
                                            className="px-6 py-4 font-semibold tracking-wide whitespace-nowrap"
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
                    <tbody className="divide-y divide-[#232222]">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="bg-transparent hover:bg-[#1f1e1e] transition-colors group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-4 text-slate-300 whitespace-nowrap font-medium"
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
                                    className="h-32 text-center text-slate-500"
                                >
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-[#131313] border-t border-[#232222] px-6 py-4 flex items-center justify-between">

                {/* Previous Button */}
                <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 bg-transparent border border-[#333] rounded-full hover:bg-[#232222] hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                        page === 'ellipsis' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-slate-600">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => table.setPageIndex(page as number)}
                                className={`
                                    w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all
                                    ${pageIndex === page
                                        ? 'bg-[#232222] text-slate-100 font-bold'
                                        : 'text-slate-500 hover:bg-[#1a1919] hover:text-slate-300'
                                    }
                                `}
                            >
                                {(page as number) + 1}
                            </button>
                        )
                    ))}
                </div>

                {/* Right Side: Next Button + Rows Per Page */}
                <div className="flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 bg-transparent border border-[#333] rounded-full hover:bg-[#232222] hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value))
                        }}
                        className="bg-transparent border border-[#333] rounded-md px-2 py-1 text-slate-400 text-xs focus:outline-hidden hover:border-[#444] cursor-pointer transition-colors"
                    >
                        {[10, 50, 100].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize} / page
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}
