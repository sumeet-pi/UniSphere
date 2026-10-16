import React from 'react';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { BarChart3, TrendingUp, Users, Calendar, ArrowUpRight } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Club Analytics</h1>
        <p className="text-gray-500">Track engagement and growth</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Total Reach</p>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">1,245</p>
              <p className="text-sm font-medium text-green-600 flex items-center">
                <ArrowUpRight className="w-4 h-4" /> 18%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Avg. Event Attendance</p>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">86</p>
              <p className="text-sm font-medium text-green-600 flex items-center">
                <ArrowUpRight className="w-4 h-4" /> 5%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">24%</p>
              <p className="text-sm font-medium text-gray-500 flex items-center">
                Flat this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-96 flex flex-col">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Member Growth</h2>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center bg-gray-50 m-6 rounded-xl border border-gray-100 border-dashed">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart Visualization Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-96 flex flex-col">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Event Registrations Overview</h2>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center bg-gray-50 m-6 rounded-xl border border-gray-100 border-dashed">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart Visualization Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
