import { motion, useReducedMotion } from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";

import BrandMark from "@/components/brand-mark.jsx";
import Button from "@/components/ui/button.jsx";
import StatusScreen from "@/components/ui/status-screen.jsx";

const SessionFallback = ({ session }) => {
  const shouldReduceMotion = useReducedMotion();

  if (session.isPending) {
    return (
      <main
        className="grid h-dvh place-items-center bg-surface-container-low"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={
            shouldReduceMotion ? { opacity: 1 } : { opacity: [0.45, 1, 0.45] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <BrandMark className="size-10" />
        </motion.div>
        <span className="sr-only">Checking your session</span>
      </main>
    );
  }

  if (session.isError) {
    return (
      <StatusScreen
        icon={<FiAlertTriangle className="size-8 text-error" />}
        title="The server did not respond."
        description="Check your connection, then try again."
        action={
          <Button variant="secondary" onClick={() => session.refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  return null;
};

export default SessionFallback;
