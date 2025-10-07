import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route("profile", "routes/profile.tsx"),
  route("settings", "routes/settings.tsx"),
  route("flowise", "routes/flowise.tsx"),
  route("chats", "routes/chats.tsx"),
] satisfies RouteConfig;
