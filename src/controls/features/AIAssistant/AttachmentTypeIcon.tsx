import {
  AudioWaveformIcon,
  CodeIcon,
  DatabaseIcon,
  FileIcon,
  ImageIcon,
  TextIcon,
  VideoIcon,
} from "lucide-react";

export default function AttachmentTypeIcon({
  type,
  className,
}: { type?: string; className?: string }) {
  switch (type) {
    case "application/pdf":
    case "text/plain":
    case "text/markdown":
      return <TextIcon className={className} />;
    case "image/png":
    case "image/jpeg":
    case "image/gif":
    case "image/webp":
      return <ImageIcon className={className} />;
    case "video/mp4":
    case "video/webm":
      return <VideoIcon className={className} />;
    case "audio/mpeg":
    case "audio/wav":
    case "audio/ogg":
      return <AudioWaveformIcon className={className} />;
    case "text/html":
    case "text/css":
    case "text/javascript":
      return <CodeIcon className={className} />;
    case "application/json":
    case "application/xml":
    case "application/javascript":
      return <DatabaseIcon className={className} />;
    default:
      return <FileIcon className={className} />;
  }
}
