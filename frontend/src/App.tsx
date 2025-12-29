import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ObjectivesPage } from './pages/ObjectivesPage';
import { ObjectiveDetailPage } from './pages/ObjectiveDetailPage';
import { isAuthenticated } from './services/auth-api';

/**
 * Main App component
 * Handles routing and authentication
 */

interface ProtectedRouteProps {
  children: JSX.Element;
}

function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/objectives"
          element={
            <ProtectedRoute>
              <ObjectivesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/objectives/:id"
          element={
            <ProtectedRoute>
              <ObjectiveDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/objectives" replace />} />
        <Route path="*" element={<Navigate to="/objectives" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
