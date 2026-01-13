'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const TimelineContent = ({
    children,
    animationNum = 0,
    timelineRef,
    customVariants,
    className,
    as = "div",
    ...props
}) => {
    const Component = motion(as)

    const defaultVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    }

    const variants = customVariants || defaultVariants

    return (
        <Component
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            custom={animationNum}
            className={cn(className)}
            {...props}
        >
            {children}
        </Component>
    )
}
