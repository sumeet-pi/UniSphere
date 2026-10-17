export const clubs = [
  {
    id: 'c1',
    name: 'Byte Warriors',
    category: 'Computer Science',
    description: 'The official coding and technology club of the CSE Department. We organize hackathons, coding contests, and tech talks.',
    memberCount: 128,
    facultyHead: 'Dr. Sharma',
    upcomingEventsCount: 6,
    approvalStatus: 'approved',
    status: 'ACTIVE',
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
    approvalStatus: 'approved',
    status: 'ACTIVE',
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
    approvalStatus: 'approved',
    status: 'ACTIVE',
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
    approvalStatus: 'approved',
    status: 'ACTIVE',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ECell&backgroundColor=f59e0b,18181b',
    banner: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1000',
    coreTeam: []
  },
  {
    id: 'c_pending',
    name: 'FinTech & Blockchain Society',
    category: 'Entrepreneurship',
    description: 'Pioneering decentralized applications, algorithmic trading, and student financial literacy.',
    memberCount: 0,
    facultyHead: 'Dr. Neha Verma',
    upcomingEventsCount: 0,
    approvalStatus: 'requested', // 'requested' | 'approved' | 'rejected'
    status: 'Requested',
    submittedAt: '2026-10-16',
    clubCode: 'FINTECH-2026',
    department: 'Management & Computer Applications',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=FinTech&backgroundColor=0284c7,18181b',
    banner: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1000',
    coreTeam: []
  },
  {
    id: 'c_rejected',
    name: 'Campus Gaming & Esports Union',
    category: 'Arts & Culture',
    description: 'Competitive collegiate esports tournaments, LAN parties, and casual gaming community.',
    memberCount: 0,
    facultyHead: 'Prof. S. K. Gupta',
    upcomingEventsCount: 0,
    approvalStatus: 'rejected',
    rejectionReason: 'Faculty advisor endorsement letter is missing, and campus policy restricts unaccredited video game societies.',
    status: 'Rejected',
    submittedAt: '2026-10-10',
    rejectedAt: '2026-10-14',
    clubCode: 'ESPORTS-2026',
    department: 'Student Affairs',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Gaming&backgroundColor=dc2626,18181b',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
    coreTeam: []
  }
];

export const getStoredClubs = (approvedOnly = true) => {
  const allClubs = clubs.map(club => {
    try {
      const saved = localStorage.getItem(`mockClubProfile_${club.id}`);
      const savedApproval = localStorage.getItem(`mockClubApproval_${club.id}`);
      let approvalStatus = club.approvalStatus;
      let rejectionReason = club.rejectionReason;
      
      if (savedApproval) {
        try {
          const parsedApproval = JSON.parse(savedApproval);
          approvalStatus = parsedApproval.approvalStatus || approvalStatus;
          rejectionReason = parsedApproval.rejectionReason || rejectionReason;
        } catch (e) {
          console.error(e);
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...club,
          ...parsed,
          approvalStatus,
          rejectionReason,
          facultyAdvisor: parsed.facultyAdvisor || parsed.coordinatorTeacher || club.facultyHead || 'Dr. Sharma',
          clubCode: parsed.clubCode || parsed.inviteCode || (club.id === 'c1' ? 'BW-CSE-2026' : `CLUB-${club.id.toUpperCase()}`),
          department: parsed.department || club.department || (club.category === 'Computer Science' ? 'Computer Science & Engineering' : 'Engineering & Applied Sciences')
        };
      }
      return {
        ...club,
        approvalStatus,
        rejectionReason,
        facultyAdvisor: club.facultyHead || 'Faculty In-Charge',
        clubCode: club.id === 'c1' ? 'BW-CSE-2026' : `CLUB-${club.id.toUpperCase()}`,
        department: club.department || (club.category === 'Computer Science' ? 'Computer Science & Engineering' : 'Engineering & Applied Sciences')
      };
    } catch (e) {
      console.error(e);
    }
    return club;
  });

  if (approvedOnly) {
    return allClubs.filter(c => c.approvalStatus === 'approved');
  }
  return allClubs;
};

export const events = [
  {
    id: 'e1',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'Hackathon 2026: Campus Code Sprint',
    date: '2026-09-20',
    time: '09:00 AM - 09:00 PM',
    venue: 'Main Lab 3, CSE Block',
    description: 'A 12-hour coding marathon to solve real-world problems. Great prizes to be won!',
    rules: ['Teams of 2-4 members', 'Bring your own laptops', 'Original code only'],
    eligibility: 'Open to all years and departments',
    capacity: 100,
    registeredCount: 45,
    status: 'Open',
    eventStage: 'open', // 'open', 'upcoming' (not open yet), 'past'
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'e2',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'Full-Stack React & Node Workshop',
    date: '2026-09-25',
    time: '02:00 PM - 05:00 PM',
    venue: 'Seminar Hall B',
    description: 'Learn the fundamentals of modern web development with hands-on live code builds.',
    rules: ['Laptop required', 'Basic JavaScript recommended'],
    eligibility: 'Beginners welcome',
    capacity: 60,
    registeredCount: 38,
    status: 'Open',
    eventStage: 'open',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'e5',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'National CodeStorm 2026',
    date: '2026-11-15',
    time: '10:00 AM - 06:00 PM',
    venue: 'Campus Main Auditorium',
    description: 'UniSphere’s premier competitive programming clash. 4 rounds of algorithmic challenges, live leaderboard, and ₹50,000 cash prizes. Registrations will open on October 25th.',
    rules: ['Solo or duos allowed', 'Languages: C++, Python, Java', 'Plagiarism detection enforced'],
    eligibility: 'Open to all enrolled university students',
    capacity: 250,
    registeredCount: 0,
    status: 'Upcoming',
    eventStage: 'upcoming', // Not open yet
    registrationOpens: 'Oct 25, 2026 • 10:00 AM',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'e4',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'Campus Debugging Championship',
    date: '2026-08-15',
    time: '11:00 AM - 01:00 PM',
    venue: 'Online HackerRank Lab',
    description: 'High-stakes bug hunt across complex C++ and Python codebases. Top performers identified and awarded on Independence Day.',
    rules: ['Individual speed debugging', 'Automated test suite scoring'],
    eligibility: 'All college students',
    capacity: 200,
    registeredCount: 150,
    status: 'Past',
    eventStage: 'past',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
    winners: [
      { rank: '1st Place', name: 'Raghav Bansal', branch: 'CSE 3rd Year', prize: '₹15,000 Trophy & Gold Certificate' },
      { rank: '2nd Place', name: 'Ananya Sharma', branch: 'IT 2nd Year', prize: '₹10,000 Trophy & Silver Certificate' },
      { rank: '3rd Place', name: 'Kabir Sen', branch: 'CSE 1st Year', prize: '₹5,000 Trophy & Bronze Certificate' }
    ]
  },
  {
    id: 'e6',
    clubId: 'c1',
    clubName: 'Byte Warriors',
    title: 'Algorithm Arena 2025',
    date: '2025-11-20',
    time: '02:00 PM - 06:00 PM',
    venue: 'Seminar Hall A',
    description: 'Annual dynamic programming and graph algorithms championship.',
    rules: ['Strict time limit per problem', 'No external libraries'],
    eligibility: 'All B.Tech & BCA students',
    capacity: 120,
    registeredCount: 115,
    status: 'Past',
    eventStage: 'past',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=1000',
    winners: [
      { rank: '1st Place', name: 'Siddharth Varma', branch: 'CSE 4th Year', prize: '₹12,000 + Merit Medal' },
      { rank: '2nd Place', name: 'Megha Roy', branch: 'CSE 3rd Year', prize: '₹8,000 + Merit Medal' },
      { rank: '3rd Place', name: 'Arjun Nair', branch: 'ECE 3rd Year', prize: '₹4,000 + Merit Medal' }
    ]
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
    status: 'Open',
    eventStage: 'open',
    image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=1000'
  }
];

export const announcements = [
  {
    id: 'a1',
    clubId: 'c1',
    title: 'Flagship Campus Hackathon 2026 Problem Tracks Announced',
    category: 'Event Alert',
    priority: 'High',
    audience: 'All Campus Students',
    author: 'Dr. Sharma (Faculty Advisor)',
    date: '2026-10-15',
    content: 'The organizing committee has finalized the 4 tracks: AI & HealthTech, Decentralized Systems, Smart Campus Solutions, and Open Innovation. Mentorship office hours will run daily from 4 PM in Seminar Hall 3.'
  },
  {
    id: 'a2',
    clubId: 'c1',
    title: 'Core Student Leadership Applications Open for Autumn 2026',
    category: 'Recruitment',
    priority: 'Normal',
    audience: 'Club Members Only',
    author: 'Manav Sharma (Student Coordinator)',
    date: '2026-10-12',
    content: 'Byte Warriors is expanding its core execution committee. Roles open for Technical Event Leads, Social & Design PR Coordinators, and Sponsorship Officers. Apply through the club portal before Oct 30.'
  },
  {
    id: 'a3',
    clubId: 'c1',
    title: 'Upcoming Algorithmic Bootcamp: Dynamic Programming Masterclass',
    category: 'Workshop',
    priority: 'Normal',
    audience: 'All Campus Students',
    author: 'Aarav Patel (Technical Lead)',
    date: '2026-10-08',
    content: 'Special 3-day deep-dive covering dynamic programming on trees, bitmask DP, and graph flows in Main Computer Lab 2. Bring your laptops with C++/Python compilers pre-configured.'
  }
];

// Announcement storage helpers
export const getStoredAnnouncements = (clubId = null) => {
  try {
    const saved = localStorage.getItem('mockAnnouncementsData');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return clubId ? parsed.filter(a => (a.clubId || 'c1') === clubId) : parsed;
      }
    }
  } catch (e) {
    console.error('Error reading mockAnnouncementsData:', e);
  }
  const initialized = announcements;
  localStorage.setItem('mockAnnouncementsData', JSON.stringify(initialized));
  return clubId ? initialized.filter(a => (a.clubId || 'c1') === clubId) : initialized;
};

export const addStoredAnnouncement = (newAnnouncement) => {
  try {
    const currentList = getStoredAnnouncements();
    const created = {
      ...newAnnouncement,
      id: newAnnouncement.id || `a_${Date.now()}`,
      clubId: newAnnouncement.clubId || 'c1',
      priority: newAnnouncement.priority || 'Normal',
      category: newAnnouncement.category || 'General Notice',
      audience: newAnnouncement.audience || 'All Campus Students',
      author: newAnnouncement.author || 'Club Coordinator',
      date: newAnnouncement.date || new Date().toISOString().split('T')[0]
    };
    const updatedList = [created, ...currentList];
    localStorage.setItem('mockAnnouncementsData', JSON.stringify(updatedList));
    return created;
  } catch (e) {
    console.error('Error adding announcement:', e);
    return newAnnouncement;
  }
};

export const updateStoredAnnouncement = (announcementId, updates) => {
  try {
    const currentList = getStoredAnnouncements();
    const updatedList = currentList.map(a => a.id === announcementId ? { ...a, ...updates } : a);
    localStorage.setItem('mockAnnouncementsData', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Error updating announcement:', e);
    return [];
  }
};

export const deleteStoredAnnouncement = (announcementId) => {
  try {
    const currentList = getStoredAnnouncements();
    const updatedList = currentList.filter(a => a.id !== announcementId);
    localStorage.setItem('mockAnnouncementsData', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Error deleting announcement:', e);
    return [];
  }
};


export const members = [
  { id: 'm1', clubId: 'c1', name: 'Manav Sharma', collegeId: 'CS24001', email: 'manav.sharma@campus.edu', phone: '+91 98765 43210', department: 'CSE', year: '3rd Year', role: 'Student Coordinator', membership: 'YES', status: 'Active', joinedDate: '2024-08-15' },
  { id: 'm2', clubId: 'c1', name: 'Aarav Patel', collegeId: 'CS24045', email: 'aarav.patel@campus.edu', phone: '+91 98123 45678', department: 'CSE', year: '3rd Year', role: 'Technical Lead', membership: 'YES', status: 'Active', joinedDate: '2024-08-16' },
  { id: 'm3', clubId: 'c1', name: 'Neha Gupta', collegeId: 'CS25102', email: 'neha.gupta@campus.edu', phone: '+91 98345 67890', department: 'CSE', year: '2nd Year', role: 'Event Manager', membership: 'YES', status: 'Active', joinedDate: '2025-08-20' },
  { id: 'm4', clubId: 'c1', name: 'Jatin Verma', collegeId: 'IT25011', email: 'jatin.verma@campus.edu', phone: '+91 98456 78901', department: 'IT', year: '2nd Year', role: 'Member', membership: 'YES', status: 'Active', joinedDate: '2025-09-01' },
  { id: 'm5', clubId: 'c1', name: 'Om Prakash', collegeId: 'CS26005', email: 'om.prakash@campus.edu', phone: '+91 98567 89012', department: 'CSE', year: '1st Year', role: 'Member', membership: 'YES', status: 'Active', joinedDate: '2026-08-25' },
  { id: 'm6', clubId: 'c1', name: 'Tanvi Shah', collegeId: 'EC24088', email: 'tanvi.shah@campus.edu', phone: '+91 98678 90123', department: 'ECE', year: '3rd Year', role: 'Member', membership: 'YES', status: 'Active', joinedDate: '2025-01-10' },
  { id: 'm7', clubId: 'c1', name: 'Rohan Mehta', collegeId: 'CS25022', email: 'rohan.mehta@campus.edu', phone: '+91 98789 01234', department: 'CSE', year: '2nd Year', role: 'Member', membership: 'YES', status: 'Active', joinedDate: '2025-09-15' },
  { id: 'm8', clubId: 'c1', name: 'Ananya Sen', collegeId: 'IT26019', email: 'ananya.sen@campus.edu', phone: '+91 98890 12345', department: 'IT', year: '1st Year', role: 'Member', membership: 'YES', status: 'Active', joinedDate: '2026-09-01' },
  { id: 'm9', clubId: 'c1', name: 'Siddharth Rao', collegeId: 'ME24031', email: 'siddharth.rao@campus.edu', phone: '+91 98901 23456', department: 'ME', year: '3rd Year', role: 'Member', membership: 'YES', status: 'Active', joinedDate: '2025-02-14' },
];

// Member storage helpers
export const getStoredMembers = (clubId = null) => {
  try {
    const saved = localStorage.getItem('mockMembersData');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return clubId ? parsed.filter(m => (m.clubId || 'c1') === clubId) : parsed;
      }
    }
  } catch (e) {
    console.error('Error reading mockMembersData:', e);
  }
  const initialized = members;
  localStorage.setItem('mockMembersData', JSON.stringify(initialized));
  return clubId ? initialized.filter(m => (m.clubId || 'c1') === clubId) : initialized;
};

export const addStoredMember = (newMember) => {
  try {
    const currentList = getStoredMembers();
    const created = {
      ...newMember,
      id: newMember.id || `m_${Date.now()}`,
      clubId: newMember.clubId || 'c1',
      role: newMember.role || 'Member',
      membership: newMember.membership !== undefined ? newMember.membership : 'YES',
      status: newMember.status || 'Active',
      joinedDate: newMember.joinedDate || new Date().toISOString().split('T')[0]
    };
    const updatedList = [created, ...currentList];
    localStorage.setItem('mockMembersData', JSON.stringify(updatedList));
    return created;
  } catch (e) {
    console.error('Error adding member to storage:', e);
    return newMember;
  }
};

export const updateStoredMember = (memberId, updates) => {
  try {
    const currentList = getStoredMembers();
    const updatedList = currentList.map(m => m.id === memberId ? { ...m, ...updates } : m);
    localStorage.setItem('mockMembersData', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Error updating member:', e);
    return [];
  }
};

export const deleteStoredMember = (memberId) => {
  try {
    const currentList = getStoredMembers();
    const updatedList = currentList.filter(m => m.id !== memberId);
    localStorage.setItem('mockMembersData', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Error deleting member:', e);
    return [];
  }
};

// Check if a student is an official member of a club with membership === 'YES'
// If membership is 'YES', the student CANNOT register for events hosted by this club.
export const isStudentClubMember = (clubId, studentCollegeId = null) => {
  if (!studentCollegeId || !clubId) return false;
  const currentMembers = getStoredMembers(clubId);
  const targetId = studentCollegeId.trim().toLowerCase();
  return currentMembers.some(m => 
    m.collegeId && 
    m.collegeId.trim().toLowerCase() === targetId &&
    (m.membership === 'YES' || m.membership === undefined || m.membership === true)
  );
};

// Check if current user is considered an active member of the club
export const isUserClubMember = (clubId, joinedClubIds = [], user = null) => {
  if (!clubId) return false;
  if (Array.isArray(joinedClubIds) && joinedClubIds.includes(clubId)) return true;
  if (user?.clubId === clubId || user?.managedClubId === clubId) return true;
  const userRoll = user?.classRollNo || user?.collegeId || user?.universityRollNo;
  if (userRoll && isStudentClubMember(clubId, userRoll)) return true;
  return false;
};


export const eventRegistrations = [
  { id: 'r1', eventId: 'e1', studentName: 'Neha Sharma', collegeId: 'IT25011', department: 'IT', year: '2nd Year', date: '2026-09-01', status: 'Confirmed' },
  { id: 'r2', eventId: 'e1', studentName: 'Karan Patel', collegeId: 'CS26005', department: 'CSE', year: '1st Year', date: '2026-09-02', status: 'Confirmed' },
  { id: 'r3', eventId: 'e1', studentName: 'Riya Gupta', collegeId: 'EC24088', department: 'ECE', year: '3rd Year', date: '2026-09-05', status: 'Waitlisted' },
];

export const studentTasks = [
  { 
    id: 't1', 
    clubId: 'c1',
    title: 'Submit Auditorium Booking & Audio System Requisition', 
    description: 'Get formal approval stamp from Estate Office for Main Seminar Hall 3 and verify dual projector connectivity.',
    category: 'Logistics',
    priority: 'High',
    assignee: 'Neha Gupta (Event Manager)',
    dueDate: '2026-10-22',
    status: 'completed' 
  },
  { 
    id: 't2', 
    clubId: 'c1',
    title: 'Draft Prize Distribution & Sponsorship Budget Memo', 
    description: 'Itemize trophy costs, certificate printing, and external judges honorarium; forward to HOD for institutional sign-off.',
    category: 'Finance',
    priority: 'High',
    assignee: 'Dr. Sharma (Faculty Advisor)',
    dueDate: '2026-10-24',
    status: 'in_progress' 
  },
  { 
    id: 't3', 
    clubId: 'c1',
    title: 'Publish Campus Hackathon Announcement & Social Teasers', 
    description: 'Design dynamic Instagram carousel and send campus-wide broadcast email through UniSphere portal.',
    category: 'Publicity',
    priority: 'Medium',
    assignee: 'Manav Sharma (Student Coordinator)',
    dueDate: '2026-10-25',
    status: 'in_progress' 
  },
  { 
    id: 't4', 
    clubId: 'c1',
    title: 'Configure HackerRank Problem Arena & Automated Test Suites', 
    description: 'Set up 4 algorithmic challenges with hidden edge test cases and strict time/memory constraints.',
    category: 'Technical',
    priority: 'High',
    assignee: 'Aarav Patel (Technical Lead)',
    dueDate: '2026-10-26',
    status: 'pending' 
  },
  { 
    id: 't5', 
    clubId: 'c1',
    title: 'Arrange Refreshments & High-Tea for Judges & Participants', 
    description: 'Finalize college cafeteria meal coupons and reserve executive hospitality lounge for keynotes.',
    category: 'Logistics',
    priority: 'Low',
    assignee: 'Neha Gupta (Event Manager)',
    dueDate: '2026-10-28',
    status: 'pending' 
  },
  { 
    id: 't6', 
    clubId: 'c1',
    title: 'Institutional Security Gatepass for External Participants', 
    description: 'Submit verified attendee list with college roll numbers to Main Campus Security Gate.',
    category: 'Permissions',
    priority: 'Medium',
    assignee: 'Dr. Sharma (Faculty Advisor)',
    dueDate: '2026-10-27',
    status: 'pending' 
  }
];

// Coordinator Task storage helpers
export const getStoredTasks = (clubId = null) => {
  try {
    const saved = localStorage.getItem('mockCoordinatorTasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return clubId ? parsed.filter(t => (t.clubId || 'c1') === clubId) : parsed;
      }
    }
  } catch (e) {
    console.error('Error reading mockCoordinatorTasks:', e);
  }
  const initialized = studentTasks;
  localStorage.setItem('mockCoordinatorTasks', JSON.stringify(initialized));
  return clubId ? initialized.filter(t => (t.clubId || 'c1') === clubId) : initialized;
};

export const addStoredTask = (newTask) => {
  try {
    const currentList = getStoredTasks();
    const created = {
      ...newTask,
      id: newTask.id || `t_${Date.now()}`,
      clubId: newTask.clubId || 'c1',
      status: newTask.status || 'pending',
      priority: newTask.priority || 'Medium',
      category: newTask.category || 'General',
      dueDate: newTask.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    };
    const updatedList = [created, ...currentList];
    localStorage.setItem('mockCoordinatorTasks', JSON.stringify(updatedList));
    return created;
  } catch (e) {
    console.error('Error adding task:', e);
    return newTask;
  }
};

export const updateStoredTask = (taskId, updates) => {
  try {
    const currentList = getStoredTasks();
    const updatedList = currentList.map(t => t.id === taskId ? { ...t, ...updates } : t);
    localStorage.setItem('mockCoordinatorTasks', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Error updating task:', e);
    return [];
  }
};

export const deleteStoredTask = (taskId) => {
  try {
    const currentList = getStoredTasks();
    const updatedList = currentList.filter(t => t.id !== taskId);
    localStorage.setItem('mockCoordinatorTasks', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Error deleting task:', e);
    return [];
  }
};


// Fictional current users for our roles
export const mockUsers = {
  club_coordinator: {
    id: 'u1',
    name: 'Dr. Sharma',
    role: 'Club Coordinator',
    clubId: 'c1',
    managedClubId: 'c1',
    clubRole: 'Lead Coordinator (Byte Warriors)',
    approvalStatus: 'approved'
  },
  coordinator_approved: {
    id: 'u1',
    name: 'Dr. Sharma',
    role: 'Club Coordinator',
    clubId: 'c1',
    managedClubId: 'c1',
    clubRole: 'Lead Coordinator (Byte Warriors)',
    approvalStatus: 'approved'
  },
  coordinator_requested: {
    id: 'u_pending',
    name: 'Dr. Neha Verma',
    role: 'Club Coordinator',
    clubId: 'c_pending',
    managedClubId: 'c_pending',
    clubRole: 'Faculty Coordinator (FinTech Society)',
    approvalStatus: 'requested'
  },
  coordinator_rejected: {
    id: 'u_rejected',
    name: 'Devansh Roy',
    role: 'Club Coordinator',
    clubId: 'c_rejected',
    managedClubId: 'c_rejected',
    clubRole: 'Lead Coordinator (Campus Gaming Union)',
    approvalStatus: 'rejected',
    rejectionReason: 'Faculty advisor endorsement letter is missing, and campus policy restricts unaccredited video game societies.'
  },
  general_student: {
    id: 'u5',
    name: 'Vikram Singh',
    role: 'General Student',
    email: 'vikram.singh@college.edu',
    phone: '+91 98765 43210',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    sem: '4th Sem',
    year: '2nd Year',
    classRollNo: 'CS24089',
    universityRollNo: '2400100345',
    department: 'Computer Science & Engineering',
    admissionYear: '2024',
    graduatingYear: '2028',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: '2nd Year Computer Science undergraduate passionate about full-stack web engineering, competitive programming, and campus tech communities.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Tailwind CSS', 'Git & GitHub', 'Data Structures'],
    interests: ['Hackathons', 'Web Development', 'Robotics', 'Public Speaking', 'System Design'],
    linkedin: 'https://linkedin.com/in/vikram-singh-dev',
    github: 'https://github.com/vikram-singh',
    bloodGroup: 'B+',
    emergencyContact: '+91 98111 22233'
  },
  // Backward compatibility aliases
  teacher: {
    id: 'u1',
    name: 'Dr. Sharma',
    role: 'Club Coordinator',
    clubId: 'c1',
    managedClubId: 'c1',
    clubRole: 'Faculty Club Head',
    approvalStatus: 'approved'
  },
  club_student: {
    id: 'u2',
    name: 'Aarav Kumar',
    role: 'Club Coordinator',
    clubId: 'c1',
    managedClubId: 'c1',
    clubRole: 'Student Coordinator',
    approvalStatus: 'approved'
  }
};

// Club Approval Status helper functions
export const getClubApprovalStatus = (clubId) => {
  try {
    const savedApproval = localStorage.getItem(`mockClubApproval_${clubId}`);
    if (savedApproval) {
      return JSON.parse(savedApproval);
    }
    const savedProfile = localStorage.getItem(`mockClubProfile_${clubId}`);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (parsed.approvalStatus) {
        return {
          approvalStatus: parsed.approvalStatus,
          rejectionReason: parsed.rejectionReason || null,
          clubName: parsed.name || 'Club'
        };
      }
    }
  } catch (e) {
    console.error(e);
  }
  const club = clubs.find(c => c.id === clubId);
  if (club) {
    return {
      approvalStatus: club.approvalStatus || 'approved',
      rejectionReason: club.rejectionReason || null,
      clubName: club.name
    };
  }
  return { approvalStatus: 'approved', rejectionReason: null, clubName: 'Club' };
};

export const getPendingClubs = () => {
  const all = getStoredClubs(false);
  return all.filter(c => c.approvalStatus === 'requested');
};

export const approveClub = (clubId) => {
  try {
    const payload = { approvalStatus: 'approved', rejectionReason: null };
    localStorage.setItem(`mockClubApproval_${clubId}`, JSON.stringify(payload));
    return payload;
  } catch (e) {
    console.error(e);
  }
};

export const rejectClub = (clubId, reason) => {
  try {
    const payload = { 
      approvalStatus: 'rejected', 
      rejectionReason: reason || 'Application does not meet institutional compliance standards.' 
    };
    localStorage.setItem(`mockClubApproval_${clubId}`, JSON.stringify(payload));
    return payload;
  } catch (e) {
    console.error(e);
  }
};

// Student Profile storage helper
export const getStoredStudentProfile = () => {
  try {
    const saved = localStorage.getItem('mockStudentProfile');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading mockStudentProfile:', e);
  }
  return mockUsers.general_student;
};

// Event lifecycle storage helpers
export const getStoredEvents = () => {
  try {
    const saved = localStorage.getItem('mockEventsData');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  return events;
};

export const updateStoredEvent = (eventId, updates) => {
  try {
    const currentList = getStoredEvents();
    const updatedList = currentList.map(e => e.id === eventId ? { ...e, ...updates } : e);
    localStorage.setItem('mockEventsData', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error(e);
    return events;
  }
};

export const addStoredEvent = (newEvent) => {
  try {
    const currentList = getStoredEvents();
    const updatedList = [newEvent, ...currentList];
    localStorage.setItem('mockEventsData', JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error(e);
    return events;
  }
};

// Campus Student Directory for autocomplete search
export const campusStudentsDirectory = [
  {
    id: 'u5',
    name: 'Vikram Singh',
    collegeId: 'CS24089',
    classRollNo: 'CS24089',
    universityRollNo: '2400100345',
    email: 'vikram.singh@college.edu',
    phone: '+91 98765 43210',
    department: 'CSE',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '2nd Year',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u6',
    name: 'Ayush Sharma',
    collegeId: 'CS24012',
    classRollNo: 'CS24012',
    universityRollNo: '2400100112',
    email: 'ayush.sharma@college.edu',
    phone: '+91 98111 22334',
    department: 'CSE',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '2nd Year',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u7',
    name: 'Priya Roy',
    collegeId: 'CS25034',
    classRollNo: 'CS25034',
    universityRollNo: '2400100456',
    email: 'priya.roy@college.edu',
    phone: '+91 98222 33445',
    department: 'CSE',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u8',
    name: 'Kabir Patel',
    collegeId: 'IT25055',
    classRollNo: 'IT25055',
    universityRollNo: '2400200055',
    email: 'kabir.patel@college.edu',
    phone: '+91 98333 44556',
    department: 'IT',
    course: 'B.Tech',
    branch: 'Information Technology',
    year: '2nd Year',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u9',
    name: 'Ananya Sen',
    collegeId: 'IT26019',
    classRollNo: 'IT26019',
    universityRollNo: '2400200119',
    email: 'ananya.sen@college.edu',
    phone: '+91 98890 12345',
    department: 'IT',
    course: 'B.Tech',
    branch: 'Information Technology',
    year: '1st Year',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u10',
    name: 'Rohan Mehta',
    collegeId: 'CS25022',
    classRollNo: 'CS25022',
    universityRollNo: '2400100789',
    email: 'rohan.mehta@college.edu',
    phone: '+91 98789 01234',
    department: 'CSE',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    year: '2nd Year',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u11',
    name: 'Tanvi Shah',
    collegeId: 'EC24088',
    classRollNo: 'EC24088',
    universityRollNo: '2400300088',
    email: 'tanvi.shah@college.edu',
    phone: '+91 98678 90123',
    department: 'ECE',
    course: 'B.Tech',
    branch: 'Electronics & Communication',
    year: '3rd Year',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u12',
    name: 'Siddharth Rao',
    collegeId: 'ME24031',
    classRollNo: 'ME24031',
    universityRollNo: '2400400031',
    email: 'siddharth.rao@college.edu',
    phone: '+91 98901 23456',
    department: 'ME',
    course: 'B.Tech',
    branch: 'Mechanical Engineering',
    year: '3rd Year',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400'
  }
];

export const searchCampusStudents = (query) => {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  return campusStudentsDirectory.filter(s => 
    s.name.toLowerCase().includes(q) ||
    s.collegeId.toLowerCase().includes(q) ||
    (s.universityRollNo && s.universityRollNo.toLowerCase().includes(q)) ||
    s.email.toLowerCase().includes(q)
  );
};

