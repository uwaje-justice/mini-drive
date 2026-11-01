import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";

import queryClient from "@/lib/query-client.js";

const AppProviders = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </QueryClientProvider>
);

export default AppProviders;
