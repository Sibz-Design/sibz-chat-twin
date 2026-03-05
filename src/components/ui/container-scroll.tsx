import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * Header wraps a title and moves it vertically on scroll.
 * @param {{ translate: import("framer-motion").MotionValue<number>, titleComponent: React.ReactNode }} props
 */
export function Header({ translate, titleComponent }) {
  return (
    <motion.div
      role="banner"
      aria-live="polite"
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

Header.propTypes = {
  translate: PropTypes.object.isRequired,
  titleComponent: PropTypes.node.isRequired,
};

/**
 * Card applies 3D rotate and scale transforms to its children on scroll.
 * @param {{ rotateX: import("framer-motion").MotionValue<number>, scale: import("framer-motion").MotionValue<number>, children: React.ReactNode }} props
 */
export function Card({ rotateX, scale, children }) {
  return (
    <motion.div
      role="region"
      aria-label="Scroll-animated content card"
      tabIndex={0}
      style={{
        rotateX,
        scale,
        boxShadow:
          "0 9px 20px rgba(0,0,0,0.29), 0 37px 37px rgba(0,0,0,0.26), 0 84px 50px rgba(0,0,0,0.15)",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[30rem] w-full p-2 md:p-6 bg-transparent rounded-[30px]"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-transparent md:p-4">
        {children}
      </div>
    </motion.div>
  );
}

Card.propTypes = {
  rotateX: PropTypes.object.isRequired,
  scale: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * ContainerScroll sets up a scroll container with perspective and provides
 * header and card animations based on scroll progress.
 * @param {{ titleComponent: React.ReactNode, children: React.ReactNode }} props
 */
export default function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  // Update breakpoint flag on resize
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute scale stops based on device width
  const scaleRange = isMobile ? [0.7, 0.9] : [1.05, 1];
  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="h-[50rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-20"
    >
      <div className="w-full relative py-10 md:py-40" style={{ perspective: "1000px" }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotateX={rotateX} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

ContainerScroll.propTypes = {
  titleComponent: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};
