/**
 * AppContext.jsx — React context for sharing global Sahay application state.
 *
 * Provides a lightweight global store for:
 *   - profileData: citizen intake form data
 *   - recommendation: /api/recommend response
 *   - calculation: /api/calculate response
 *   - selectedScheme: currently active scheme (primary or alternative)
 *   - selectedPartner: chosen channel partner
 *
 * NOTE: Most state is currently persisted via sessionStorage in each page
 * (per the original architecture). This context is available for future
 * refactoring to eliminate repeated sessionStorage read/write patterns.
 */
import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profileData, setProfileData] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [calculation, setCalculation] = useState(null)
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)

  const value = {
    profileData,
    setProfileData,
    recommendation,
    setRecommendation,
    calculation,
    setCalculation,
    selectedScheme,
    setSelectedScheme,
    selectedPartner,
    setSelectedPartner,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/**
 * Hook to consume the AppContext.
 * @returns {object} AppContext value
 */
export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>')
  }
  return ctx
}

export default AppContext
