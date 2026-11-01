import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const frame = requestAnimationFrame(() => {
      const id = decodeURIComponent(hash.slice(1));
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
