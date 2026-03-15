import GradientBackground from '@/components/GradientBackground'
import ButtonFillEffect from '@/components/ButtonFillEffect'
import RevealOnScroll from '@/components/RevealOnScroll'
import Cursor from '@/components/Cursor'
import Navbar from '@/components/Navbar'
import FloatingK from '@/components/FloatingK'
import FloatingCards from '@/components/FloatingCards'
import HeroSection from '@/components/HeroSection'
import Marquee from '@/components/Marquee'
import ServicesSection from '@/components/ServicesSection'
import ManifesteSection from '@/components/ManifesteSection'
import FinalCTA from '@/components/FinalCTA'
import LocationSection from '@/components/LocationSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div style={{ position: 'relative', overflow: 'clip' }}>
      <GradientBackground />
      <ButtonFillEffect />
      <RevealOnScroll />
      <Cursor />
      <FloatingK />
      <FloatingCards />
      <Navbar />
      <HeroSection />
      <Marquee />
      <ServicesSection />
      <ManifesteSection />
      <FinalCTA />
      <LocationSection />
      <Footer />
    </div>
  )
}
