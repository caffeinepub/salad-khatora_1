import { ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '../hooks/useNotifications';
import { AlertTriangle, Calendar, X } from 'lucide-react';

interface NotificationPanelProps {
  children: ReactNode;
}

export function NotificationPanel({ children }: NotificationPanelProps) {
  const { notifications, markAsRead, dismiss } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Badge variant="secondary">{notifications.length}</Badge>
          </div>

          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border p-3 ${notification.read ? 'bg-muted/50' : 'bg-background'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2">
                        {notification.type === 'low-stock' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                        ) : (
                          <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => dismiss(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
