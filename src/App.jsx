import React, { useCallback, useMemo, useState } from 'react'
import { LeadContext } from './lib/store.js'
import Header from './components/Header.jsx'
import Hero, { OfferStrip } from './components/Hero.jsx'
import { Trust, HowItWorks } from './components/TrustAndSteps.jsx'
import Services from './components/Services.jsx'
import Calculator from './components/Calculator.jsx'
import CoverageMap from './components/CoverageMap.jsx'
import Stats from './components/Stats.jsx'
import Reviews from './components/Reviews.jsx'
import { Team, Faq, FinalCta, Footer, StickyCta } from './components/Bottom.jsx'

export default function App() {
  const [lead, setLead] = useState({})
  const [ratingFilter, setRatingFilter] = useState(0)

  const updateLead = useCallback((patch) => setLead((p) => ({ ...p, ...patch })), [])
  const goToForm = useCallback(() => {
    document.getElementById('zayavka')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const ctx = useMemo(() => ({ lead, updateLead, goToForm, ratingFilter, setRatingFilter }), [lead, updateLead, goToForm, ratingFilter])

  return (
    <LeadContext.Provider value={ctx}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        Перейти к содержанию
      </a>
      <OfferStrip />
      <Header />
      <main id="main">
        <Hero />
        <Trust />
        <HowItWorks />
        <Services />
        <Calculator />
        <CoverageMap />
        <Stats />
        <Reviews />
        <Team />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyCta />
    </LeadContext.Provider>
  )
}
