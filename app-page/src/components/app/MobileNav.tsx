import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from 'diva-ui/components/sheet';
import { navItems, isActive } from '../../nav-items';
import SidebarIcon from '@components/app/SidebarIcon';

interface MobileNavProps {
  currentPath: string;
  isAdmin?: boolean;
}

export default function MobileNav({ currentPath, isAdmin = false }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md p-2 transition-colors md:hidden"
          aria-label="Open navigation menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-border flex h-16 flex-row items-center justify-between border-b px-6">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
              D
            </span>
            Diva App
          </SheetTitle>
          <SheetClose className="ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((section) => {
            const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;
            return (
            <div key={section.section} className="mb-6">
              <h4 className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                {section.section}
              </h4>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isActive(item.href, currentPath);
                  return (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <a
                          href={item.href}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            active
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <SidebarIcon icon={item.icon} />
                          {item.label}
                        </a>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
