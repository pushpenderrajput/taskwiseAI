import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between space-y-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">{children}</div>
    </header>
  );
}
