import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { Login } from './pages/Login/Login.jsx'
function App() {
  return (
    <div>

      <Routes>
        <Route index element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
