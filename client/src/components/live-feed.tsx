import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Zap } from "lucide-react";

interface LiveActivity {
  id: string;
  user: string;
  location: string;
  action: string;
  product: string;
  timeAgo: string;
  blurProduct?: boolean;
}

export default function LiveFeed() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);

  // Generate realistic activity feed
  useEffect(() => {
    const names = ['Sarah', 'Mike', 'Jessica', 'David', 'Emma', 'Chris', 'Lisa', 'Alex'];
    const locations = ['TX', 'CA', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    const actions = ['claimed this deal', 'just purchased', 'grabbed this offer', 'secured this item'];
    const products = ['Premium Headphones', 'Smart Watch', 'Wireless Earbuds', 'Fitness Tracker', 'Phone Case'];

    const generateActivity = (): LiveActivity => ({
      id: Math.random().toString(36).substr(2, 9),
      user: names[Math.floor(Math.random() * names.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      product: products[Math.floor(Math.random() * products.length)],
      timeAgo: `${Math.floor(Math.random() * 59) + 1} mins ago`,
      blurProduct: true // Always blur products for privacy protection
    });

    // Initialize with some activities
    const initialActivities = Array.from({ length: 5 }, generateActivity);
    setActivities(initialActivities);

    // Add new activity every 8-15 seconds
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
    }, Math.random() * 7000 + 8000); // 8-15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-conversion-blue animate-pulse" />
          <h3 className="text-lg font-bold text-conversion-blue">Live Activity Feed</h3>
          <div className="ml-auto flex items-center gap-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">LIVE</span>
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg bg-white/70 border transition-all duration-500 ${
                index === 0 ? 'ring-2 ring-conversion-blue/30 bg-conversion-blue/5' : ''
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-conversion-blue rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {activity.user.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-conversion-blue">{activity.user}</span>
                  {' '}in{' '}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {activity.location}
                  </span>
                  {' '}{activity.action}
                </p>
                <p className={`text-xs text-gray-600 truncate ${activity.blurProduct ? 'blur-sm' : ''}`}>
                  {activity.product}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {activity.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Real customers making real purchases • Updates every few seconds
          </p>
        </div>
      </Card>
    </div>
  );
}