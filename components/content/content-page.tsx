import type { ReactNode } from "react";
import styles from "./content.module.css";
import { ExplorerLayout } from "./explorer-layout";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import type { IconKind } from "@/components/desktop/desktop-icon";

type Props = {
  title: string;
  children: ReactNode;
  status?: string;
  sectionHref?: string;
  parents?: readonly { title: string; href: string }[];
  toolbar?: ReactNode;
  icon?: IconKind;
};

export function ContentPage({ title, children, status = title, sectionHref, parents, toolbar = title, icon }: Props) {
  const section = [...primaryNavigation, ...secondaryNavigation].find(item => item.label === title);
  return <ExplorerLayout title={title} sectionHref={sectionHref ?? section?.href ?? ""} parents={parents} toolbar={toolbar} status={status} icon={icon}>
    <div className={styles.content}><h1>{title}</h1>{children}</div>
  </ExplorerLayout>;
}
