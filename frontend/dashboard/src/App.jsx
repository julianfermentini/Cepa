import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Lots from './pages/Lots'
import LotForm from './pages/LotForm'
import LotDetail from './pages/LotDetail'
import WineLanding from './pages/WineLanding'
import Analytics from './pages/Analytics'
import Certificate from './pages/Certificate'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protegidas */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/lots" element={<ProtectedRoute><Lots /></ProtectedRoute>} />
          <Route path="/lots/new" element={<ProtectedRoute><LotForm /></ProtectedRoute>} />
          <Route path="/lots/:id" element={<ProtectedRoute><LotDetail /></ProtectedRoute>} />
          <Route path="/lots/:id/edit" element={<ProtectedRoute><LotForm /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

          {/* Rutas públicas del consumidor — sin auth */}
          <Route path="/wine/:short_code" element={<WineLanding />} />
          <Route path="/wine/:short_code/certificate" element={<Certificate />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
