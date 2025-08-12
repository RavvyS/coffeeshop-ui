// src/components/Queue/QueueManager.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, Users, Coffee, CheckCircle, XCircle,
  MapPin, Smartphone, Bell, Calendar
} from "lucide-react";
import { useVirtualQueue } from "@/hooks/useAdvancedFeatures";
import { toast } from "@/hooks/use-toast";

interface QueueManagerProps {
  customerId?: string;
  orderId?: string;
}

export const QueueManager = ({ customerId, orderId }: QueueManagerProps) => {
  const { 
    queueStatus, 
    isInQueue, 
    isLoading, 
    joinQueue, 
    updateQueueStatus, 
    leaveQueue 
  } = useVirtualQueue();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
        });
      }
    }
  }, []);

  // Send notification when order is ready
  useEffect(() => {
    if (queueStatus?.status === 'ready' && notificationsEnabled) {
      new Notification('☕ Your order is ready!', {
        body: 'Please come to the counter to pick up your order.',
        icon: '/favicon.ico'
      });
    }
  }, [queueStatus?.status, notificationsEnabled]);

  const handleJoinQueue = () => {
    if (!customerId) {
      toast({
        title: "Customer ID Required",
        description: "Please provide customer information to join queue",
        variant: "destructive",
      });
      return;
    }
    joinQueue(customerId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Waiting in Queue';
      case 'preparing':
        return 'Order Being Prepared';
      case 'ready':
        return 'Ready for Pickup';
      case 'completed':
        return 'Order Completed';
      default:
        return 'Unknown Status';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!isInQueue) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Virtual Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <Coffee className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">Join the Virtual Queue</h3>
              <p className="text-muted-foreground">
                Skip the wait! Join our virtual queue and get notified when your order is ready.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span>SMS & Push notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Location-based alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <span>Mobile-friendly</span>
              </div>
            </div>

            <Button 
              onClick={handleJoinQueue} 
              disabled={isLoading || !customerId}
              className="w-full"
            >
              {isLoading ? 'Joining...' : 'Join Queue'}
            </Button>

            {!customerId && (
              <p className="text-xs text-muted-foreground">
                Customer information required to join queue
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Queue Status */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Queue Status
            </div>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(queueStatus?.status || 'waiting')} text-white border-none`}
            >
              {getStatusText(queueStatus?.status || 'waiting')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queueStatus && (
            <div className="space-y-6">
              {/* Position and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">#{queueStatus.position}</div>
                  <p className="text-sm text-muted-foreground">Your position</p>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {formatTime(queueStatus.estimatedWaitTime)}
                  </div>
                  <p className="text-sm text-muted-foreground">Est. wait time</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Queue Progress</span>
                  <span>{queueStatus.totalInQueue - queueStatus.position + 1} of {queueStatus.totalInQueue}</span>
                </div>
                <Progress 
                  value={((queueStatus.totalInQueue - queueStatus.position + 1) / queueStatus.totalInQueue) * 100}
                  className="h-2"
                />
              </div>

              {/* Order Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order Type:</span>
                <Badge variant="secondary" className="capitalize">
                  {queueStatus.orderType}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={updateQueueStatus}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={leaveQueue}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Leave Queue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Notifications */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when your order is ready
                </p>
              </div>
              <Badge variant={notificationsEnabled ? "default" : "secondary"}>
                {notificationsEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {!notificationsEnabled && (
              <Button 
                variant="outline" 
                onClick={() => {
                  Notification.requestPermission().then(permission => {
                    setNotificationsEnabled(permission === 'granted');
                    if (permission === 'granted') {
                      toast({
                        title: "Notifications Enabled",
                        description: "You'll be notified when your order is ready",
                      });
                    }
                  });
                }}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>5 minutes before ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>When order is ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Pickup reminders</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Tips */}
      {queueStatus?.status === 'waiting' && (
        <Card className="border-border/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Coffee className="h-4 w-4 text-primary" />
              While You Wait
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Browse our seasonal menu items</p>
              <p>• Book a future coffee meeting</p>
              <p>• Try our emotional support chat</p>
              <p>• Explore loyalty program benefits</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// QueueDashboard for staff management
export const QueueDashboard = () => {
  const [queueData, setQueueData] = useState({
    totalInQueue: 12,
    averageWaitTime: 8,
    currentlyPreparing: 3,
    readyForPickup: 2
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{queueData.totalInQueue}</div>
            <p className="text-sm text-muted-foreground">Total in Queue</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">{queueData.averageWaitTime}m</div>
            <p className="text-sm text-muted-foreground">Avg Wait Time</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{queueData.currentlyPreparing}</div>
            <p className="text-sm text-muted-foreground">Preparing</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{queueData.readyForPickup}</div>
            <p className="text-sm text-muted-foreground">Ready</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Queue Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Staff queue management interface would go here.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Features: Update order status, manage wait times, send notifications, view customer details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};