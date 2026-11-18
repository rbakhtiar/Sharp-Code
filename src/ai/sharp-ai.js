
window.SharpAI = {
  initialized: false,

  initialize() {
    this.initialized = true;
    window.SharpConsole.log(
      "Sharp AI module loaded. Connect an AI provider to enable generation.",
      "success"
    );
  },

  async explainCode(code) {
    if (!code.trim()) {
      throw new Error("No code selected");
    }

    throw new Error("AI provider has not been configured");
  }
};
