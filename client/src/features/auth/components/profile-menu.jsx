import { useEffect, useId, useRef, useState } from "react";

import LogoutButton from "@/features/auth/components/logout-button.jsx";

const ProfileMenu = ({ email }) => {
  const menuId = useId();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const initial = email.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),#3d78f4)] text-sm font-semibold text-on-primary shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        {initial}
      </button>

      {isOpen ? (
        <div
          id={menuId}
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-2"
        >
          <div className="border-b border-outline-variant px-4 py-3">
            <p className="text-[0.68rem] leading-3 text-on-surface-variant">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-medium text-on-surface">
              {email}
            </p>
          </div>
          <div className="p-2">
            <LogoutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
