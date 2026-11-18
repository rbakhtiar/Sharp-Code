
window.ProjectManager = (() => {
  let project = null;

  function setProject(data) {
    project = {
      name: data.name,
      path: data.path,
      openedAt: new Date().toISOString()
    };
  }

  function getProject() {
    return project;
  }

  function closeProject() {
    project = null;
  }

  function isOpen() {
    return project !== null;
  }

  return {
    setProject,
    getProject,
    closeProject,
    isOpen
  };
})();
