// Shared by section navigation and, later, shortcuts and the Start menu.
export const primaryNavigation = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Journal" },
  { href: "/travellogs", label: "Travel Logs" },
  { href: "/resume", label: "Resume" },
] as const;

export const secondaryNavigation = [
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
] as const;
