// Shared by section navigation and, later, shortcuts and the Start menu.
export const primaryNavigation = [
  { href: "/projects", label: "Projects", summary: "Software projects and case studies" },
  { href: "/about", label: "About", summary: "Background, interests, and the story behind this desktop" },
  { href: "/blog", label: "Journal", summary: "Personal thoughts, technical writing, and things worth sharing" },
  { href: "/travellogs", label: "Travel Logs", summary: "Travel writing, study abroad reflections, and photography" },
  { href: "/resume", label: "Resume", summary: "Resume information" },
] as const;

export const secondaryNavigation = [
  { href: "/experience", label: "Experience", summary: "Professional history" },
  { href: "/contact", label: "Contact", summary: "Contact information" },
] as const;
