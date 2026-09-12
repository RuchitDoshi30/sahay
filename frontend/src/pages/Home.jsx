import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
function Home() {
    const navigate = useNavigate()

    const goToProfile = () => {
        navigate('/profile')
    }

    return (
        <div className="home-page">

            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* ================= HERO ================= */}
            <main>

                <section className="hero-section">

                    <div className="hero-content">

                        <div className="eyebrow">
                            <span className="eyebrow-dot"></span>
                            Official NSFDC Citizen Guidance Platform
                        </div>

                        <h1>
                            Find the right scheme.
                            <br />
                            <span>Take the right next step.</span>
                        </h1>

                        <p className="hero-description">
                            Tell us what you need, and we'll help you understand which scheme may fit, what the financial estimate looks like, and where you can go next.
                        </p>

                        <div className="hero-actions">

                            <button
                                className="primary-btn"
                                onClick={goToProfile}
                            >
                                Find My Scheme
                                <span className="arrow">→</span>
                            </button>

                            <button
                                className="secondary-btn"
                                onClick={() => {
                                    document
                                        .getElementById('why-sahay')
                                        ?.scrollIntoView({ behavior: 'smooth' })
                                }}
                            >
                                How it works
                            </button>

                        </div>

                        <div className="trust-note">
                            <span>🛡️</span>
                            Simple guidance • 100% Free Govt Service • Zero Middleman Protection
                        </div>

                    </div>


                    {/* Journey card */}
                    <div className="journey-wrapper">

                        <div className="journey-card">

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
                                    4 simple steps
                                </div>

                            </div>


                            <div className="journey-steps">

                                <div className="journey-step active">

                                    <div className="step-number">
                                        01
                                    </div>

                                    <div className="step-icon">
                                        ✦
                                    </div>

                                    <div>
                                        <h4>
                                            Tell us your need
                                        </h4>

                                        <p>
                                            Income, purpose, cost & location
                                        </p>
                                    </div>

                                </div>


                                <div className="journey-line"></div>


                                <div className="journey-step">

                                    <div className="step-number">
                                        02
                                    </div>

                                    <div className="step-icon">
                                        ◎
                                    </div>

                                    <div>
                                        <h4>
                                            Find a suitable scheme
                                        </h4>

                                        <p>
                                            Understand why it may fit
                                        </p>
                                    </div>

                                </div>


                                <div className="journey-line"></div>


                                <div className="journey-step">

                                    <div className="step-number">
                                        03
                                    </div>

                                    <div className="step-icon">
                                        ₹
                                    </div>

                                    <div>
                                        <h4>
                                            Understand the money
                                        </h4>

                                        <p>
                                            Loan estimate & contribution
                                        </p>
                                    </div>

                                </div>


                                <div className="journey-line"></div>


                                <div className="journey-step">

                                    <div className="step-number">
                                        04
                                    </div>

                                    <div className="step-icon">
                                        ⌖
                                    </div>

                                    <div>
                                        <h4>
                                            Find a suitable partner
                                        </h4>

                                        <p>
                                            See relevant offices near you
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="floating-card">

                            <div className="floating-icon">
                                ✓
                            </div>

                            <div>
                                <span>
                                    THE GOAL
                                </span>

                                <strong>
                                    No Wrong Door
                                </strong>
                            </div>

                        </div>

                    </div>

                </section>


                {/* ================= WHY SECTION ================= */}
                <section
                    className="why-section"
                    id="why-sahay"
                >

                    <div className="section-heading">

                        <div>

                            <span className="small-label">
                                WHY THIS MATTERS
                            </span>

                            <h2>
                                One journey.
                                <br />
                                <span>Less confusion.</span>
                            </h2>

                        </div>

                        <p>
                            Instead of searching separately for a scheme,
                            a financial estimate and a suitable office,
                            Sahay brings the important pieces together.
                        </p>

                    </div>


                    <div className="feature-grid">

                        <div className="feature-card">

                            <div className="feature-number">
                                01
                            </div>

                            <div className="feature-icon">
                                ◎
                            </div>

                            <h3>
                                Right scheme
                            </h3>

                            <p>
                                Get a recommendation based on your purpose,
                                project size and basic eligibility information.
                            </p>

                        </div>


                        <div className="feature-card">

                            <div className="feature-number">
                                02
                            </div>

                            <div className="feature-icon">
                                ₹
                            </div>

                            <h3>
                                Clear money view
                            </h3>

                            <p>
                                Understand the possible loan amount,
                                own contribution and repayment estimate.
                            </p>

                        </div>


                        <div className="feature-card">

                            <div className="feature-number">
                                03
                            </div>

                            <div className="feature-icon">
                                ⌖
                            </div>

                            <h3>
                                Suitable partner
                            </h3>

                            <p>
                                Find Channel Partners that match the
                                selected scheme and your location.
                            </p>

                        </div>


                        <div className="feature-card">

                            <div className="feature-number">
                                04
                            </div>

                            <div className="feature-icon">
                                ✓
                            </div>

                            <h3>
                                One final summary
                            </h3>

                            <p>
                                Keep your profile, scheme, estimate and
                                selected partner together in one place.
                            </p>

                        </div>

                    </div>

                </section>


                {/* ================= CTA ================= */}
                <section
                    className="cta-section"
                    id="how-it-works"
                >

                    <div className="cta-content">

                        <span className="small-label light">
                            START WITH YOUR NEED
                        </span>

                        <h2>
                            You don't need to know
                            <br />
                            the scheme name first.
                        </h2>

                        <p>
                            Just tell us what you're trying to do.
                            We'll help you understand the next step.
                        </p>

                        <button
                            className="cta-btn"
                            onClick={goToProfile}
                        >
                            Start your journey
                            <span>→</span>
                        </button>

                    </div>


                    <div className="cta-decoration">

                        <div></div>
                        <div></div>
                        <div></div>

                    </div>

                </section>

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

export default Home