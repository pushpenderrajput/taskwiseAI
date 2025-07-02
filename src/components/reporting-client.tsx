'use client';
import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { summarizeReport } from '@/ai/flows/summarize-report';
import { Loader2, Wand2, Copy, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
      .sort(
        (a, b) =>
          new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()
      )
      .map((task) => {
        const completedDate = new Date(task.completedAt!)
          .toISOString()
          .split('T')[0];
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No tasks completed in this period.
          </p>
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
            {period.charAt(0).toUpperCase() + period.slice(1)} report of completed
            tasks.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={tasks.length === 0}
        >
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

interface ReportingClientProps {
    allTasks: Task[];
}

export function ReportingClient({ allTasks }: ReportingClientProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedManager, setSelectedManager] = useState('all');

  const accountManagers = [
    'all',
    ...Array.from(
      new Set(allTasks.filter((t) => t.accountManager).map((t) => t.accountManager!))
    ),
  ];


  useEffect(() => {
    if (dateRange?.from) {
      setActiveTab('');
      setSummary('');
    }
  }, [dateRange]);

  const completedTasks = allTasks.filter(
    (t) => t.status === 'Completed' && t.completedAt
  );

  const getFilteredTasks = (period: string, range?: DateRange): Task[] => {
    const now = new Date();
    let dateFilteredTasks: Task[];

    if (range?.from) {
      const from = startOfDay(range.from);
      const to = range.to ? endOfDay(range.to) : endOfDay(range.from);
      dateFilteredTasks = completedTasks.filter((t) => {
        const completedDate = new Date(t.completedAt!);
        return completedDate >= from && completedDate <= to;
      });
    } else {
      switch (period) {
        case 'daily':
          dateFilteredTasks = completedTasks.filter(
            (t) => new Date(t.completedAt!) >= subDays(now, 1)
          );
          break;
        case 'weekly':
          dateFilteredTasks = completedTasks.filter(
            (t) => new Date(t.completedAt!) >= subDays(now, 7)
          );
          break;
        case 'monthly':
          dateFilteredTasks = completedTasks.filter(
            (t) => new Date(t.completedAt!) >= subDays(now, 30)
          );
          break;
        case 'yearly':
          dateFilteredTasks = completedTasks.filter(
            (t) => new Date(t.completedAt!) >= subDays(now, 365)
          );
          break;
        default:
          dateFilteredTasks = [];
      }
    }
    
    if (selectedManager === 'all') {
      return dateFilteredTasks;
    }
    return dateFilteredTasks.filter((t) => t.accountManager === selectedManager);
  };

  const tasksForSummary = getFilteredTasks(activeTab, dateRange);

  const getPeriodDates = (period: string, range?: DateRange) => {
    const now = new Date();
    if (range?.from) {
      return { startDate: range.from, endDate: range.to || range.from };
    }
    let startDate: Date;
    switch (period) {
      case 'daily':
        startDate = subDays(now, 1);
        break;
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
    return { startDate, endDate: now };
  };

  const handleSummarize = async () => {
    setSummary('');
    if (tasksForSummary.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No tasks to summarize for this period.',
      });
      return;
    }

    setIsAiLoading(true);
    const { startDate, endDate } = getPeriodDates(activeTab, dateRange);

    const reportData = {
      tasks: tasksForSummary.map((t) => ({
        title: t.title,
        description: t.description,
        accountManager: t.accountManager,
        priority: t.priority,
        completedAt: new Date(t.completedAt!).toISOString(),
      })),
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      accountManager: selectedManager !== 'all' ? selectedManager : undefined,
    };

    try {
      const result = await summarizeReport(reportData);
      setSummary(result.summary);
      toast({
        title: 'Summary Generated',
        description: 'AI has summarized the report for you.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate summary.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const getDisplayPeriod = () => {
    if (dateRange?.from) {
      return 'Custom Range';
    }
    return activeTab;
  }

  const { startDate, endDate } = getPeriodDates(activeTab, dateRange);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Header
        title="Reporting"
        description="Generate reports and get AI-powered insights."
      >
        <Button
          onClick={handleSummarize}
          disabled={isAiLoading || tasksForSummary.length === 0}
        >
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
                    j % 2 === 1 ? (
                      <strong key={j}>{part}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <Tabs
          value={activeTab}
          className="space-y-4"
          onValueChange={(value) => {
            setActiveTab(value);
            setDateRange(undefined);
            setSummary('');
          }}
        >
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-[260px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select
          value={selectedManager}
          onValueChange={(value) => {
            setSelectedManager(value);
            setSummary('');
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Account Manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Managers</SelectItem>
            {accountManagers
              .filter((m) => m !== 'all')
              .map((manager) => (
                <SelectItem key={manager} value={manager}>
                  {manager}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <ReportContent
        period={getDisplayPeriod()}
        tasks={tasksForSummary}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
