'use client';

import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table';
import { Button } from '@/components/ui/button';
import { X, Circle, Clock, CheckCircle2, SignalLow, SignalMedium, ChevronsUp, PlusCircle } from 'lucide-react';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const statuses = [
    { value: 'To-Do', label: 'To-Do', icon: Circle },
    { value: 'In Progress', label: 'In Progress', icon: Clock },
    { value: 'Completed', label: 'Completed', icon: CheckCircle2 },
  ];
  
  const priorities = [
    { value: 'Low', label: 'Low', icon: SignalLow },
    { value: 'Medium', label: 'Medium', icon: SignalMedium },
    { value: 'High', label: 'High', icon: ChevronsUp },
  ];

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: any
    title?: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }
  
  export function DataTableFacetedFilter<TData, TValue>({
    column,
    title,
    options,
  }: DataTableFacetedFilterProps<TData, TValue>) {
    const facets = column?.getFacetedUniqueValues()
    const selectedValues = new Set(column?.getFilterValue() as string[])
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <PlusCircle className="mr-2 h-4 w-4" />
            {title}
            {selectedValues?.size > 0 && (
              <>
                <div className="mx-2 h-4 w-px bg-border" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value)
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isSelected}
                onCheckedChange={() => {
                  if (isSelected) {
                    selectedValues.delete(option.value)
                  } else {
                    selectedValues.add(option.value)
                  }
                  const filterValues = Array.from(selectedValues)
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined
                  )
                }}
              >
                {option.icon && (
                  <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span>{option.label}</span>
                {facets?.get(option.value) && (
                  <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                    {facets.get(option.value)}
                  </span>
                )}
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  