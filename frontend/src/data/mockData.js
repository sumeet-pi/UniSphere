export const clubs = [
  {
    id: 'c1',
    name: 'Byte Warriors',
    category: 'Computer Science',
    description: 'The official coding and technology club of the CSE Department. We organize hackathons, coding contests, and tech talks.',
    memberCount: 128,
    facultyHead: 'Dr. Sharma',
    upcomingEventsCount: 6,
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors&backgroundColor=0a5c36,18181b',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
    coreTeam: [
      { id: 'u2', name: 'Aarav Kumar', role: 'Student Coordinator', year: '3rd Year', department: 'CSE' },
      { id: 'u3', name: 'Priya Singh', role: 'Technical Lead', year: '3rd Year', department: 'CSE' },
      { id: 'u4', name: 'Rahul Verma', role: 'Event Manager', year: '2nd Year', department: 'CSE' },
    ]
  },
  {
    id: 'c2',
    name: 'Robotics Society',
    category: 'Engineering',
    description: 'Building the future, one robot at a time. Join us for hands-on hardware projects and robotics competitions.',
    memberCount: 85,
    facultyHead: 'Prof. Mehta',
    upcomingEventsCount: 2,
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Robotics&backgroundColor=b91c1c,18181b',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000',
    coreTeam: []
  },
  {
    id: 'c3',
    name: 'Literary Club',
    category: 'Arts & Culture',
    description: 'A community for writers, readers, and poets. We host open mics, debates, and literature festivals.',
    memberCount: 112,
    facultyHead: 'Dr. Iyer',
    upcomingEventsCount: 1,
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Literary&backgroundColor=4338ca,18181b',
    banner: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1000',
    coreTeam: []
  },
  {
    id: 'c4',
    name: 'E-Cell',
    category: 'Entrepreneurship',
    description: 'Fostering the spirit of entrepreneurship. Get mentorship, pitch ideas, and build startups.',
    memberCount: 205,
    facultyHead: 'Prof. Desai',
    upcomingEventsCount: 3,
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ECell&backgroundColor=f59e0b,18181b',
    banner: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1000',
    coreTeam: []
  }
];

export const events = [
  {
    id: 'e1',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'Hackathon 2026',
    date: '2026-09-20',
    time: '09:00 AM - 09:00 PM',
    venue: 'Main Lab 3, CSE Block',
    description: 'A 12-hour coding marathon to solve real-world problems. Great prizes to be won!',
    rules: ['Teams of 2-4 members', 'Bring your own laptops', 'Original code only'],
    eligibility: 'Open to all years and departments',
    capacity: 100,
    registeredCount: 45,
    status: 'Upcoming', // Upcoming, Ongoing, Past, Draft
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'e2',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'Web Development Workshop',
    date: '2026-09-25',
    time: '02:00 PM - 05:00 PM',
    venue: 'Seminar Hall B',
    description: 'Learn the basics of React and Tailwind CSS in this hands-on workshop.',
    rules: ['Laptop required'],
    eligibility: 'Beginners welcome',
    capacity: 60,
    registeredCount: 60,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'e3',
    clubId: 'c2',
    clubName: 'Robotics Society',
    title: 'Line Follower Robot Challenge',
    date: '2026-10-05',
    time: '10:00 AM - 04:00 PM',
    venue: 'College Courtyard',
    description: 'Build and race an autonomous line follower robot.',
    rules: ['Standard kit allowed', 'Max dimensions 15x15cm'],
    eligibility: 'Engineering Students',
    capacity: 40,
    registeredCount: 15,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'e4',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'Debugging Challenge',
    date: '2026-08-15',
    time: '11:00 AM - 01:00 PM',
    venue: 'Online',
    description: 'Find and fix bugs in C++ and Python code snippets.',
    rules: ['Individual participation'],
    eligibility: 'All students',
    capacity: 200,
    registeredCount: 150,
    status: 'Past',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000'
  }
];

export const announcements = [
  {
    id: 'a1',
    clubId: 'c1',
    title: 'Call for Core Team Applications',
    date: '2026-09-10',
    content: 'Byte Warriors is recruiting for the new academic year! Apply now to be part of the core team.'
  },
  {
    id: 'a2',
    clubId: 'c1',
    title: 'Hackathon Registration Closing Soon',
    date: '2026-09-12',
    content: 'Only 5 spots left for Hackathon 2026. Register ASAP!'
  }
];

export const members = [
  { id: 'm1', name: 'M', collegeId: 'CS24001', department: 'CSE', year: '3rd Year', role: 'Student Coordinator', status: 'Active', joinedDate: '2024-08-15' },
  { id: 'm2', name: 'A', collegeId: 'CS24045', department: 'CSE', year: '3rd Year', role: 'Technical Lead', status: 'Active', joinedDate: '2024-08-16' },
  { id: 'm3', name: 'N', collegeId: 'CS25102', department: 'CSE', year: '2nd Year', role: 'Event Manager', status: 'Active', joinedDate: '2025-08-20' },
  { id: 'm4', name: 'J', collegeId: 'IT25011', department: 'IT', year: '2nd Year', role: 'Member', status: 'Active', joinedDate: '2025-09-01' },
  { id: 'm5', name: 'O', collegeId: 'CS26005', department: 'CSE', year: '1st Year', role: 'Member', status: 'Active', joinedDate: '2026-08-25' },
  { id: 'm6', name: 'T', collegeId: 'EC24088', department: 'ECE', year: '3rd Year', role: 'Member', status: 'Active', joinedDate: '2025-01-10' },
];

export const eventRegistrations = [
  { id: 'r1', eventId: 'e1', studentName: 'Neha Sharma', collegeId: 'IT25011', department: 'IT', year: '2nd Year', date: '2026-09-01', status: 'Confirmed' },
  { id: 'r2', eventId: 'e1', studentName: 'Karan Patel', collegeId: 'CS26005', department: 'CSE', year: '1st Year', date: '2026-09-02', status: 'Confirmed' },
  { id: 'r3', eventId: 'e1', studentName: 'Riya Gupta', collegeId: 'EC24088', department: 'ECE', year: '3rd Year', date: '2026-09-05', status: 'Waitlisted' },
];

export const studentTasks = [
  { id: 't1', title: 'Manage Hackathon registrations', status: 'completed' },
  { id: 't2', title: 'Coordinate venue setup with admins', status: 'completed' },
  { id: 't3', title: 'Prepare Hackathon announcement post', status: 'pending' },
  { id: 't4', title: 'Order refreshments for participants', status: 'pending' },
];

// Fictional current users for our roles
export const mockUsers = {
  club_coordinator: {
    id: 'u1',
    name: 'Maan Saab',
    role: 'Club Coordinator',
    clubId: 'c1',
    managedClubId: 'c1',
    clubRole: 'Lead Coordinator (Byte Warriors)'
  },
  general_student: {
    id: 'u5',
    name: 'Vikram Singh',
    role: 'General Student'
  },
  // Backward compatibility aliases
  teacher: {
    id: 'u1',
    name: 'Maan Saab',
    role: 'Club Coordinator',
    clubId: 'c1',
    managedClubId: 'c1',
    clubRole: 'Faculty Club Head'
  },
  club_student: {
    id: 'u2',
    name: 'Maan Saab',
    role: 'Club Coordinator',
    clubId: 'c1',
    managedClubId: 'c1',
    clubRole: 'Student Coordinator'
  }
};
