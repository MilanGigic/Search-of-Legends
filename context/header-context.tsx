"use client";

import { createContext, useContext, useState } from "react";

type HeaderContextType = {
  showSearchForm: boolean;
  setShowSearchForm: (show: boolean) => void;
};

const HeaderContext = createContext<HeaderContextType>({
  showSearchForm: false,
  setShowSearchForm: () => {},
});

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [showSearchForm, setShowSearchForm] = useState(false);

  return (
    <HeaderContext.Provider value={{ showSearchForm, setShowSearchForm }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);
