import { Download } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";
import { identity } from "@profile";

/**
 * CV download. Renders nothing when `identity.cv` is unset, so removing the
 * file from the profile data removes every button in one edit.
 *
 * A plain `<a download>` rather than a scripted save: the browser handles it,
 * it works with middle-click and "save link as", and it degrades to opening the
 * PDF if the download attribute is ignored.
 */
export function DownloadCV({
  variant = "outline",
  size = "sm",
  showMeta = false,
  className,
}: {
  variant?: "outline" | "hero" | "default";
  size?: "sm" | "default" | "lg";
  showMeta?: boolean;
  className?: string;
}) {
  const cv = identity.cv;
  if (!cv) return null;

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Button asChild variant={variant} size={size}>
        <a href={cv.path} download={cv.filename}>
          <Download className="w-4 h-4" />
          Download CV
        </a>
      </Button>
      {showMeta && <span className="text-xs text-muted-foreground">{cv.meta}</span>}
    </span>
  );
}
