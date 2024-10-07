import About from "@/components/about";
import Experience from "@/components/Experience";
import Intro from "@/components/Intro";
import Projects from "@/components/Projects";
import SectionDevider from "@/components/SectionDevider";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <Intro/>
      <SectionDevider/>
      <About/>
      <Projects/>
      <Skills/>
      <Experience/>
    </main>
  );
}
