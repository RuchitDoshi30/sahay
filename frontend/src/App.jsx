import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Profile from './pages/Profile'
import Result from './pages/Result'
import Partners from './pages/Partners'
import Summary from './pages/Summary'

import { AccessibilityProvider } from './context/AccessibilityContext'

function App() {
    return (
        <AccessibilityProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/result" element={<Result />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/summary" element={<Summary />} />
                </Routes>
            </BrowserRouter>
        </AccessibilityProvider>
    )
}

export default App