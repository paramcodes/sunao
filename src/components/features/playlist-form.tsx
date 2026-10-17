"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useCreatePlaylist } from "@/lib/queries";
import type { Playlist } from "@/lib/schemas";

export function PlaylistForm({
  onDone,
  onCancel,
  autoFocus = false,
}: {
  onDone?: (playlist: Playlist) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const create = useCreatePlaylist();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const trimmed = name.trim();

  const submit = () => {
    if (!trimmed || create.isPending) return;
    create.mutate(trimmed, {
      onSuccess: (playlist) => {
        setName("");
        toast.success(`Created "${playlist.name}"`);
        onDone?.(playlist);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Couldn't create the playlist");
      },
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-3"
    >
      <Input
        ref={inputRef}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Playlist name"
        aria-label="Playlist name"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!trimmed || create.isPending}
          className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white transition-[background-color,transform] duration-150 ease-out hover:bg-red-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {create.isPending ? "Creating…" : "Create"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-1.5 text-sm text-white/60 transition-colors duration-150 ease-out hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
