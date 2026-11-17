"use client"

import React, {useEffect,useRef,useState} from 'react'
import clsx from 'clsx'

import SectionHeading from './SectionHeading'
import CareerMap from './CareerMap'
import { useFocus } from '../../context/focus'
import {
    VerticalTimeline,
    VerticalTimelineElement,
  } from "react-vertical-timeline-component";
  import "react-vertical-timeline-component/style.min.css";
  import { experiencesData } from "../../lib/data";
  import { useSectionInView } from "../../lib/hooks";
  import { experienceAnchor } from "../../lib/relations";
//   import { useTheme } from "@/context/theme-context";

export default function Experience() {
    const {ref, inView} = useSectionInView("Experience",0.55)
    const [hasAnimated, setHasAnimated] = useState(false);
    const [view, setView] = useState<'map' | 'timeline'>('map')
    const {experience: focusRequest} = useFocus()
    const viewRef = useRef(view)
    viewRef.current = view

    useEffect(() => { if (inView && !hasAnimated) { setHasAnimated(true); } }, [inView, hasAnimated]);

    // Another section (skill tree, skills list) asked to show a given experience.
    useEffect(() => {
        if (!focusRequest) return
        const desktop = window.matchMedia('(min-width: 768px)').matches
        const target = viewRef.current === 'map' && desktop
            ? document.getElementById('experience')
            : document.getElementById(experienceAnchor(focusRequest.index))
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [focusRequest])
  return (
    <section ref={ref} id='experience' className='scroll-mt-28 mb-28 sm:mb-40 mt-5'>
        <SectionHeading>My Experience</SectionHeading>

        {/* The map needs room: it is only offered from the md breakpoint up. */}
        <div className='mb-6 hidden justify-center md:flex' role="group" aria-label="Experience display">
            {(['map', 'timeline'] as const).map((mode) => (
                <button
                    key={mode}
                    type="button"
                    aria-pressed={view === mode}
                    onClick={() => setView(mode)}
                    className={clsx(
                        'border px-5 py-2 text-sm capitalize transition first:rounded-l-full last:rounded-r-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
                        view === mode
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-black/[0.1] bg-white text-gray-700 hover:bg-gray-50'
                    )}
                >
                    {mode}
                </button>
            ))}
        </div>

        <div className={clsx('hidden', view === 'map' && 'md:block')}>
            <CareerMap jumpTo={focusRequest} />
        </div>

        <div className={clsx(view === 'map' && 'md:hidden')}>
        <VerticalTimeline  lineColor='rgba(0, 0, 0, 0.15)'>
            {
                experiencesData.map((experience,index) => (
                    <React.Fragment key={index}>
                        <VerticalTimelineElement
                            id={experienceAnchor(index)}
                            className='scroll-mt-28'
                            visible={hasAnimated ? true : inView}
                            contentStyle={{
                                background: "#f3f4f6",
                                boxShadow: "none",
                                border : "1px solid rgba(0,0,0,0.05)",
                                textAlign: "left",
                                padding : "1.3rem 2rem"
                            }}
                            contentArrowStyle={{
                                borderRight:"0.4rem solid #9ca3af"
                            }}
                            date={experience.date}
                            icon={experience.icon}
                            iconStyle={{
                                background :"white",
                                fontSize : "1.5rem"
                            }}
                        >
                            <h3 className='font-semibold capitalize'>
                                {experience.title}
                            </h3>
                            <p className='font-normal !mt-0'>
                                {experience.location}
                            </p>
                            <p className='!mt-1 !font-normal text-gray-700'>
                                {experience.description}
                            </p>
                        </VerticalTimelineElement>
                    </React.Fragment>
                ))
            }
        </VerticalTimeline>
        </div>
    </section>
  )
}
