import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';

export function RevenueChart() {
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');
  const analytics = useSalesAnalytics();

  const data = period === '7days' ? analytics.dailyTrend : analytics.monthlyTrend;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trend
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7days')}
              className={period === '7days' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              7 Days
            </Button>
            <Button
              variant={period === '30days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30days')}
              className={period === '30days' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              30 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.revenue === 0) ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No revenue data for this period</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-2 h-64">
              {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-colors relative group"
                      style={{
                        height: `${(item.revenue / maxRevenue) * 100}%`,
                        minHeight: item.revenue > 0 ? '4px' : '0',
                      }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ₹{item.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '10px' }}>
                    {item.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
