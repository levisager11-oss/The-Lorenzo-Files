import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RedactedBox({ text, onRedactedClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative inline-block cursor-pointer select-none"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                onRedactedClick?.();
            }}
            whileTap={{ scale: 0.97 }}
        >
            <div className="relative overflow-hidden rounded px-3 py-1 min-w-[180px]">
                {/* The black bar */}
                <motion.div
                    className="absolute inset-0 bg-black rounded"
                    animate={{
                        opacity: isHovered ? 0 : 1,
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                />

                {/* Revealed text */}
                <AnimatePresence>
                    <motion.span
                        className="relative z-10 text-xs font-mono text-amber-300/90 whitespace-nowrap"
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            filter: isHovered ? 'blur(0px)' : 'blur(4px)',
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {text}
                    </motion.span>
                </AnimatePresence>

                {/* Redacted label on black bar */}
                <motion.span
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-slate-600 tracking-widest uppercase"
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    [REDACTED]
                </motion.span>
            </div>
        </motion.div>
    );
}
