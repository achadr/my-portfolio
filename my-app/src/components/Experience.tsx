"use client"

import React, {useEffect,useState} from 'react'

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
    const {ref, inView} = useSectionInView("Experience",0.55)
    const [hasAnimated, setHasAnimated] = useState(false);



    useEffect(() => { if (inView && !hasAnimated) { setHasAnimated(true); } }, [inView]);
  return (
    <section ref={ref} id='experience' className='scroll-mt-28 mb-28 sm:mb-40 mt-5'>
        <SectionHeading>My Experience</SectionHeading>
        <VerticalTimeline  lineColor=''>
            {
                experiencesData.map((experience,index) => (
                    <React.Fragment key={index}>
                        <VerticalTimelineElement
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
    </section>
  )
}
