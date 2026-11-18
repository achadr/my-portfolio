import About from "@/components/about";
import Contact from "@/components/Contact";
import ExplorerCards from "@/components/explorer/ExplorerCards";
import Experience from "@/components/Experience";
import Intro from "@/components/intro";
import Projects from "@/components/Projects";
import SectionDevider from "@/components/SectionDevider";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <Intro/>
      <ExplorerCards/>
      <SectionDevider/>
      <About/>
      <Projects/>
      <Skills/>
      <Experience/>
      <Contact/>
    </main>
  );
}
