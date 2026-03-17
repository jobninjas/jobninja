"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useOnClickOutside } from "usehooks-ts"

// SVG Icons ported from the TSX component
export const Resend = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 600 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M186 447.471V154H318.062C336.788 154 353.697 158.053 368.79 166.158C384.163 174.263 396.181 185.443 404.845 199.698C413.51 213.672 417.842 229.604 417.842 247.491C417.842 265.938 413.51 282.568 404.845 297.381C396.181 311.915 384.302 323.375 369.209 331.759C354.117 340.144 337.067 344.337 318.062 344.337H253.917V447.471H186ZM348.667 447.471L274.041 314.99L346.99 304.509L430 447.471H348.667ZM253.917 289.835H311.773C319.04 289.835 325.329 288.298 330.639 285.223C336.229 281.869 340.421 277.258 343.216 271.388C346.291 265.519 347.828 258.811 347.828 251.265C347.828 243.718 346.151 237.15 342.797 231.56C339.443 225.691 334.552 221.219 328.124 218.144C321.975 215.07 314.428 213.533 305.484 213.533H253.917V289.835Z"
      fill="inherit"
    />
  </svg>
)

export const Turso = (props) => (
  <svg
    fill="none"
    height="1em"
    viewBox="0 0 201 170"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m100.055 170c-2.1901 0-18.2001-12.8-21.3001-16.45-2.44 3.73-6.44 7.96-6.44 7.96-11.05-5.57-25.17-20.06-27.83-25.13-2.62-5-12.13-62.58-12.39-79.3-.34-9.41 5.85-28.49 67.9601-28.49 62.11 0 68.29 19.08 67.96 28.49-.25 16.72-9.76 74.3-12.39 79.3-2.66 5.07-16.78 19.56-27.83 25.13 0 0-4-4.23-6.44-7.96-3.1 3.65-19.11 16.45-21.3 16.45z"
      fill="#1ebca1"
    />
    <path
      d="m100.055 132.92c-20.7301 0-33.9601-10.95-33.9601-10.95l1.91-26.67-21.75-1.94-3.91-31.55h115.4301l-3.91 31.55-21.75 1.94 1.91 26.67s-13.23 10.95-33.96 10.95z"
      fill="#183134"
    />
    <path
      d="m121.535 75.79 78.52-27.18c-4.67-27.94-29.16-48.61-29.16-48.61v30.78l-14.54 3.75-9.11-10.97-7.8 15.34-39.38 10.16-39.3801-10.16-7.8-15.34-9.11 10.97-14.54-3.75v-30.78s-24.50997 20.67-29.1799684 48.61l78.5199684 27.18-2.8 37.39c6.7 1.7 13.75 3.39 24.2801 3.39 10.53 0 17.57-1.69 24.27-3.39l-2.8-37.39z"
      fill="#4ff8d2"
    />
  </svg>
)

export const Supabase = (props) => (
  <svg
    viewBox="0 0 109 113"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
      fill="url(#paint0_linear)"
    />
    <path
      d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
      fill="url(#paint1_linear)"
      fillOpacity={0.2}
    />
    <path
      d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z"
      fill="#3ECF8E"
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1={53.9738}
        y1={54.974}
        x2={94.1635}
        y2={71.8295}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#249361" />
        <stop offset={1} stopColor="#3ECF8E" />
      </linearGradient>
      <linearGradient
        id="paint1_linear"
        x1={36.1558}
        y1={30.578}
        x2={54.4844}
        y2={65.0806}
        gradientUnits="userSpaceOnUse"
      >
        <stop />
        <stop offset={1} stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
)

export default function JobListingComponent({
  jobs,
  className,
  onJobClick,
}) {
  const [activeItem, setActiveItem] = useState(null)
  const ref = useRef(null)
  useOnClickOutside(ref, () => setActiveItem(null))

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActiveItem(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className={`relative w-full ${className || ""}`}>
      <AnimatePresence>
        {activeItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md pointer-events-auto"
            onClick={() => setActiveItem(null)}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {activeItem ? (
          <div className="fixed inset-0 z-[60] grid place-items-center p-4 pointer-events-none">
            <motion.div
              className="bg-white flex h-fit w-full max-w-lg cursor-default flex-col items-start gap-4 overflow-hidden border p-6 shadow-2xl pointer-events-auto"
              ref={ref}
              layoutId={`workItem-${activeItem.company}-${activeItem.id || activeItem.title}`}
              style={{ borderRadius: 16 }}
            >
              <div className="flex w-full items-center gap-4">
                <motion.div layoutId={`workItemLogo-${activeItem.company}-${activeItem.id || activeItem.title}`} className="w-12 h-12 flex-shrink-0">
                  {activeItem.logo}
                </motion.div>
                <div className="flex grow items-center justify-between min-w-0">
                  <div className="flex w-full flex-col gap-0.5 min-w-0">
                    <motion.div
                      layoutId={`workItemTitle-${activeItem.company}-${activeItem.id || activeItem.title}`}
                      className="text-gray-900 text-lg font-bold truncate"
                    >
                      {activeItem.title} {activeItem.salary && ` / ${activeItem.salary}`}
                    </motion.div>
                    <motion.p
                      className="text-gray-600 font-medium truncate"
                      layoutId={`workItemCompany-${activeItem.company}-${activeItem.id || activeItem.title}`}
                    >
                      {activeItem.company}
                    </motion.p>
                    <motion.div
                      className="text-gray-500 flex flex-row gap-2 text-xs"
                      layoutId={`workItemExtras-${activeItem.company}-${activeItem.id || activeItem.title}`}
                    >
                      <span>{activeItem.location}</span>
                      {activeItem.remote && <span> | {activeItem.remote}</span>}
                      <span> | {activeItem.job_time}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="text-gray-600 text-sm leading-relaxed mt-2 max-h-[60vh] overflow-y-auto pr-2"
              >
                {activeItem.job_description}
              </motion.div>
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full pt-4 mt-auto border-t border-gray-100 flex justify-end gap-3"
              >
                 <button 
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onJobClick) onJobClick(activeItem);
                  }}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                >
                  View Details
                </button>
              </motion.div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {jobs.map((role) => (
          <motion.div
            layoutId={`workItem-${role.company}-${role.id || role.title}`}
            key={role.id || role.company + role.title}
            className="group bg-white flex w-full cursor-pointer flex-col p-4 shadow-sm hover:shadow-md border border-gray-100 transition-shadow relative overflow-hidden"
            onClick={() => onJobClick(role)}
            style={{ borderRadius: 12 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <motion.div layoutId={`workItemLogo-${role.company}-${role.id || role.title}`} className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-lg p-1.5 flex items-center justify-center">
                {role.logo}
              </motion.div>
              <div className="flex flex-col min-w-0 flex-1">
                <motion.div
                  className="text-gray-900 font-bold text-sm truncate"
                  layoutId={`workItemTitle-${role.company}-${role.id || role.title}`}
                >
                  {role.title}
                </motion.div>
                <motion.div
                  className="text-gray-600 text-[13px] font-medium line-clamp-1"
                  layoutId={`workItemCompany-${role.company}-${role.id || role.title}`}
                >
                  {role.company}
                </motion.div>
              </div>
            </div>

            <div className="mt-auto pt-2 border-t border-gray-50">
              <motion.div
                className="text-gray-400 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-medium"
                layoutId={`workItemExtras-${role.company}-${role.id || role.title}`}
              >
                <span className="truncate max-w-[120px]">{role.location}</span>
                <span className="text-gray-200">•</span>
                <span>{role.job_time}</span>
                {role.salary && (
                  <>
                    <span className="text-gray-200">•</span>
                    <span className="text-emerald-600 font-bold">{role.salary}</span>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
