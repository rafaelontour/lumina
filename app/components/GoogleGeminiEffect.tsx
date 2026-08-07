"use client";

import { motion } from "motion/react";

const feixes = [
    {
        d: "M-940 280C-690 214 -430 174 -166 188C130 204 358 148 642 118C930 88 1168 70 1450 92C1638 106 1762 80 1920 46",
        stroke: "#4285f4",
    },
    {
        d: "M-980 220C-716 176 -480 142 -204 158C120 178 326 260 646 232C946 206 1148 132 1432 116C1632 104 1766 126 1940 86",
        stroke: "#34a853",
    },
    {
        d: "M-930 324C-678 270 -414 222 -138 230C174 238 390 306 704 282C1012 258 1218 190 1502 184C1682 180 1812 148 1960 118",
        stroke: "#fbbc04",
    },
    {
        d: "M-1000 144C-734 122 -494 84 -230 96C70 110 300 68 592 82C884 96 1092 150 1380 112C1602 82 1768 58 1950 28",
        stroke: "#ea4335",
    },
    {
        d: "M-900 348C-650 298 -404 242 -122 212C184 180 434 166 740 174C1052 182 1248 120 1540 76C1720 50 1846 48 1990 18",
        stroke: "#a142f4",
    },
];

type GoogleGeminiEffectProps = {
    delay?: number;
};

export default function GoogleGeminiEffect({ delay = 0 }: GoogleGeminiEffectProps) {
    return (
        <svg
            className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-80 w-full -translate-y-1/2 opacity-70 dark:opacity-55"
            viewBox="-900 -40 2840 440"
            fill="none"
            aria-hidden="true"
        >
            <defs>
                <filter id="gemini-glow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {feixes.map((feixe, indice) => (
                <motion.path
                    key={feixe.d}
                    d={feixe.d}
                    stroke={feixe.stroke}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    filter="url(#gemini-glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 0.35, 1, 1],
                        opacity: [0, 0.9, 0.45, 0.16],
                        pathOffset: [0, 0, 0.08, 0.18],
                    }}
                    transition={{
                        duration: 4.8,
                        delay: delay + indice * 0.12,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 0.35,
                    }}
                />
            ))}

            <motion.circle
                cx="660"
                cy="174"
                r="4"
                fill="currentColor"
                className="text-brand dark:text-white"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0.65, 0.15], scale: [0.4, 1.8, 0.9] }}
                transition={{ duration: 3.2, delay, ease: "easeInOut", repeat: Infinity }}
            />
        </svg>
    );
}
