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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ViewQuestions from './pages/ViewQuestions';

const ProtectedRoute = ({ children, allowedRole }) => {
    const user = getUserInfo();
    const token = localStorage.getItem('token');
    
    if (!token || !user) return <Navigate to="/login" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/dashboard" />;
    
    return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        
        <main className="flex-grow container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/teacher/view-questions/:lessonId" element={
             <ProtectedRoute allowedRole="teacher"><ViewQuestions /></ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            
            <Route path="/quiz/:lessonId" element={
              <ProtectedRoute><Quiz /></ProtectedRoute>
            } />
            
            <Route path="/placement-test" element={
              <ProtectedRoute><PlacementTest /></ProtectedRoute>
            } />

            <Route path="/teacher-dashboard" element={
              <ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>
            } />
            
            <Route path="/teacher/add-lesson" element={
              <ProtectedRoute allowedRole="teacher"><AddLesson /></ProtectedRoute>
            } />
            
            <Route path="/teacher/add-question/:lessonId" element={
              <ProtectedRoute allowedRole="teacher"><AddQuestion /></ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;