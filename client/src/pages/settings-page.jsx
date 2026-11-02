import { motion } from "motion/react";

import EmailForm from "@/features/auth/components/email-form.jsx";
import LogoutButton from "@/features/auth/components/logout-button.jsx";
import PasswordForm from "@/features/auth/components/password-form.jsx";
import useSession from "@/features/auth/hooks/use-session.js";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import { formatDate } from "@/features/drive/format.js";

const SettingsPage = () => {
  const session = useSession();
  const user = session.data?.user;

  return (
    <motion.div
      className="mx-auto grid w-full max-w-4xl gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-on-surface sm:text-4xl">
          Your account
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
          Manage your sign-in email and password.
        </p>
      </header>

      <DrivePanel
        kicker="Account"
        title={user?.email ?? "Signed in"}
        description={
          user?.createdAt
            ? `Member since ${formatDate(user.createdAt)}.`
            : undefined
        }
        action={<LogoutButton />}
      >
        <div className="px-4 py-4 text-sm leading-6 text-on-surface-variant sm:px-5">
          You use this email to sign in. After you change it, use the new
          address to sign in.
        </div>
      </DrivePanel>

      <DrivePanel
        kicker="Email"
        title="Change email"
        description="Enter your current password to confirm."
      >
        <div className="p-4 sm:p-5">
          <EmailForm email={user?.email ?? ""} />
        </div>
      </DrivePanel>

      <DrivePanel
        kicker="Password"
        title="Change password"
        description="Other sessions are signed out after the change."
      >
        <div className="p-4 sm:p-5">
          <PasswordForm />
        </div>
      </DrivePanel>
    </motion.div>
  );
};

export default SettingsPage;
