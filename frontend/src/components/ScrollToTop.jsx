import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Try immediate scroll
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);

        // Add a very short delay to ensure rendering is complete 
        // and browser's internal scroll restoration is overriden correctly
        const timeoutId = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            document.documentElement.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
        }, 10);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
