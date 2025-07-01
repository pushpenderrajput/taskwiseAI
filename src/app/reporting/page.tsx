'use client';
import { useState } from 'react';
import { useTaskStore } from '@/store/tasks';
import { Task } from '@/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subDays } from 'date-fns';
import { summarizeReport } from '@/ai/flows/summarize-report';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ReportingPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');

  const now = new Date();
  const completedTasks = tasks.filter((t) => t.status === 'Completed' && t.completedAt);

  const getFilteredTasks = (period: string): Task[] => {
    switch (period) {
      case 'weekly':
        return completedTasks.filter(t => new Date(t.completedAt!) >= subDays(now, 7));
      case 'monthly':
        return completedTasks.filter(t => new Date(t.completedAt!) >= subDays(now, 30));
      case 'yearly':
        return completedTasks.filter(t => new Date(t.completedAt!) >= subDays(now, 365));
      default:
        return [];
    }
  };

  const tasksForSummary = getFilteredTasks(activeTab);

  const getPeriodDates = (period: string) => {
    const endDate = now;
    let startDate: Date;
    switch (period) {
      case 'weekly':
        startDate = subDays(now, 7);
        break;
      case 'monthly':
        startDate = subDays(now, 30);
        break;
      case 'yearly':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = now;
    }
    return { startDate, endDate };
  }

  const handleSummarize = async () => {
    setSummary('');
    if (tasksForSummary.length === 0) {
      toast({ variant: 'destructive', title: 'No tasks to summarize for this period.' });
      return;
    }

    setIsAiLoading(true);
    const { startDate, endDate } = getPeriodDates(activeTab);

    const reportData = {
      tasks: tasksForSummary.map(t => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        completedAt: new Date(t.completedAt!).toISOString(),
      })),
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
    };
    
    try {
      const result = await summarizeReport(reportData);
      setSummary(result.summary);
      toast({ title: 'Summary Generated', description: 'AI has summarized the report for you.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to generate summary.' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const ReportContent = ({ period }: { period: string }) => {
    const filteredTasks = getFilteredTasks(period);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Completed Tasks</CardTitle>
          <CardDescription>
            {filteredTasks.length} task{filteredTasks.length !== 1 && 's'} completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <ul className="space-y-4">
              {filteredTasks.map((task) => (
                <li key={task.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="font-semibold">{task.title}</p>
                  {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Completed on: {new Date(task.completedAt!).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No tasks completed in this period.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Header
        title="Reporting"
        description="Generate reports and get AI-powered insights."
      >
        <Button onClick={handleSummarize} disabled={isAiLoading || tasksForSummary.length === 0}>
          {isAiLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Summarize with AI
        </Button>
      </Header>

      {summary && (
        <Alert>
          <Wand2 className="h-4 w-4" />
          <AlertTitle>AI Summary</AlertTitle>
          <AlertDescription>
            <div>
              {summary.split('\n').map((line, i) => (
                <div key={i} className={line.trim() === '' ? 'h-2' : ''}>
                  {line.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="weekly" className="space-y-4" onValueChange={(value) => {
        setActiveTab(value);
        setSummary('');
      }}>
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="space-y-4">
          <ReportContent period="weekly" />
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <ReportContent period="monthly" />
        </TabsContent>
        <TabsContent value="yearly" className="space-y-4">
          <ReportContent period="yearly" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
