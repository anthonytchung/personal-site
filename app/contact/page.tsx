import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import { contact } from "@/lib/contact";
import { CopyEmail } from "./copy-email";
import styles from "./contact.module.css";

export const metadata: Metadata = { title: "Contact", description: "Email Anthony Chung or find him on LinkedIn and GitHub." };

function ContactIcon({ kind }: { kind: "email" | "linkedin" | "github" }) {
  return <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none">
    {kind === "email" ? <><rect x="2" y="5" width="24" height="18" rx="2" fill="#edf6fc" stroke="#6388a5"/><path d="m3 7 11 9L25 7M3 22l8-8m14 8-8-8" stroke="#6388a5"/></> : kind === "linkedin" ? <><rect x="1" y="1" width="26" height="26" rx="3" fill="#28678c"/><text x="5" y="21" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="21" fill="white">in</text></> : <><circle cx="14" cy="14" r="13" fill="#344957"/><path d="M8 12 7 6l6 3h2l6-3-1 6c3 6-1 9-6 9s-9-3-6-9Z" fill="white"/><path d="M14 20v7m-2-4c-6 1-4-4-7-4" stroke="white" strokeWidth="2"/></>}
  </svg>;
}

export default function Page() {
  return <ContentPage title="Contact" icon="about" status="Email · LinkedIn · GitHub">
    <div className={styles.contact}>
      <a className={styles.email} href={`mailto:${contact.email}`}><ContactIcon kind="email"/><span>{contact.email}</span></a>
      <CopyEmail email={contact.email}/>
      <ul className={styles.profiles}>
        {contact.profiles.map(profile => <li key={profile.name}>
          <a href={profile.href} target="_blank" rel="noopener noreferrer"><ContactIcon kind={profile.icon}/><span><strong>{profile.name}</strong><span>{profile.label}</span></span><span className={styles.external} aria-hidden="true">↗</span></a>
        </li>)}
      </ul>
    </div>
  </ContentPage>;
}
