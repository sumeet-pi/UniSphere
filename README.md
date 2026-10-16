# CampusSphere 🚀

**CampusSphere** is a comprehensive **College Club Management System** designed to streamline the organization, management, and discovery of clubs and events within a college ecosystem. It serves as a centralized platform connecting students, club coordinators, and faculty members, making campus life more organized, engaging, and vibrant.

## 🌟 Key Features

### **1. Comprehensive Role Management**
- **General Student**: Discover clubs, register for events, view schedules, and track participation.
- **Club Coordinator**: Manage club details, create and publish events, manage members, and monitor analytics.
- **Teacher/Faculty**: Supervise clubs, create college-wide events, and review analytics.

### **2. Dynamic Event Management**
- **Event Creation**: Coordinators and teachers can easily create events with details like name, date, time, location, description, image, and cost.
- **Event Discovery**: Students can browse all available events with filters and search functionality.
- **Event Details**: Rich event pages with images, detailed descriptions, organizer information, and registration options.
- **Event Tracking**: Real-time tracking of event registrations and participation.

### **3. Club Management**
- **Club Profiles**: Detailed club pages with descriptions, logos, cover images, and member lists.
- **Club Creation**: Simplified club registration process.
- **Member Management**: Coordinators can add, remove, or manage member roles within their club.

### **4. Dashboard System**
- **Student Dashboard**: Quick overview of upcoming events, recent activities, and club memberships.
- **Club Coordinator Dashboard**: Access to manage events, members, analytics, and club settings.
- **Teacher Dashboard**: Overview of all managed clubs and events, analytics, and announcements.

### **5. User Experience**
- **Modern UI**: Clean, intuitive, and responsive user interface with smooth animations.
- **Dark Mode**: Built-in support for dark mode for better viewing experience.
- **Form Validation**: Real-time form validation with user-friendly error messages.
- **Responsive Design**: Optimized for seamless use on desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18
- **Language**: JavaScript (ES6+)
- **Styling**: Custom CSS with Tailwind CSS utility classes
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite

### **Backend**
- **Framework**: Spring Boot (Java)
- **Database**: MySQL
- **Security**: Spring Security, JWT (JSON Web Tokens)
- **Validation**: Hibernate Validator
- **Documentation**: Swagger/OpenAPI

## 📂 Project Structure

The frontend is organized into clear, feature-based directories:

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context for state management (AuthContext)
│   ├── data/              # Mock data for development
│   ├── layouts/           # App layouts (DashboardLayout, PublicLayout)
│   ├── pages/
│   │   ├── public/        # Public-facing pages (Landing, Login, Signup)
│   │   ├── student/       # Student-specific pages
│   │   ├── club/          # Club coordinator pages
│   │   └── teacher/       # Teacher/faculty pages
│   ├── App.jsx            # Main application component
│   ├── index.jsx          # Entry point
│   └── main.jsx           # Root application file
├── public/                # Static assets
└── package.json           # Project dependencies
```

## 🔄 Workflow

### **1. Setup**

**Prerequisites:**
- Node.js (v16 or higher)
- npm
- Java (v17 or higher)
- Maven
- MySQL Database

**Frontend Setup:**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

**Backend Setup:**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Import the project into your IDE (e.g., IntelliJ IDEA).
3. Configure database connection in `src/main/resources/application.properties`.
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### **2. Running the Application**

**Start Frontend:**
1. Open a new terminal in the frontend directory:
   ```bash
   cd frontend
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and go to `http://localhost:5173`

### **3. Default Credentials**

To test the application without creating new accounts, use these pre-configured demo credentials:

**Student:**
- Email: [EMAIL_ADDRESS]`
- Password: `Password@2026`

**Club Coordinator:**
- Email: [EMAIL_ADDRESS]`
- Password: `ClubAdmin#2026`

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.