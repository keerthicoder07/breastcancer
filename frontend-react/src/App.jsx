import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AdminRegister from './pages/AdminRegister'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
