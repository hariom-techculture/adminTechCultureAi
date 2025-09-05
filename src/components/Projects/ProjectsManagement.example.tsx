// Example usage of ProjectForm in your admin panel

import { ProjectForm } from "@/components/Projects/ProjectForm";
import { useState } from "react";

export default function ProjectsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleAddProject = () => {
    setSelectedProject(null);
    setShowForm(true);
  };

interface Project {
    _id?: string;
    title: string;
    description: string;
    category: string;
    location?: string;
    technologies: string[];
    status: string;
    image?: string;
    portfolioImages?: string[];
}

const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowForm(true);
};

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProject(null);
    // Optionally refresh project list here
  };

  return (
    <div>
      {showForm && (
        <ProjectForm
          project={selectedProject}
          onClose={handleCloseForm}
        />
      )}
      
      {/* Your existing projects list and management UI */}
    </div>
  );
}
