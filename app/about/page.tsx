import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About", description: "Meet me and the family Windows 7 computer that sparked my interest in technology." };

export default function Page() {
  return (
    <ContentPage title="About" icon="about" status="Biography & background">
      <div className={styles.about}>
        <header className={styles.introduction}>
          <p className={styles.eyebrow}>The person behind the desktop</p>
          <h2>Hi, I’m Anthony.</h2>
          <p className={styles.lead}>I build software, explore new ideas, and do things for the fun of it.</p>
          <p>This is a website meant to be my living homepage, trying to capture my most important digital footprint. </p>
        </header>

        <section id="why-windows-7" className={styles.origin} aria-labelledby="origin-title">
          <p className={styles.eyebrow}>Where it started</p>
          <h2 id="origin-title">Why Windows 7?</h2>
          <p>My interest in technology began at home, watching my father use our family Windows 7 computer. He seemed like a wizard in navigating the web and using this magical technology. This curiosity led me to pursue software and learning sciences later on. </p>
          <p>That’s why this site looks like a desktop from years ago. It hopefully adds a bit of charm and serves as a little bit of a tribute to the computer that started it all. </p>
        </section>

        <section aria-labelledby="personal-title">
          <h2 id="personal-title">A little more of the picture</h2>
          <p>There’s room here for more than the work. These parts of the story are still being filled in.</p>
          <div className={styles.notes}>
            <section className={styles.note} aria-labelledby="background-title">
              <span className={styles.placeholder}>Development placeholder</span>
              <h3 id="background-title">My background</h3>
              <p>I've always really been interested in both people and technology, and the intersection between them. My sentimentality and curiosity are also big driving forces in my life, and the reason why I am where I am today. </p>
            </section>
            <section className={styles.note} aria-labelledby="interests-title">
              <span className={styles.placeholder}>Development placeholder</span>
              <h3 id="interests-title">Away from the keyboard</h3>
              <p>Going down rabbit holes and learning about new topics is something I enjoy doing with a large part of my free time. The wealth of domain knowledge that's granted by access to the internet is something I deeply appreciate in modernity. Watching movies, watching the NBA (shoutout Sixers and Wizards) and keeping up to date on current news is a large part of my day-to-day.</p>
            </section>
          </div>
        </section>

        <section className={styles.photo} aria-labelledby="photo-title">
          <div className={styles.photoFrame} aria-hidden="true"><span>Photo to come</span></div>
          <div>
            <span className={styles.placeholder}>Development placeholder</span>
            <h2 id="photo-title">Space for a personal snapshot</h2>
            <p>A future photograph and its story will live here, adding another personal detail to this desktop.</p>
          </div>
        </section>
      </div>
    </ContentPage>
  );
}
