import { createContext, useState, useContext } from "react";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([
    { id: 1, name: "Website Redesign", deadline: "2025-12-15", progress: 70 },
    { id: 2, name: "Mobile App", deadline: "2025-11-30", progress: 45 },
  ]);

  return (
    <ProjectContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
