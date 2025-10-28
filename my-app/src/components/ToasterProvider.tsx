"use client"

import { Toaster } from "react-hot-toast"

export default function ToasterProvider() {
  return (
    <div suppressHydrationWarning>
      <Toaster position="top-right" />
    </div>
  )
}
