import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { Login } from './pages/Login/Login.jsx'
import { Register } from './pages/Register/Register.jsx'
import { Dashboard } from './pages/Dashboard/Dashboard.jsx';
function App() {
  return (
    <div>
      <Routes>
        <Route path='/auth'>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path='/dashboard'>
          <Route index element={
            <Dashboard />
          } />
        </Route>
      </Routes>
    </div>
  )
}

export default App
