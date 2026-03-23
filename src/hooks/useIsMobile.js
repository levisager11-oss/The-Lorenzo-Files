import { useState, useEffect } from 'react';

export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            const isNarrow = window.innerWidth < 768;

            // Check user agent string for mobile devices
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

            // If it's a mobile device or a narrow screen
            setIsMobile(isNarrow || isMobileDevice);
        };

        // Initial check
        checkIsMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkIsMobile);

        // Cleanup listener on unmount
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return isMobile;
}