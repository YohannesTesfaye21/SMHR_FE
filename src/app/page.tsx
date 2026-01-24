import Hero from "@/components/Hero";
import StatsDashboard from "@/components/StatsDashboard";
import Link from 'next/link';

import HomeMapSection from "@/components/HomeMapSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <HomeMapSection />
    </div>
  );
}
