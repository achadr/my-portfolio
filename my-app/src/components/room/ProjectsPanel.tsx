"use client"
import React from 'react'
import Image from 'next/image'
import { projectsData } from '../../../lib/data'

/** The four projects as cards, for the panel that opens from the monitor. */
export default function ProjectsPanel() {
    return (
        <ul className="grid gap-4 sm:grid-cols-2">
            {projectsData.map((project) => (
                <li key={project.title} className="flex flex-col overflow-hidden rounded-xl border border-black/10 bg-gray-50">
                    <Image
                        src={project.imageUrl}
                        alt={`${project.title} project screenshot`}
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="aspect-[16/10] w-full object-cover object-top"
                    />
                    <div className="flex flex-1 flex-col gap-3 p-4">
                        <div>
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-gray-700">{project.description}</p>
                        </div>
                        <ul className="flex flex-wrap gap-1.5">
                            {project.tags.map((tag) => (
                                <li key={tag} className="rounded-full bg-black/[0.7] px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-white">
                                    {tag}
                                </li>
                            ))}
                        </ul>
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex w-fit items-center rounded-full bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                        >
                            Open the project ↗
                        </a>
                    </div>
                </li>
            ))}
        </ul>
    )
}
