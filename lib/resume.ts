import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";

export const resumeHref = "/documents/anthony-chung-resume.pdf";

export async function getResumeFile() {
  "use cache";
  try {
    const file = await stat(path.join(process.cwd(), "public", resumeHref));
    return file.isFile() && file.size > 0 ? { bytes: file.size } : null;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}
