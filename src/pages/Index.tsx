import { useEffect } from "react";
import { HeroSection } from "@/components/hero-section";

const Index = () => {
  useEffect(() => {
    document.title = "Sibz AI Portfolio - Chat with Sibabalwe's Digital Twin";
  }, []);

  return <HeroSection />;
};

export default Index;
