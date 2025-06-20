import { createContext } from "react";

interface contextType {
    getParticipants: () => void;
}

export const participantsContext = createContext<contextType | null>(null); 