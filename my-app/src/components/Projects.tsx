"use client"
import React,{useEffect} from 'react'
import SectionHeading from './SectionHeading'
import { projectsData } from '../../lib/data'
import Project from "./Project"
import { useInView } from 'react-intersection-observer'
import { useActiveSectionContext } from '../../context/active-section'

export default function Projects() {
  const {ref,inView}=useInView({
    threshold : 0.5
  })
  const {setActiveSection,timeOfLastClick} = useActiveSectionContext();
  
  useEffect(() => {
    if (inView && Date.now() - timeOfLastClick > 1000) {
      setActiveSection("Projects")
    }
  },[inView, timeOfLastClick])

  return (
    <section className='scroll-mt-28' id='projects' ref={ref}>
        <SectionHeading>My projects</SectionHeading>
        <div>
            {projectsData.map((project,index)=>(
                <React.Fragment key={index}>
                <Project {...project}/>
                </React.Fragment>
            ))}
        </div>

    </section>
  )
}

