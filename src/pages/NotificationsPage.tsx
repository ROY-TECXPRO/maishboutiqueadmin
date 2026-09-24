import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Smartphone, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotionalOffers: true,
    newArrivals: true,
    flashSales: true,
    smsNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated');
  };

  const notificationTypes = [
    {
      id: 'orderUpdates',
      title: 'Order Updates',
      description: 'Get notified about order status, shipping, and delivery',
      icon: Bell,
      key: 'orderUpdates' as const,
    },
    {
      id: 'promotionalOffers',
      title: 'Promotional Offers',
      description: 'Receive special deals and discount offers',
      icon: Bell,
      key: 'promotionalOffers' as const,
    },
    {
      id: 'newArrivals',
      title: 'New Arrivals',
      description: 'Be the first to know about new products',
      icon: Bell,
      key: 'newArrivals' as const,
    },
    {
      id: 'flashSales',
      title: 'Flash Sales',
      description: 'Get alerts for limited-time flash sales',
      icon: Bell,
      key: 'flashSales' as const,
    },
  ];

  const channelTypes = [
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Receive notifications via text message',
      icon: Smartphone,
      key: 'smsNotifications' as const,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      key: 'emailNotifications' as const,
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      icon: MessageSquare,
      key: 'pushNotifications' as const,
    },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/account')}
              className="touch-target flex items-center justify-center hover:bg-muted rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Notifications</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Notification Types */}
        <div className="mb-8">
          <h2 className="font-semibold mb-4">What to get notified about</h2>
          <div className="space-y-3">
            {notificationTypes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={cn(
                    'w-12 h-6 rounded-full p-1 transition-colors',
                    settings[item.key] ? 'bg-primary' : 'bg-muted'
                  )}
                  aria-label={`Toggle ${item.title} notifications`}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white transition-transform',
                      settings[item.key] && 'translate-x-6'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Channels */}
        <div className="mb-8">
          <h2 className="font-semibold mb-4">How to receive notifications</h2>
          <div className="space-y-3">
            {channelTypes.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <channel.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{channel.title}</p>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(channel.key)}
                  className={cn(
                    'w-12 h-6 rounded-full p-1 transition-colors',
                    settings[channel.key] ? 'bg-primary' : 'bg-muted'
                  )}
                  aria-label={`Toggle ${channel.title}`}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white transition-transform',
                      settings[channel.key] && 'translate-x-6'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekend Sale Notifications Info */}
        <div className="p-4 bg-muted rounded-xl">
          <h3 className="font-medium mb-2">🎉 Weekend Flash Sales</h3>
          <p className="text-sm text-muted-foreground">
            Make sure <strong>Flash Sales</strong> and <strong>Promotional Offers</strong> are enabled to get notified about our weekend deals!
          </p>
        </div>

        {/* Back to Account */}
        <Button 
          variant="outline" 
          className="w-full mt-6"
          onClick={() => navigate('/account')}
        >
          Back to Account
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPage;
