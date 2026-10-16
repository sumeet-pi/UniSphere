import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ImagePlus, Info } from 'lucide-react';

export function CreateEvent() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      navigate('/teacher');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-500">Fill in the details to publish a new event</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/teacher')}>Cancel</Button>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3">
          <Info className="w-5 h-5 text-green-600" />
          Event created successfully! Redirecting...
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
              <Input label="Event Title" placeholder="e.g. Hackathon 2026" required />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  rows="4" 
                  placeholder="Describe your event..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Technical</option>
                    <option>Workshop</option>
                    <option>Cultural</option>
                    <option>Seminar</option>
                  </select>
                </div>
                <Input label="Maximum Participants" type="number" placeholder="e.g. 100" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Date & Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Event Date" type="date" required />
                <Input label="Venue" placeholder="e.g. Main Lab 3" required />
                <Input label="Start Time" type="time" required />
                <Input label="End Time" type="time" required />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Requirements & Media</h2>
              <Input label="Eligibility" placeholder="e.g. Open to all CSE students" />
              <Input label="Rules (Comma separated)" placeholder="e.g. Teams of 2-4, Bring laptops" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Banner</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="space-y-1 text-center">
                    <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative font-medium text-blue-600 hover:text-blue-500">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button">Save as Draft</Button>
          <Button type="submit">Publish Event</Button>
        </div>
      </form>
    </div>
  );
}
