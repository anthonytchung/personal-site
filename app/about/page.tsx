import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About", description: "Meet Anthony and the family Windows 7 computer that sparked his interest in technology." };

export default function Page() {
  return (
    <ContentPage title="About" icon="about" status="Biography & background">
      <div className={styles.about}>
        <header className={styles.introduction}>
          <p className={styles.eyebrow}>The person behind the desktop</p>
          <h2>Hey, I’m Anthony.</h2>
          <p className={styles.lead}>I build software, explore ideas, and make things for the fun of it.</p>
          <p>Welcome to my little corner of the internet. This is a personal digital home: a place for projects, writing, and travels, with a familiar desktop to hold it all.</p>
        </header>

        <section id="why-windows-7" className={styles.origin} aria-labelledby="origin-title">
          <p className={styles.eyebrow}>Where it started</p>
          <h2 id="origin-title">Why Windows 7?</h2>
          <p>My interest in technology began at home, watching my father use our family Windows 7 computer. Watching him work sparked a curiosity that eventually led me to learn to develop software.</p>
          <p>That’s why this site looks like a desktop. It’s a tribute to the computer that started it all, now filled with things of my own. The familiar windows are part of the story.</p>
        </section>

        <section aria-labelledby="personal-title">
          <h2 id="personal-title">A little more of the picture</h2>
          <p>There’s room here for more than the work. These parts of the story are still being filled in.</p>
          <div className={styles.notes}>
            <section className={styles.note} aria-labelledby="background-title">
              <span className={styles.placeholder}>Development placeholder</span>
              <h3 id="background-title">My background</h3>
              <p>A personal introduction to my background and the places that have shaped me will go here.</p>
            </section>
            <section className={styles.note} aria-labelledby="interests-title">
              <span className={styles.placeholder}>Development placeholder</span>
              <h3 id="interests-title">Away from the keyboard</h3>
              <p>Favorite interests, everyday pursuits, and a few personal details will go here.</p>
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
