'use client';
import { useState } from 'react';
import { useTaskStore } from '@/store/tasks';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Download } from 'lucide-react';
import { DataTable } from '@/components/tasks/data-table';
import { columns } from '@/components/tasks/columns';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { BulkUploadDialog } from '@/components/tasks/bulk-upload-dialog';
import { exportToCsv } from '@/lib/utils';
import { Task } from '@/types';

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isBulkUploadOpen, setBulkUploadOpen] = useState(false);

  const handleExport = () => {
    const dataToExport = tasks.map(t => ({
      ...t,
      subtasks: t.subtasks ? t.subtasks.map(st => st.title).join(' | ') : '',
      createdAt: new Date(t.createdAt).toLocaleDateString(),
      completedAt: t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '',
    }));
    exportToCsv(dataToExport, `taskwise-ai-export-${new Date().toISOString().split('T')[0]}.csv`);
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Header
          title="All Tasks"
          description="View, manage, and organize all your tasks in one place."
        >
          <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </Header>
        <DataTable data={tasks} columns={columns} />
      </div>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
      />
    </>
  );
}
