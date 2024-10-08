"use client"

import React from 'react'
import {motion} from "framer-motion"

export default function SectionDevider() {
  return (
    <motion.div
      className='my-16 h-[16rem] w-1 rounded-full hidden sm:block'
      initial={{opacity : 0 , y : 100}}
      animate={{opacity : 1 , y : 0}}
      transition={{delay : 0.125}}
    ></motion.div>
  )
}
