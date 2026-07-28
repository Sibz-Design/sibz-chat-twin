import { useRef, useState, useEffect, type ReactNode } from "react";

interface HeaderProps {
  translateY: number;
  titleComponent: ReactNode;
}

/** Header wraps a title and moves it vertically on scroll. */
export function Header({ translateY, titleComponent }: HeaderProps) {
  return (
    <div
      role="banner"
      aria-live="polite"
      style={{ transform: `translateY(${translateY}px)` }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </div>
  );
}

interface CardProps {
  rotateX: number;
  scale: number;
  children: ReactNode;
}

/** Card applies 3D rotate and scale transforms to its children on scroll. */
export function Card({ rotateX, scale, children }: CardProps) {
  return (
    <div
      role="region"
      aria-label="Scroll-animated content card"
      tabIndex={0}
      style={{
        transform: `rotateX(${rotateX}deg) scale(${scale})`,
        boxShadow:
          "0 9px 20px rgba(0,0,0,0.29), 0 37px 37px rgba(0,0,0,0.26), 0 84px 50px rgba(0,0,0,0.15)",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[30rem] w-full p-2 md:p-6 bg-transparent rounded-[30px]"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-transparent md:p-4">
        {children}
      </div>
    </div>
  );
}

interface ContainerScrollProps {
  titleComponent: ReactNode;
  children: ReactNode;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * ContainerScroll sets up a scroll container with perspective and provides
 * header and card animations based on scroll progress. Progress is tracked
 * with a plain scroll listener rather than Framer Motion's useScroll, since
 * that hook's scroll tracking was silently stuck at 0 in Chrome (desktop and
 * mobile) while working correctly in Edge, with no thrown errors.
 */
export default function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);

  // Update breakpoint flag on resize
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track scroll progress of the container: 0 when its top edge reaches the
  // viewport top, 1 when its bottom edge reaches the viewport bottom.
  useEffect(() => {
    function handleScroll() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const p = scrollableDistance > 0 ? clamp(scrolled / scrollableDistance, 0, 1) : 0;
      setProgress(p);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Compute scale stops based on device width
  const scaleRange = isMobile ? [0.7, 0.9] : [1.05, 1];
  const rotateX = 20 - 20 * progress;
  const scale = scaleRange[0] + (scaleRange[1] - scaleRange[0]) * progress;
  const translateY = -100 * progress;

  return (
    <div
      ref={containerRef}
      className="h-[50rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-20"
    >
      <div className="w-full relative py-10 md:py-40" style={{ perspective: "1000px" }}>
        <Header translateY={translateY} titleComponent={titleComponent} />
        <Card rotateX={rotateX} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}
