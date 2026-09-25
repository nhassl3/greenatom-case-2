import jetPaths from 'jet-paths'

const Paths = {
  _: '/api',
  Health: {
    _: "/health",
  },
  Equipment: {
    _: "/equipment",
    Get: "",
    Add: "",
    GetId: "/:id",
    Patch: "/:id",
    Delete: "/:id",
    GetRequests: "/:id/requests",
    GetWeather: "/:id/weather",
  },
  Requests: {
    _: "/requests",
    Get: "",
    Add: "",
    GetId: "/:id",
    Patch: "/:id",
    PatchStatus: "/:id/status",
    Delete: "/:id"
  }
} as const;

export const JetPaths = jetPaths(Paths);
export default Paths;
