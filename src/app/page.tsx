import StatusBar from "@/components/StatusBar";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Plates from "@/components/Plates";
import Principles from "@/components/Principles";
import Stack from "@/components/Stack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <StatusBar />
      <main>
        <Hero />
        <Work />
        <Plates />
        <Principles />
        <Stack />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
