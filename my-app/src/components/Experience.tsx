"use client"

import React from 'react'

import SectionHeading from './SectionHeading'
import {
    VerticalTimeline,
    VerticalTimelineElement,
  } from "react-vertical-timeline-component";
  import "react-vertical-timeline-component/style.min.css";
  import { experiencesData } from "../../lib/data";
  import { useSectionInView } from "../../lib/hooks";
//   import { useTheme } from "@/context/theme-context";

export default function Experience() {
    const {ref, inView} = useSectionInView("Experience",0.3)
  return (
    <section ref={ref} id='experience'>
        <SectionHeading>My Experience</SectionHeading>
        <VerticalTimeline animate={inView} lineColor=''>
            {
                experiencesData.map((experience,index) => (
                    <React.Fragment key={index}>
                        <VerticalTimelineElement
                            visible={inView}
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
                                "helllo"
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
    </section>
  )
}
