"use client"
import React, {useRef} from 'react'
import Image from 'next/image'
import { projectsData } from '../../lib/data'
import { useScroll,motion, useTransform } from 'framer-motion'

type ProjectProps = typeof projectsData[number]
export default function Project({
    title,
    description,
    tags,
    imageUrl,
    url
} : ProjectProps) {
    const ref = useRef<HTMLDivElement>(null)
    const {scrollYProgress} = useScroll({
        target: ref,
        offset: ["0 1", "1.33 1"]
    });
    const scaleProgress = useTransform(scrollYProgress,[0,1],[0.7,1])
    const opacityProgress = useTransform(scrollYProgress,[0,1],[0.6,1])
    return (
        <motion.div
            className='group mb-3 sm:mb-6 last:mb-0'
            ref={ref}
            style={{
                scale: scaleProgress,
                opacity: opacityProgress
            }}
            >
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='block cursor-pointer'
                        aria-label={`View ${title} project (opens in new tab)`}
                    >
                        <section
                            className='bg-gray-100 border border-black/5 rounded-lg overflow-hidden hover:bg-gray-200 transition
                                       w-full max-w-[42rem] mx-auto
                                       flex flex-col
                                       sm:flex-row sm:h-[20rem]
                                       group-even:sm:flex-row-reverse'>

                            {/* Content Section */}
                            <div className="pt-4 pb-6 px-5
                                            sm:w-1/2 sm:pt-8 sm:pb-8 sm:px-6
                                            md:pt-10 md:px-8
                                            flex flex-col justify-between">
                                <div>
                                    <h3 className='text-xl font-semibold
                                                   sm:text-2xl'>
                                        {title}
                                    </h3>
                                    <p className='mt-2 text-sm leading-relaxed text-gray-700
                                                  sm:text-base sm:mt-3'>
                                        {description}
                                    </p>
                                </div>
                                <ul className='flex flex-wrap mt-4 gap-2
                                               sm:mt-6'>
                                    {tags.map((tag,index) => (
                                        <li className='bg-black/[0.7] px-3 py-1 text-[0.65rem] uppercase tracking-wider text-white rounded-full
                                                       sm:text-[0.7rem]'
                                            key={index}>
                                            {tag}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Image Section */}
                            <div className="relative w-full h-48
                                            sm:w-1/2 sm:h-full
                                            overflow-hidden">
                                <Image
                                    className='w-full h-full object-cover object-top
                                               group-hover:scale-[1.04]
                                               group-hover:-translate-x-3
                                               group-hover:translate-y-3
                                               group-hover:-rotate-2
                                               group-even:group-hover:translate-x-3
                                               group-even:group-hover:translate-y-3
                                               group-even:group-hover:rotate-2
                                               transition duration-300'
                                    src={imageUrl}
                                    alt={`${title} project screenshot`}
                                    quality={75}
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                />
                            </div>
                        </section>
                    </a>
        </motion.div>

    )
}