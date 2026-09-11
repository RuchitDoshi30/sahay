import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/layout.css'
import '../styles/components.css'
import '../styles/responsive.css'

function Profile() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        has_sc_certificate: '',
        annual_income: '',
        purpose: '',
        project_cost: '',
        activity_type: '',
        state: '',
        district: '',
    })

    const [error, setError] = useState('')

    const handleChange = (field, value) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }))

        setError('')
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (
            !formData.has_sc_certificate ||
            !formData.annual_income ||
            !formData.purpose ||
            !formData.project_cost ||
            !formData.activity_type ||
            !formData.state ||
            !formData.district
        ) {
            setError('Please complete all the fields before continuing.')
            return
        }

        console.log('Profile data:', formData)

        navigate('/result')
    }

    return (
        <div className="profile-page">

            {/* ================= NAVBAR ================= */}
            <nav className="site-navbar">
                <div className="navbar-inner">

                    <button
                        className="profile-brand-button"
                        onClick={() => navigate('/')}
                    >
                        <div className="site-brand">

                            <div className="brand-logo">
                                S
                            </div>

                            <div className="brand-text">
                                <div className="brand-name">
                                    Sahay
                                </div>

                                <div className="brand-subtitle">
                                    Scheme Guidance Platform
                                </div>
                            </div>

                        </div>
                    </button>

                    <div className="navbar-links">

                        <a href="/#how-it-works">
                            How it works
                        </a>

                        <a href="/#why-sahay">
                            Why Sahay?
                        </a>

                        <button className="language-selector">
                            EN
                            <span>⌄</span>
                        </button>

                    </div>

                </div>
            </nav>


            {/* ================= PROFILE ================= */}
            <main className="profile-main">

                <div className="profile-heading">

                    <div>
                        <span className="small-label">
                            YOUR PROFILE
                        </span>

                        <h1>
                            Tell us about
                            <br />
                            <span>your need.</span>
                        </h1>

                        <p>
                            A few simple details will help us understand
                            which scheme may fit your situation.
                        </p>
                    </div>

                    <div className="progress-indicator">
                        <span>STEP 01</span>
                        <strong>of 04</strong>
                    </div>

                </div>


                <div className="profile-layout">

                    {/* ================= FORM CARD ================= */}
                    <form
                        className="profile-form-card"
                        onSubmit={handleSubmit}
                    >

                        {/* SC certificate */}
                        <div className="form-section">

                            <div className="field-number">
                                01
                            </div>

                            <div className="field-content">

                                <label>
                                    Do you have an SC certificate?
                                </label>

                                <p className="field-help">
                                    This helps us check basic eligibility.
                                </p>

                                <div className="choice-grid">

                                    <button
                                        type="button"
                                        className={`choice-button ${formData.has_sc_certificate === 'true'
                                                ? 'selected'
                                                : ''
                                            }`}
                                        onClick={() =>
                                            handleChange(
                                                'has_sc_certificate',
                                                'true'
                                            )
                                        }
                                    >
                                        <span className="choice-icon">
                                            ✓
                                        </span>

                                        <span>
                                            Yes, I have one
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`choice-button ${formData.has_sc_certificate === 'false'
                                                ? 'selected'
                                                : ''
                                            }`}
                                        onClick={() =>
                                            handleChange(
                                                'has_sc_certificate',
                                                'false'
                                            )
                                        }
                                    >
                                        <span className="choice-icon">
                                            —
                                        </span>

                                        <span>
                                            No
                                        </span>
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* Income */}
                        <div className="form-section">

                            <div className="field-number">
                                02
                            </div>

                            <div className="field-content">

                                <label htmlFor="annual-income">
                                    Annual family income
                                </label>

                                <p className="field-help">
                                    Enter your approximate yearly family income.
                                </p>

                                <div className="money-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="annual-income"
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 300000"
                                        value={formData.annual_income}
                                        onChange={(event) =>
                                            handleChange(
                                                'annual_income',
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* Purpose */}
                        <div className="form-section">

                            <div className="field-number">
                                03
                            </div>

                            <div className="field-content">

                                <label>
                                    What do you need support for?
                                </label>

                                <p className="field-help">
                                    Choose the option closest to your need.
                                </p>

                                <div className="purpose-grid">

                                    <button
                                        type="button"
                                        className={`purpose-card ${formData.purpose === 'business'
                                                ? 'selected'
                                                : ''
                                            }`}
                                        onClick={() =>
                                            handleChange(
                                                'purpose',
                                                'business'
                                            )
                                        }
                                    >
                                        <span className="purpose-icon">
                                            ◇
                                        </span>

                                        <strong>
                                            Business
                                        </strong>

                                        <small>
                                            Start or grow an activity
                                        </small>
                                    </button>


                                    <button
                                        type="button"
                                        className={`purpose-card ${formData.purpose === 'education'
                                                ? 'selected'
                                                : ''
                                            }`}
                                        onClick={() =>
                                            handleChange(
                                                'purpose',
                                                'education'
                                            )
                                        }
                                    >
                                        <span className="purpose-icon">
                                            ▣
                                        </span>

                                        <strong>
                                            Education
                                        </strong>

                                        <small>
                                            Course or higher education
                                        </small>
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* Project cost */}
                        <div className="form-section">

                            <div className="field-number">
                                04
                            </div>

                            <div className="field-content">

                                <label htmlFor="project-cost">
                                    Estimated project / course cost
                                </label>

                                <p className="field-help">
                                    Give us an approximate amount.
                                </p>

                                <div className="money-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="project-cost"
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 380000"
                                        value={formData.project_cost}
                                        onChange={(event) =>
                                            handleChange(
                                                'project_cost',
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* Activity */}
                        <div className="form-section">

                            <div className="field-number">
                                05
                            </div>

                            <div className="field-content">

                                <label htmlFor="activity-type">
                                    Activity type
                                </label>

                                <p className="field-help">
                                    What kind of business or activity is this?
                                </p>

                                <select
                                    id="activity-type"
                                    value={formData.activity_type}
                                    onChange={(event) =>
                                        handleChange(
                                            'activity_type',
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select an activity
                                    </option>

                                    <option value="dairy">
                                        Dairy
                                    </option>

                                    <option value="agriculture">
                                        Agriculture
                                    </option>

                                    <option value="small_business">
                                        Small business
                                    </option>

                                    <option value="service">
                                        Service activity
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>
                                </select>

                            </div>

                        </div>


                        {/* Location */}
                        <div className="form-section">

                            <div className="field-number">
                                06
                            </div>

                            <div className="field-content">

                                <label>
                                    Where are you located?
                                </label>

                                <p className="field-help">
                                    We'll use this to find suitable nearby partners.
                                </p>

                                <div className="location-grid">

                                    <div>
                                        <label
                                            className="sub-label"
                                            htmlFor="state"
                                        >
                                            State
                                        </label>

                                        <input
                                            id="state"
                                            type="text"
                                            placeholder="e.g. Gujarat"
                                            value={formData.state}
                                            onChange={(event) =>
                                                handleChange(
                                                    'state',
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="sub-label"
                                            htmlFor="district"
                                        >
                                            District
                                        </label>

                                        <input
                                            id="district"
                                            type="text"
                                            placeholder="e.g. Rajkot"
                                            value={formData.district}
                                            onChange={(event) =>
                                                handleChange(
                                                    'district',
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Error */}
                        {error && (
                            <div className="form-error">
                                <span>!</span>
                                {error}
                            </div>
                        )}


                        {/* Submit */}
                        <div className="form-footer">

                            <div>
                                <span className="secure-mark">
                                    ✓
                                </span>

                                <span>
                                    Your information is used for guidance.
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="primary-btn profile-submit"
                            >
                                Find My Scheme
                                <span className="arrow">
                                    →
                                </span>
                            </button>

                        </div>

                    </form>


                    {/* ================= JOURNEY SIDEBAR ================= */}
                    <aside className="profile-sidebar">

                        <div className="profile-journey-card">

                            <div className="journey-header">

                                <div>
                                    <span className="small-label">
                                        YOUR JOURNEY
                                    </span>

                                    <h3>
                                        From need to next step
                                    </h3>
                                </div>

                                <div className="journey-badge">
                                    01 / 04
                                </div>

                            </div>


                            <div className="profile-steps">

                                <div className="profile-step current">

                                    <div className="profile-step-icon">
                                        ✦
                                    </div>

                                    <div>
                                        <strong>
                                            Tell us your need
                                        </strong>

                                        <span>
                                            You're here
                                        </span>
                                    </div>

                                </div>


                                <div className="profile-step-line"></div>


                                <div className="profile-step">

                                    <div className="profile-step-icon">
                                        ◎
                                    </div>

                                    <div>
                                        <strong>
                                            Find a suitable scheme
                                        </strong>

                                        <span>
                                            Understand why it fits
                                        </span>
                                    </div>

                                </div>


                                <div className="profile-step-line"></div>


                                <div className="profile-step">

                                    <div className="profile-step-icon">
                                        ₹
                                    </div>

                                    <div>
                                        <strong>
                                            Understand the money
                                        </strong>

                                        <span>
                                            Loan estimate
                                        </span>
                                    </div>

                                </div>


                                <div className="profile-step-line"></div>


                                <div className="profile-step">

                                    <div className="profile-step-icon">
                                        ⌖
                                    </div>

                                    <div>
                                        <strong>
                                            Find a suitable partner
                                        </strong>

                                        <span>
                                            Nearby options
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="profile-tip-card">

                            <span className="tip-label">
                                A SMALL TIP
                            </span>

                            <h4>
                                You don't need to know
                                the scheme name.
                            </h4>

                            <p>
                                Just tell us what you're trying
                                to do. We'll guide you from there.
                            </p>

                        </div>

                    </aside>

                </div>

            </main>


            {/* ================= FOOTER ================= */}
            <footer className="footer">

                <div className="footer-brand">

                    <div className="brand-logo small">
                        S
                    </div>

                    <div>
                        <strong>
                            Sahay
                        </strong>

                        <span>
                            Scheme Guidance Platform
                        </span>
                    </div>

                </div>

                <div className="footer-note">
                    Guidance platform • Prototype
                </div>

            </footer>

        </div>
    )
}

export default Profile