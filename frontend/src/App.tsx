import { Routes, Route } from 'react-router-dom'
import AppFooter from './components/AppFooter'
import AppLoading from './components/AppLoading'
import { useAuth } from './contexts/auth/context'
import AppNavbar from './components/AppNavbar'
import HomePage from './components/pages/HomePage'
import LoginPage from './components/pages/LoginPage'
import ProfilePage from './components/pages/ProfilePage'
import RegisterPage from './components/pages/RegisterPage'
import SettingsPage from './components/pages/SettingsPage'
import NewPostPage from './components/pages/NewPost'
import EditPostPage from './components/pages/EditPostPage'
import ReadPostPage from './components/pages/ReadPostPage'

export default function App() {
  const auth = useAuth()
  if (auth.state.loading) return <AppLoading />
  return (
    <>
      <AppNavbar />
      <main className="flex-fill py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/new-post" element={<NewPostPage />} />
          <Route path="/:id/edit-post" element={<EditPostPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/@:username" element={<ProfilePage />} />
          <Route path="/:slug" element={<ReadPostPage />} />
        </Routes>
      </main>
      <AppFooter />
    </>
  )
}
