import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { Login } from './pages/Login/Login.jsx'
import { Register } from './pages/Register/Register.jsx'
import { Dashboard } from './pages/Dashboard/Dashboard.jsx';
import { PrivateRoute } from './components/PrivateRoute.jsx';
import { PublicRoute } from './components/PublicRoute.jsx';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path='/auth'>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
        </Route>
        <Route path='/dashboard'>
          <Route index element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </div>
  )
}

export default App
