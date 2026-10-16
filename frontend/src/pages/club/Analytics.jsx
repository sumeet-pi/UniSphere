import React from 'react';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { BarChart3, TrendingUp, Users, Calendar, ArrowUpRight, Award, Zap } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Club Analytics & Engagement</h1>
        <p className="text-gray-500">Track student turnouts, membership expansion, and event performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Campus Reach</p>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">1,245</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 18%
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Unique student views this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Avg. Attendance</p>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">86</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 5%
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Attendees per physical event</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Total Registrations</p>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">342</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 24%
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Signups across active workshops</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Club Rating</p>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">4.9 / 5</p>
              <p className="text-xs font-semibold text-amber-600">Top Rated</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Based on student feedback</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Semester Attendance Trend</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Hackathon 2026</span>
                  <span>95 / 100 capacity (95%)</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Web3 & Smart Contracts Bootcamp</span>
                  <span>78 / 80 capacity (97%)</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '97%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Algorithmic Problem Solving 101</span>
                  <span>50 / 60 capacity (83%)</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Open Source Contribution Sprint</span>
                  <span>42 / 50 capacity (84%)</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Department Participation Breakdown</h2>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                <p className="text-2xl font-black text-blue-700">62%</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">Computer Science (CSE)</p>
              </div>
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
                <p className="text-2xl font-black text-indigo-700">18%</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">Information Tech (IT)</p>
              </div>
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
                <p className="text-2xl font-black text-purple-700">12%</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">Electronics (ECE)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-2xl font-black text-gray-700">8%</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">Other Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
