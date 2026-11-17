"use client"
import React, { useState } from 'react'

import SectionHeading from './SectionHeading'
import { skillGroups, type SkillName } from '../../lib/content'
import {
    experienceAnchor,
    experiencesUsing,
    projectAnchor,
    projectsUsing,
} from '../../lib/relations'
import { useSectionInView } from '../../lib/hooks'
import clsx from 'clsx'
import { motion } from "framer-motion"

const fadeInAnimationVariants = {
    initial : {
        opacity : 0,
        y : 100
    },
    animate : (index : number) => ({
        opacity : 1,
        y : 0,
        transition:{
           delay : 0.05*index
        }
    })
}

export default function Skills() {

  const {ref} = useSectionInView("Skills")
  const [selected, setSelected] = useState<SkillName | null>(null)

  const projects = selected ? projectsUsing(selected) : []
  const experiences = selected ? experiencesUsing(selected) : []

  return (
   <section id='skills' ref={ref} className='mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40'>
        <SectionHeading>My Skills</SectionHeading>
        <p className='-mt-4 mb-8 text-sm text-gray-600'>
            Pick a skill to see where I used it.
        </p>

        <div className='flex flex-col gap-8'>
            {skillGroups.map((group, groupIndex) => (
                <div key={group.id}>
                    <h3 className='text-lg font-semibold'>{group.name}</h3>
                    <p className='mb-3 text-sm text-gray-600'>{group.tagline}</p>
                    <ul className='flex flex-wrap justify-center gap-2 text-lg text-gray-800'>
                        {group.skills.map((skill, index) => (
                            <motion.li
                                key={skill}
                                variants={fadeInAnimationVariants}
                                initial='initial'
                                whileInView="animate"
                                viewport={{ once: true }}
                                custom={groupIndex * 3 + index}
                            >
                                <button
                                    type="button"
                                    aria-pressed={selected === skill}
                                    onClick={() => setSelected(selected === skill ? null : skill)}
                                    className={clsx(
                                        'rounded-xl border px-5 py-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
                                        selected === skill
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-black/[0.1] bg-white hover:border-gray-900/40 hover:bg-gray-50'
                                    )}
                                >
                                    {skill}
                                </button>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        <div
            role="region"
            aria-live="polite"
            aria-label="Where this skill is used"
            className={clsx(
                'mx-auto mt-8 max-w-[34rem] rounded-xl border border-black/5 bg-gray-100 p-5 text-left transition',
                !selected && 'hidden'
            )}
        >
            {selected && (
                <>
                    <h3 className='text-xl font-semibold'>{selected}</h3>

                    {projects.length === 0 && experiences.length === 0 && (
                        <p className='mt-2 text-gray-700'>
                            Part of my everyday toolbox, used across my work.
                        </p>
                    )}

                    {projects.length > 0 && (
                        <div className='mt-3'>
                            <h4 className='text-xs font-medium uppercase tracking-wider text-gray-600'>
                                Projects
                            </h4>
                            <ul className='mt-1 flex flex-col gap-1'>
                                {projects.map(({ project, index }) => (
                                    <li key={project.title}>
                                        <a className='underline underline-offset-2 hover:text-gray-950' href={`#${projectAnchor(index)}`}>
                                            {project.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {experiences.length > 0 && (
                        <div className='mt-3'>
                            <h4 className='text-xs font-medium uppercase tracking-wider text-gray-600'>
                                Career
                            </h4>
                            <ul className='mt-1 flex flex-col gap-1'>
                                {experiences.map(({ experience, index }) => (
                                    <li key={experience.title}>
                                        <a className='underline underline-offset-2 hover:text-gray-950' href={`#${experienceAnchor(index)}`}>
                                            {experience.title} <span className='text-gray-600'>· {experience.date}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
   </section>
  )
}
