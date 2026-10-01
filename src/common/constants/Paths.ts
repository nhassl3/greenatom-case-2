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
    Delete: "/:id",
    Bulk: "/bulk",
    Assignees: "/:id/assignees",
    Unassign: "/:id/assignees/:userId",
    History: "/:id/history",
  },
  Sites: {
    _: "/sites",
    Summary: "/:id/summary",
  },
  Reports: {
    _: "/reports",
    EquipmentLoad: "/equipment-load",
  },
} as const;

export const JetPaths = jetPaths(Paths);
export default Paths;
