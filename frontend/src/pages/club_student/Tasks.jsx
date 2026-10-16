import React from 'react';
import { studentTasks } from '../../data/mockData';
import { Card, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { CheckSquare } from 'lucide-react';

export function Tasks() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500">Your assigned responsibilities for the club</p>
      </div>

      <div className="space-y-4">
        {studentTasks.map(task => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={task.status === 'completed'} 
                  readOnly
                  className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Assigned by: Dr. Sharma</p>
                </div>
              </div>
              <Badge variant={task.status === 'completed' ? 'green' : 'yellow'}>
                {task.status === 'completed' ? 'Completed' : 'Pending'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {studentTasks.filter(t => t.status === 'pending').length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg mb-2">All Caught Up!</h3>
          <p className="text-gray-500">You have completed all your assigned tasks.</p>
        </div>
      )}
    </div>
  );
}
