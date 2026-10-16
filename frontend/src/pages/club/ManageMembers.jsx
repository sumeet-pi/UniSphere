import React, { useState } from 'react';
import { members as initialMembers } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Search, Plus, MoreVertical, X, CheckCircle2, UserCheck, Shield } from 'lucide-react';

export function ManageMembers() {
  const [membersList, setMembersList] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', collegeId: '', department: 'CSE', year: '2nd Year', role: 'Member' });

  const filteredMembers = membersList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.collegeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' ? true : 
                        roleFilter === 'Core Team' ? m.role !== 'Member' : 
                        m.role === 'Member';
    return matchesSearch && matchesRole;
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.collegeId) return;
    const newMemberObj = {
      id: `m${Date.now()}`,
      name: newStudent.name,
      collegeId: newStudent.collegeId,
      department: newStudent.department,
      year: newStudent.year,
      role: newStudent.role,
      status: 'Active',
      joinedDate: '2026-09-13'
    };
    setMembersList([newMemberObj, ...membersList]);
    setNewStudent({ name: '', collegeId: '', department: 'CSE', year: '2nd Year', role: 'Member' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Club Members</h1>
          <p className="text-gray-500">View roster, assign coordinator roles, and approve new member join requests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddModal(true)} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4"/> Add Member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="w-full sm:w-96 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search members by name or college ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="All">All Roles ({membersList.length})</option>
              <option value="Core Team">Core Team / Leads</option>
              <option value="Member">General Members</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">Department & Year</th>
                  <th className="px-6 py-3 font-semibold">Club Role</th>
                  <th className="px-6 py-3 font-semibold">Date Joined</th>
                  <th className="px-6 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{member.collegeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{member.department}</p>
                      <p className="text-xs text-gray-500">{member.year}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={member.role !== 'Member' ? 'blue' : 'gray'}>
                        {member.role !== 'Member' && <Shield className="w-3 h-3 mr-1 inline" />}
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.joinedDate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <UserCheck className="w-3 h-3" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Add Club Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <Input 
                label="Student Full Name" 
                placeholder="e.g. Ananya Sen" 
                value={newStudent.name}
                onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                required 
              />
              <Input 
                label="College ID / Roll Number" 
                placeholder="e.g. CS25099" 
                value={newStudent.collegeId}
                onChange={e => setNewStudent({ ...newStudent, collegeId: e.target.value })}
                required 
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select 
                    value={newStudent.department}
                    onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option>CSE</option>
                    <option>IT</option>
                    <option>ECE</option>
                    <option>ME</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select 
                    value={newStudent.year}
                    onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <select 
                  value={newStudent.role}
                  onChange={e => setNewStudent({ ...newStudent, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Member</option>
                  <option>Student Coordinator</option>
                  <option>Technical Lead</option>
                  <option>Event Manager</option>
                  <option>Content & PR Lead</option>
                </select>
              </div>

              <div className="mt-4 p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-center">
                <p className="text-xs text-blue-800 font-medium mb-1.5">Or have students self-register using the invite code:</p>
                <div className="font-mono font-extrabold text-base text-blue-900 tracking-widest bg-white py-1.5 px-3 rounded-lg border border-blue-200 inline-block shadow-sm">
                  BW-CSE-2026
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Add to Club</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
