import { createContext, useState } from "react";

export const ChannelContext = createContext({
    page: 1,
    setPage: () => {},
    messages: [],
    setMessages: () => {}
})

export const ChannelProvider = ({ children }) => {
    const [page, setPage] = useState(1);
    return (
      <ChannelContext.Provider value={{ page, setPage }}>
        {children}
      </ChannelContext.Provider>
    );
  };