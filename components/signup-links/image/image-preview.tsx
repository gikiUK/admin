type Props = {
  src: string;
  alt: string;
};

export function ImagePreview({ src, alt }: Props) {
  // biome-ignore lint/performance/noImgElement: image is served from the API host, not the Next image loader
  return <img src={src} alt={alt} className="max-h-48 w-auto rounded-md border object-contain" />;
}
