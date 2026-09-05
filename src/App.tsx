import { Route, Routes } from 'react-router-dom'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { HomePage } from './pages/HomePage'
import { StructurePage } from './pages/StructurePage'

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/co-cau" element={<StructurePage />} />
        <Route path="/hoat-dong" element={<ActivitiesPage />} />
      </Routes>
      <SiteFooter />
    </div>
  )
}
