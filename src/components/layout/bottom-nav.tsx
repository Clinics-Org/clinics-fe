import { Sheet } from '@/components/ui/sheet';
import { useModal } from '@/hooks/use-modal';
import { cn } from '@/lib/utils';
import EllipsisIcon from 'lucide-react/dist/esm/icons/ellipsis';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navItems } from './sidebar';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const moreSheetState = useModal();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const mobileItems = navItems.filter(({ showInTabs }) => showInTabs);
  const moreItems = navItems.filter(({ showInTabs }) => !showInTabs);

  const isMoreActive = moreItems.some((item) => isActive(item.path));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary-foreground shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                {
                  'text-primary': isActive(item.path),
                  'text-gray-500 hover:text-primary': !isActive(item.path),
                },
              )}
            >
              <div
                className={cn('flex items-center justify-center mb-1', {
                  'text-primary': isActive(item.path),
                })}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium text-center">
                {item.name}
              </span>
            </Link>
          ))}

          <button
            onClick={() => moreSheetState.open()}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              {
                'text-primary': isMoreActive,
                'text-gray-500 hover:text-primary': !isMoreActive,
              },
            )}
          >
            <div
              className={cn('flex items-center justify-center mb-1', {
                'text-primary': isMoreActive,
              })}
            >
              <EllipsisIcon className="size-4" />
            </div>
            <span className="text-xs font-medium text-center">More</span>
          </button>
        </div>
      </nav>

      <Sheet.Root
        open={moreSheetState.isOpen}
        onOpenChange={moreSheetState.toggle}
      >
        <Sheet.Popup
          side="bottom"
          showCloseButton={false}
          className="rounded-tr-2xl rounded-tl-2xl h-56"
        >
          <Sheet.Header>
            <Sheet.Title>More</Sheet.Title>
          </Sheet.Header>
          <nav className="px-4 pb-6 space-y-1">
            {moreItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  moreSheetState.close();
                  navigate(item.path);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',

                  {
                    'bg-primary/20 text-primary': isActive(item.path),
                    'text-gray-700 hover:bg-primary/10 hover:text-primary':
                      !isActive(item.path),
                  },
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </Sheet.Popup>
      </Sheet.Root>
    </>
  );
}
