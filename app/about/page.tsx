import type { Metadata } from "next";
import { ExplorerLayout } from "@/components/content/explorer-layout";
import { AboutComputerButton } from "@/components/apps/utility-actions";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About", description: "Meet Anthony: software, people, curiosity, and life away from the keyboard." };

export default function Page() {
  return <ExplorerLayout title="About" sectionHref="/about" icon="about" status="Biography & background">
    <article className={styles.about}>
      <header className={styles.introduction}>
        <p className={styles.eyebrow}>The person behind the desktop</p>
        <h1>About</h1>
        <h2>Hi, I’m Anthony.</h2>
        <p className={styles.lead}>I build software, explore new ideas, and do things for the fun of it.</p>
      </header>
      <div className={styles.chapters}>
        <section aria-labelledby="background-title">
          <h2 id="background-title">People & technology</h2>
          <p>I&apos;ve always really been interested in both people and technology, and the intersection between them. My sentimentality and curiosity are also big driving forces in my life, and the reason why I am where I am today.</p>
          <p>My early curiosity about technology led me to pursue software and learning sciences.</p>
        </section>
        <section aria-labelledby="interests-title">
          <h2 id="interests-title">Away from the keyboard</h2>
          <p>Going down rabbit holes and learning about new topics is something I enjoy doing with a large part of my free time. The wealth of domain knowledge that&apos;s granted by access to the internet is something I deeply appreciate in modernity.</p>
          <p>Watching movies, watching the NBA (shoutout Sixers and Wizards) and keeping up to date on current news is a large part of my day-to-day.</p>
        </section>
      </div>
      <section id="why-windows-7" className={styles.origin} aria-labelledby="origin-title">
        <h2 id="origin-title">Why Windows 7?</h2>
        <p>This desktop is a tribute to the family computer that first sparked my interest in technology.</p>
        <AboutComputerButton>Open About This Computer</AboutComputerButton>
      </section>
      {/* Add an approved personal photograph and caption here when supplied.
          Further education/work specifics require Anthony's input. No stock photo or invented biography. */}
    </article>
  </ExplorerLayout>;
}
