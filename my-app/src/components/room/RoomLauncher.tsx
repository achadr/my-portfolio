"use client"
import React from 'react'
import { BsBoxSeam } from 'react-icons/bs'
import { useRoom } from '../../../context/room'

/**
 * "Explore in 3D" button for the intro. The room is an optional way in: every
 * object leads to a real section of the page. Hidden on small screens, where
 * the regular page is the better experience. The room itself lives in the
 * shared room context, so other parts of the page can open it too.
 */
export default function RoomLauncher() {
    const { openRoom } = useRoom()

    return (
        <button
            type="button"
            onClick={() => openRoom()}
            className="group hidden items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3 text-lg font-medium outline-none transition hover:scale-110 focus:scale-110 active:scale-105 md:flex"
        >
            Explore in 3D <BsBoxSeam className="opacity-60 transition group-hover:rotate-12" />
        </button>
    )
}
