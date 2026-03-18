import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function RedactedBox({ text, onRedactedClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative inline-flex cursor-pointer select-none max-w-full"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                onRedactedClick?.();
            }}
            whileTap={{ scale: 0.97 }}
        >
            <div className="relative overflow-hidden rounded px-2 py-1 flex items-center justify-center min-w-[100px] sm:min-w-[140px] max-w-full h-7 w-full">
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
                    <motion.div
                        className="relative z-10 w-full px-1 box-border"
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            filter: isHovered ? 'blur(0px)' : 'blur(4px)',
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <div 
                            className="text-xs font-mono text-amber-300/90 overflow-hidden text-ellipsis whitespace-nowrap text-center" 
                            title={text}
                        >
                            {text}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Redacted label on black bar */}
                <motion.span
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-slate-600 tracking-widest uppercase pointer-events-none"
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    [REDACTED]
                </motion.span>
            </div>
        </motion.div>
    );
}
