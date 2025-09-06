import { createContext, useContext, useEffect, useState } from "react";
import { getItem, setItem } from "../lib/storage";

const STORAGE_KEY = "rest-client-variables";

export interface Variable {
  name: string;
  value: string;
}

interface VariableContextType {
  variables: Record<string, string>;
  addVariable: (name: string, value: string) => void;
  editVariable: (name: string, value: string) => void;
  deleteVariable: (name: string) => void;
}

const VariableContext = createContext<VariableContextType>({
  variables: {},
  addVariable: () => {},
  editVariable: () => {},
  deleteVariable: () => {},
});

export const VariableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = getItem<Record<string, string>>(STORAGE_KEY);
    if (stored) setVariables(stored);
  }, []);

  const addVariable = (name: string, value: string) => {
    setVariables((prev) => {
      const updated = { ...prev, [name]: value };
      setItem(STORAGE_KEY, updated);
      return updated;
    });
  };

  const editVariable = (name: string, value: string) => {
    setVariables((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev, [name]: value };
      setItem(STORAGE_KEY, updated);
      return updated;
    });
  };

  const deleteVariable = (name: string) => {
    setVariables((prev) => {
      const updated = { ...prev };
      delete updated[name];
      setItem(STORAGE_KEY, updated);
      return updated;
    });
  };

  return (
    <VariableContext.Provider
      value={{ variables, addVariable, editVariable, deleteVariable }}
    >
      {children}
    </VariableContext.Provider>
  );
};

export const useVariableContext = () => useContext(VariableContext);
