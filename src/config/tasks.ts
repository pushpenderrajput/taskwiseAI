import {
  Circle,
  Clock,
  CheckCircle2,
  SignalLow,
  SignalMedium,
  ChevronsUp,
} from 'lucide-react';

export const statuses = [
  {
    value: 'To-Do',
    label: 'To-Do',
    icon: Circle,
    className: 'bg-muted/50 text-muted-foreground border-muted-foreground/20',
  },
  {
    value: 'In Progress',
    label: 'In Progress',
    icon: Clock,
    className: 'bg-primary/20 text-primary border-primary/20',
  },
  {
    value: 'Completed',
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-chart-2/20 text-chart-2 border-chart-2/20',
  },
];

export const priorities = [
  {
    value: 'Low',
    label: 'Low',
    icon: SignalLow,
    className: 'bg-chart-2/20 text-chart-2 border-chart-2/20',
  },
  {
    value: 'Medium',
    label: 'Medium',
    icon: SignalMedium,
    className: 'bg-chart-4/20 text-chart-4 border-chart-4/20',
  },
  {
    value: 'High',
    label: 'High',
    icon: ChevronsUp,
    className: 'bg-destructive/20 text-destructive border-destructive/20',
  },
];
