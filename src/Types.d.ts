export interface User {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  credits?: number;
  password?: string;
  profileImage?: string;
}

export interface SideNavItem {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
}
