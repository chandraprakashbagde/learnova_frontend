import { BenefitsSection } from '@/features/home/components/BenefitsSection'
import { CategoriesSection } from '@/features/home/components/CategoriesSection'
import { FinalCTASection } from '@/features/home/components/FinalCTASection'
import { HeroSection } from '@/features/home/components/HeroSection'
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <CategoriesSection />
      <FinalCTASection />
    </>
  )
}