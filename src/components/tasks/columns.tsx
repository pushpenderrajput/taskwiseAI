'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from './data-table';
import { DataTableRowActions } from './data-table-row-actions';
import { statuses, priorities } from '@/config/tasks';
import { cn } from '@/lib/utils';

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'id',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Task ID" />
  //   ),
  //   cell: ({ row }) => {
  //     const id = row.getValue('id') as string;
  //     return <div className="w-[80px]">...{id.slice(-6)}</div>;
  //   },
  // },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account/Project" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate font-medium">
            {row.getValue('title')}
          </span>
        </div>
      );
    },
  },
   {
    accessorKey: 'accountManager',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account Manager" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">
            {row.getValue('accountManager') || 'N/A'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      );

      if (!status) {
        return null;
      }

      return (
        <Badge
          variant="outline"
          className={cn('w-[100px] justify-center gap-1.5', status.className)}
        >
          {status.icon && <status.icon className="h-3 w-3" />}
          {status.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      );

      if (!priority) {
        return null;
      }

      return (
        <Badge
          variant="outline"
          className={cn('w-[100px] justify-center gap-1.5', priority.className)}
        >
          {priority.icon && <priority.icon className="h-3 w-3" />}
          {priority.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      return (
        <span>
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: 'completedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Completed At" />
    ),
    cell: ({ row }) => {
      return (
        <span>
          {row.getValue('completedAt')
            ? new Date(row.getValue('completedAt')).toLocaleDateString()
            : 'N/A'}
        </span>

      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
