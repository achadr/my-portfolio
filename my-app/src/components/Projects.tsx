"use client"
import React from 'react'
import SectionHeading from './SectionHeading'
import { projectsData } from '../../lib/data'
import Project from "./Project"
import { useSectionInView } from '../../lib/hooks'
import { projectAnchor } from '../../lib/relations'

export default function Projects() {
  const {ref} = useSectionInView("Projects",0.5)

  return (
    <section className='scroll-mt-28 mb-28' id='projects' ref={ref}>
        <SectionHeading>My projects</SectionHeading>
        <div className='flex flex-col gap-4 sm:gap-6'>
            {projectsData.map((project,index)=>(
                <React.Fragment key={index}>
                <Project {...project} anchorId={projectAnchor(index)}/>
                </React.Fragment>
            ))}
        </div>

    </section>
  )
}

