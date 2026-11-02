import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiCopy, FiLink, FiTrash2 } from "react-icons/fi";

import { publicSharePath } from "@/api/shares.js";
import Button from "@/components/ui/button.jsx";
import ConfirmDialog from "@/components/ui/confirm-dialog.jsx";
import Field from "@/components/ui/field.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import FormSuccess from "@/components/ui/form-success.jsx";
import Modal from "@/components/ui/modal.jsx";
import applyApiError from "@/features/auth/apply-api-error.js";
import { formatDate } from "@/features/drive/format.js";
import useCreateShare from "@/features/shares/hooks/use-create-share.js";
import useFolderShares from "@/features/shares/hooks/use-folder-shares.js";
import useRevokeShare from "@/features/shares/hooks/use-revoke-share.js";

const shareUrl = (token) =>
  `${window.location.origin}${publicSharePath(token)}`;

const ShareDialog = ({ open, folder, onClose }) => {
  const folderId = folder?.id;
  const shares = useFolderShares({ folderId, enabled: open });
  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();
  const [message, setMessage] = useState("");
  const [copyError, setCopyError] = useState("");
  const [copiedToken, setCopiedToken] = useState("");
  const [copyFallbackToken, setCopyFallbackToken] = useState("");
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeError, setRevokeError] = useState("");
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues: { days: 7 },
  });

  useEffect(() => {
    if (open) return;

    setMessage("");
    setCopyError("");
    setCopiedToken("");
    setCopyFallbackToken("");
    setRevokeTarget(null);
    setRevokeError("");
    reset({ days: 7 });
  }, [open, reset]);

  const submit = async ({ days }) => {
    clearErrors();
    setMessage("");
    setCopyError("");

    try {
      await createShare.mutateAsync({ folderId, days });
      setMessage("Share link created.");
    } catch (error) {
      applyApiError(error, setError, ["days"]);
    }
  };

  const copyLink = async (token) => {
    setCopyError("");
    setCopyFallbackToken("");

    try {
      await navigator.clipboard.writeText(shareUrl(token));
      setCopiedToken(token);
    } catch {
      setCopyError("Could not copy the link. Select it below and copy it.");
      setCopyFallbackToken(token);
    }
  };

  const confirmRevoke = async () => {
    setRevokeError("");

    try {
      await revokeShare.mutateAsync({
        folderId,
        shareId: revokeTarget.id,
      });
      setRevokeTarget(null);
    } catch (error) {
      setRevokeError(error.message);
    }
  };

  const isCreating = isSubmitting || createShare.isPending;
  const links = shares.data?.links ?? [];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Share folder"
        description={
          folder
            ? `Create a public link for ${folder.name} and its contents.`
            : "Create a public link for this folder."
        }
        size="lg"
      >
        <div className="grid gap-6">
          <form
            className="grid gap-3 rounded-control border border-outline-variant bg-surface-container-low p-4"
            onSubmit={handleSubmit(submit)}
            noValidate
          >
            {errors.root?.server?.message ? (
              <FormAlert>{errors.root.server.message}</FormAlert>
            ) : null}
            {message ? <FormSuccess>{message}</FormSuccess> : null}

            <div className="flex flex-wrap items-end gap-3">
              <Field
                label="Days until link expires"
                type="number"
                min="1"
                max="365"
                inputMode="numeric"
                error={errors.days?.message}
                className="min-w-40 flex-1"
                {...register("days", {
                  valueAsNumber: true,
                  required: "Enter how many days the link should last.",
                  min: {
                    value: 1,
                    message: "Choose a number of days from 1 to 365.",
                  },
                  max: {
                    value: 365,
                    message: "Choose a number of days from 1 to 365.",
                  },
                })}
              />
              <Button type="submit" isLoading={isCreating}>
                Create link
              </Button>
            </div>
          </form>

          {copyError ? (
            <div className="grid gap-2">
              <FormAlert>{copyError}</FormAlert>
              {copyFallbackToken ? (
                <>
                  <label
                    htmlFor="share-link-fallback"
                    className="sr-only"
                  >
                    Share link
                  </label>
                  <input
                    id="share-link-fallback"
                    readOnly
                    value={shareUrl(copyFallbackToken)}
                    onFocus={(event) => event.target.select()}
                    className="min-h-10 w-full rounded-control border border-outline-variant bg-surface px-3 text-xs text-on-surface"
                  />
                </>
              ) : null}
            </div>
          ) : null}

          <section className="grid gap-3" aria-labelledby="share-links-title">
            <div className="flex items-center justify-between gap-3">
              <h3
                id="share-links-title"
                className="text-sm font-semibold text-on-surface"
              >
                Share links
              </h3>
              <span className="text-xs text-on-surface-variant">
                {links.length} {links.length === 1 ? "link" : "links"}
              </span>
            </div>

            {shares.isPending ? (
              <p className="rounded-control border border-outline-variant px-4 py-6 text-center text-sm text-on-surface-variant">
                Loading share links...
              </p>
            ) : null}

            {shares.isError ? (
              <FormAlert>{shares.error.message}</FormAlert>
            ) : null}

            {!shares.isPending && links.length === 0 ? (
              <div className="grid place-items-center gap-2 rounded-control border border-dashed border-outline-variant px-4 py-8 text-center">
                <FiLink
                  className="size-5 text-on-surface-variant"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-on-surface">
                  No share links yet.
                </p>
                <p className="max-w-xs text-xs leading-5 text-on-surface-variant">
                  Create a link above to share this folder with anyone.
                </p>
              </div>
            ) : null}

            {links.length > 0 ? (
              <ul className="divide-y divide-outline-variant overflow-hidden rounded-control border border-outline-variant">
                {links.map((link) => (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-center gap-3 px-3 py-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
                      <FiLink className="size-4" aria-hidden="true" />
                    </span>
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-semibold text-on-surface">
                          {link.expired ? "Expired link" : "Active link"}
                        </strong>
                        {link.expired ? (
                          <span className="rounded-full bg-error-container px-2 py-0.5 text-[0.68rem] font-semibold text-on-error-container">
                            Expired
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Expires {formatDate(link.expiresAt)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {!link.expired ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(link.token)}
                        >
                          <FiCopy className="size-4" aria-hidden="true" />
                          {copiedToken === link.token ? "Copied" : "Copy"}
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error"
                        onClick={() => {
                          setRevokeTarget(link);
                          setRevokeError("");
                        }}
                      >
                        <FiTrash2 className="size-4" aria-hidden="true" />
                        Revoke
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="Revoke share link?"
        description="Anyone using this link will lose access immediately."
        confirmLabel="Revoke link"
        isPending={revokeShare.isPending}
        onConfirm={confirmRevoke}
        onClose={() => {
          setRevokeTarget(null);
          setRevokeError("");
        }}
      >
        {revokeError ? <FormAlert>{revokeError}</FormAlert> : null}
      </ConfirmDialog>
    </>
  );
};

export default ShareDialog;
