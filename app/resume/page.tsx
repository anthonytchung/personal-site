import type { Metadata } from "next";
import Image from "next/image";
import { ExplorerLayout } from "@/components/content/explorer-layout";
import { getResumeFile, resumeHref } from "@/lib/resume";
import preview from "./resume-preview.png";
import styles from "./resume.module.css";

export const metadata: Metadata = { title: "Resume", description: "Anthony Chung's resume. View or download the PDF." };

export default async function Page() {
  const file = await getResumeFile();
  return <ExplorerLayout title="Resume" sectionHref="/resume" icon="resume" status={file ? "PDF · 1 page" : "PDF unavailable"}>
    <div className={styles.resume}>
      <h1>Resume</h1>
      {file ? <>
        <p className={styles.fileInfo}>PDF · 1 page · {Math.ceil(file.bytes / 1024)} KB</p>
        <nav className={styles.actions} aria-label="Resume actions">
          <a href={resumeHref}>View PDF</a>
          <a href={resumeHref} download="Anthony_Chung_Resume.pdf">Download PDF</a>
          <a href={resumeHref} target="_blank" rel="noopener noreferrer">Open in new tab <span aria-hidden="true">↗</span></a>
        </nav>
        <a className={styles.paper} href={resumeHref} aria-label="View Anthony Chung’s resume PDF">
          <Image src={preview} alt="Preview of Anthony Chung’s one-page resume. The PDF contains selectable text." sizes="(max-width: 700px) 100vw, 816px"/>
        </a>
      </> : <p>The resume PDF is not available yet.</p>}
    </div>
  </ExplorerLayout>;
}
