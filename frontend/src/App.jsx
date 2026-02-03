import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import TeacherDashboard from './pages/TeacherDashboard';
import AddLesson from './pages/AddLesson';
import AddQuestion from './pages/AddQuestion';
import { getUserInfo } from './utils/authUtils';
import PlacementTest from './pages/PlacementTest';

// Simple Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
    const user = getUserInfo();
    if (!user) return <Navigate to="/login" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/dashboard" />;
    return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/quiz/:lessonId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/placement-test" element={
            <ProtectedRoute>
              <PlacementTest />
            </ProtectedRoute>
          } />
          {/* Teacher Routes */}
          <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/add-lesson" element={<ProtectedRoute allowedRole="teacher"><AddLesson /></ProtectedRoute>} />
          <Route path="/teacher/add-question/:lessonId" element={<ProtectedRoute allowedRole="teacher"><AddQuestion /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;