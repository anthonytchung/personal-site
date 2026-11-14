import Link from "next/link";
import { ContentPage } from "@/components/content/content-page";

export default function NotFound() {
  return <ContentPage title="Page not found"><p>This page could not be found.</p><Link href="/">Return to Desktop</Link></ContentPage>;
}
