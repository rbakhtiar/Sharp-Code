
const ProjectManager = (() => {
  let currentProject = null;

  function createProject(name, location) {
    if (!name.trim()) {
      throw new Error("Project name is required");
    }

    currentProject = {
      name,
      location,
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      files: []
    };

    return currentProject;
  }

  function getProject() {
    return currentProject;
  }

  function closeProject() {
    currentProject = null;
  }

  function addFile(file) {
    if (!currentProject) return;

    currentProject.files.push(file);
  }

  return {
    createProject,
    getProject,
    closeProject,
    addFile
  };
})();

window.ProjectManager = ProjectManager;
