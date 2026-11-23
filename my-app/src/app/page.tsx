import About from "@/components/about";
import Contact from "@/components/Contact";
import ExplorerCards from "@/components/explorer/ExplorerCards";
import ExplorerTabs from "@/components/explorer/ExplorerTabs";
import Experience from "@/components/Experience";
import Intro from "@/components/intro";
import Projects from "@/components/Projects";
import SectionDevider from "@/components/SectionDevider";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <Intro/>
      {/* desktop: cards that open in place · phones: tabs over swipeable cards */}
      <ExplorerCards/>
      <ExplorerTabs/>
      <SectionDevider/>
      <About/>
      <Projects/>
      <Skills/>
      <Experience/>
      <Contact/>
    </main>
  );
}
