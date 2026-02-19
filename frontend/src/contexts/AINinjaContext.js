import React, { createContext, useContext, useState } from 'react';

const AINinjaContext = createContext();

export const useAINinja = () => {
    const context = useContext(AINinjaContext);
    if (!context) {
        throw new Error('useAINinja must be used within an AINinjaProvider');
    }
    return context;
};

export const AINinjaProvider = ({ children }) => {
    const [isChatOpen, setIsChatOpen] = useState(false); // Can be used for mobile overlay or general visibility
    const [jobContext, setJobContext] = useState(null);
    const [initialMessage, setInitialMessage] = useState(null);

    const openChatWithJob = (job, message = null) => {
        setJobContext(job);
        if (message) setInitialMessage(message);
        setIsChatOpen(true);
    };

    const clearJobContext = () => {
        setJobContext(null);
        setInitialMessage(null);
    };

    const toggleChat = () => setIsChatOpen(prev => !prev);

    return (
        <AINinjaContext.Provider value={{
            isChatOpen,
            setIsChatOpen,
            toggleChat,
            jobContext,
            setJobContext,
            initialMessage,
            setInitialMessage,
            openChatWithJob,
            clearJobContext
        }}>
            {children}
        </AINinjaContext.Provider>
    );
};
