import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { Document } from "../db/schema";
import { getDocuments, deleteDocument as dbDelete } from "../db/operations";

interface DocumentsState {
  documents: Document[];
  loading: boolean;
}

type DocumentsAction =
  | { type: "SET_DOCUMENTS"; payload: Document[] }
  | { type: "ADD_DOCUMENT"; payload: Document }
  | { type: "REMOVE_DOCUMENT"; payload: number }
  | { type: "SET_LOADING"; payload: boolean };

function reducer(state: DocumentsState, action: DocumentsAction): DocumentsState {
  switch (action.type) {
    case "SET_DOCUMENTS":
      return { ...state, documents: action.payload, loading: false };
    case "ADD_DOCUMENT":
      return { ...state, documents: [action.payload, ...state.documents] };
    case "REMOVE_DOCUMENT":
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

interface DocumentsContextValue extends DocumentsState {
  refresh: () => Promise<void>;
  addDocument: (doc: Document) => void;
  removeDocument: (id: number) => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    documents: [],
    loading: true,
  });

  const refresh = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    const docs = await getDocuments();
    dispatch({ type: "SET_DOCUMENTS", payload: docs });
  }, []);

  const addDocument = useCallback((doc: Document) => {
    dispatch({ type: "ADD_DOCUMENT", payload: doc });
  }, []);

  const removeDocument = useCallback(
    async (id: number) => {
      await dbDelete(id);
      dispatch({ type: "REMOVE_DOCUMENT", payload: id });
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DocumentsContext.Provider
      value={{ ...state, refresh, addDocument, removeDocument }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments(): DocumentsContextValue {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}
