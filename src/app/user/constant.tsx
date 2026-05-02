import { SideNavItem } from "@/Types";
import {
  IconLayoutDashboard,
  IconMessageChatbot,
  IconVideo,
  IconLibrary,
  IconClock,
  IconChartBar,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/user/dashboard",
    icon: <IconLayoutDashboard width="22" height="22" />,
  },
  {
    title: "Create Video",
    path: "/user/create",
    icon: <IconMessageChatbot width="22" height="22" />,
  },
  {
    title: "My Videos",
    path: "/user/videos",
    icon: <IconVideo width="22" height="22" />,
  },
  {
    title: "Settings",
    path: "/user/settings",
    icon: <IconSettings width="22" height="22" />,
  },
];
