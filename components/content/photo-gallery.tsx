"use client";
import { useContext } from "react";
import Image from "next/image";
import { PhotoActions } from "@/components/apps/photo-actions";
import { validatePhotos, type Photo } from "@/lib/photos";
import styles from "./photo-gallery.module.css";

export function PhotoGallery({ photos, label = "Photographs" }: { photos: readonly Photo[]; label?: string }) {
  validatePhotos(photos);
  const open = useContext(PhotoActions);
  return <div className={styles.gallery} role="group" aria-label={label}>
    {photos.map((photo, index) => <figure key={`${photo.src}-${index}`}>
      <a href={photo.src} aria-haspopup="dialog" aria-controls="photo-viewer-window" aria-label={`View photograph: ${photo.alt}`} onClick={event => {
        if (!open || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        open(photos, index, event.currentTarget);
      }}><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} unoptimized/></a>
      {photo.caption && <figcaption>{photo.caption}</figcaption>}
    </figure>)}
  </div>;
}
