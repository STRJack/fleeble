'use client';

import { useTheme } from '@/hooks/useTheme';
import Particles from '@/components/ui/Particles';
import BackgroundFleebles from '@/components/ui/BackgroundFleebles';
import ThemePicker from '@/components/ui/ThemePicker';
import HeroSection from '@/components/sections/HeroSection';
import DemoSection from '@/components/sections/DemoSection';
import MenuSection from '@/components/sections/MenuSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import IntegrationsSection from '@/components/sections/IntegrationsSection';
import Footer from '@/components/sections/Footer';

export default function Home() {
  const { themeName, applyTheme } = useTheme();

  return (
    <>
      <Particles />
      <BackgroundFleebles />
      <ThemePicker currentTheme={themeName} onThemeChange={applyTheme} />
      <main>
        <HeroSection />
        <DemoSection />
        <MenuSection />
        <FeaturesSection />
        <IntegrationsSection />
        <Footer />
      </main>
    </>
  );
}
