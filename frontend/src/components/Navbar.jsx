import { useNavigate } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import SahajToggle from './SahajToggle'
import LanguageSelector from './LanguageSelector'

function Navbar() {
  const navigate = useNavigate()
  const { t } = useAccessibility()

  return (
    <nav className="site-navbar">
      <div className="navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="profile-brand-button"
          onClick={() => navigate('/')}
          aria-label="Sahay Home"
        >
          <div className="site-brand">
            <div className="brand-logo notranslate">S</div>
            <div className="brand-text">
              <div className="brand-name notranslate">{t('brandName')}</div>
              <div className="brand-subtitle">{t('brandSubtitle')}</div>
            </div>
          </div>
        </button>

        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/#how-it-works">{t('howItWorks')}</a>
          <a href="/#why-sahay">{t('whySahay')}</a>
          <SahajToggle />
          <LanguageSelector />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
