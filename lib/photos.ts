export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  caption?: string;
  location?: string;
  takenAt?: string;
  camera?: string;
};

export function validatePhotos(photos: readonly Photo[]) {
  if (!photos.length) throw new Error("PhotoGallery needs at least one photograph.");
  for (const photo of photos) {
    if (typeof photo.src !== "string" || !photo.src.startsWith("/images/") || photo.src.split("/").includes("..")) throw new Error("PhotoGallery photographs must use local /images/ paths.");
    if (typeof photo.alt !== "string" || !photo.alt.trim()) throw new Error("Every PhotoGallery photograph needs descriptive alt text.");
    if (![photo.width, photo.height].every(value => Number.isInteger(value) && value > 0)) throw new Error("PhotoGallery needs each photograph's actual pixel width and height.");
  }
}

export function photoTitle(photo: Photo) {
  return photo.title || photo.src.split("/").at(-1) || "Photograph";
}
