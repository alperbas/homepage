import semaphoreProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/project/3/{endpoint}/last",
  loginURL: "{url}/api/auth/login",
  proxyHandler: semaphoreProxyHandler,

  mappings: {
    tasks: {
      endpoint: "tasks",
      validate: ["running", "error", "success"],
    },
  },
};

export default widget;
