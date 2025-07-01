'use client';
import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/tasks';
import { Task } from '@/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subDays } from 'date-fns';
import { summarizeReport } from '@/ai/flows/summarize-report';
import { Loader2, Wand2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ReportContent = ({
  tasks,
  period,
  startDate,
  endDate,
}: {
  tasks: Task[];
  period: string;
  startDate: Date;
  endDate: Date;
}) => {
  const { toast } = useToast();
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    if (tasks.length === 0) {
      setReportText('No tasks completed in this period.');
      return;
    }

    const periodTitle = period.toUpperCase();
    const formattedStartDate = startDate.toLocaleDateString();
    const formattedEndDate = endDate.toLocaleDateString();

    const tasksByAccount = tasks.reduce((acc, task) => {
      const account = task.title;
      if (!acc[account]) {
        acc[account] = [];
      }
      acc[account].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const accountSummary = Object.entries(tasksByAccount)
      .map(([account, taskItems]) => `- ${account}: ${taskItems.length} task(s)`)
      .join('\n');

    const detailedList = tasks
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .map((task) => {
        const completedDate = new Date(task.completedAt!).toISOString().split('T')[0];
        const description = task.description || 'No description';
        return `- [${completedDate}] ${task.title}: ${description}`;
      })
      .join('\n');

    const text = `ACTIVITY REPORT (${periodTitle})
Period: ${formattedStartDate} - ${formattedEndDate}
========================================

Total Tasks Completed: ${tasks.length}

COMPLETED TASKS BY ACCOUNT:
${accountSummary}

DETAILED LIST:
${detailedList}`;

    setReportText(text);
  }, [tasks, period, startDate, endDate]);

  const handleCopy = () => {
    if (tasks.length > 0) {
      navigator.clipboard.writeText(reportText);
      toast({
        title: 'Report Copied',
        description: 'The report has been copied to your clipboard.',
      });
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Report</CardTitle>
          <CardDescription>
            {period.charAt(0).toUpperCase() + period.slice(1)} report of completed tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No tasks completed in this period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Activity Report</CardTitle>
          <CardDescription>
            {period.charAt(0).toUpperCase() + period.slice(1)} report of completed tasks.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} disabled={tasks.length === 0}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
          {reportText}
        </pre>
      </CardContent>
    </Card>
  );
};

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
        return completedTasks.filter((t) => new Date(t.completedAt!) >= subDays(now, 7));
      case 'monthly':
        return completedTasks.filter((t) => new Date(t.completedAt!) >= subDays(now, 30));
      case 'yearly':
        return completedTasks.filter((t) => new Date(t.completedAt!) >= subDays(now, 365));
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
  };

  const handleSummarize = async () => {
    setSummary('');
    if (tasksForSummary.length === 0) {
      toast({ variant: 'destructive', title: 'No tasks to summarize for this period.' });
      return;
    }

    setIsAiLoading(true);
    const { startDate, endDate } = getPeriodDates(activeTab);

    const reportData = {
      tasks: tasksForSummary.map((t) => ({
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

      <Tabs
        defaultValue="weekly"
        className="space-y-4"
        onValueChange={(value) => {
          setActiveTab(value);
          setSummary('');
        }}
      >
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="space-y-4">
          <ReportContent
            period="weekly"
            tasks={getFilteredTasks('weekly')}
            startDate={getPeriodDates('weekly').startDate}
            endDate={getPeriodDates('weekly').endDate}
          />
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <ReportContent
            period="monthly"
            tasks={getFilteredTasks('monthly')}
            startDate={getPeriodDates('monthly').startDate}
            endDate={getPeriodDates('monthly').endDate}
          />
        </TabsContent>
        <TabsContent value="yearly" className="space-y-4">
          <ReportContent
            period="yearly"
            tasks={getFilteredTasks('yearly')}
            startDate={getPeriodDates('yearly').startDate}
            endDate={getPeriodDates('yearly').endDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
