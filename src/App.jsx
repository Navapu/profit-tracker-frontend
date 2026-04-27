import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { Login } from './pages/Login/Login.jsx'
import { Register } from './pages/Register/Register.jsx'
function App() {
  return (
    <div>

      <Routes>
        <Route path='/auth'>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
