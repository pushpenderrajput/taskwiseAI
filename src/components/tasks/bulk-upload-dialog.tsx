'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import { useTaskStore } from '@/store/tasks';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkUploadDialog({ open, onOpenChange }: BulkUploadDialogProps) {
  const { addBulkTasks } = useTaskStore();
  const { toast } = useToast();
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setCsvData('');
    onOpenChange(false);
  };

  const processCsv = (data: string) => {
    setIsLoading(true);
    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newTasks: Task[] = results.data
          .map((item: any) => ({
            id: `TASK-${Math.floor(Math.random() * 9000) + 1000}`,
            title: item.title || 'Untitled Task',
            description: item.description || '',
            status: ['To-Do', 'In Progress', 'Completed'].includes(item.status) ? item.status : 'To-Do',
            priority: ['Low', 'Medium', 'High'].includes(item.priority) ? item.priority : 'Medium',
            createdAt: new Date().toISOString(),
          }))
          .filter((task) => task.title !== 'Untitled Task');

        if (newTasks.length > 0) {
          addBulkTasks(newTasks);
          toast({
            title: 'Bulk Upload Successful',
            description: `${newTasks.length} tasks have been added.`,
          });
        } else {
            toast({
                variant: 'destructive',
                title: 'Bulk Upload Failed',
                description: 'No valid tasks found. Make sure you have a "title" column in your CSV.',
            });
        }
        setIsLoading(false);
        handleClose();
      },
      error: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Parsing Error',
          description: error.message,
        });
        setIsLoading(false);
      },
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (csvData) {
        processCsv(csvData);
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Tasks</DialogTitle>
          <DialogDescription>
            Paste CSV data below or upload a CSV file. The file must contain a 'title' column. Optional columns: 'description', 'status', 'priority'.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload} />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="csv-text">Paste CSV Data</Label>
                <Textarea
                    id="csv-text"
                    placeholder="title,description,status,priority&#10;My first task,Details here,To-Do,High"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={8}
                />
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !csvData}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
