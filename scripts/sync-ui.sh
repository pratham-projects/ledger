#!/usr/bin/env bash
# Pulls UI-only changes from the upstream source into this demo repo.
#
# This demo's upstream has NO git remote (see UPSTREAM.md) — it's a local path, not a
# fetchable repo. So unlike the other two demos in this set (affiliate-platform, sendesk,
# which add a real `upstream` git remote and `git fetch` it), this script diffs two commits
# directly inside a fresh clone of that local path.
#
# Usage:
#   scripts/sync-ui.sh <new-sha>
#
# What it does:
#   1. Clones the upstream local path fresh into a scratch dir.
#   2. Diffs frontend/src + frontend/public between the last-synced sha (read from
#      UPSTREAM.md) and <new-sha>.
#   3. Applies that diff here with `git apply --3way`, stripping the `frontend/` prefix.
#
# Protected paths this must never overwrite (see UPSTREAM.md): mock/, components/demo/,
# README.md, UPSTREAM.md, scripts/, vercel.json, .env.example. The diff is scoped to
# frontend/src and frontend/public specifically so it can't touch any of them, but always
# review the diff before committing — a renamed/moved upstream file can still collide.
#
# After a successful apply: re-run the imagery review for anything new in
# template-images.ts (extend lib/placeholder-art.ts for slots you drop), bump the synced
# sha in UPSTREAM.md, `bun run build`, re-check the scrub checklist, then commit.

set -euo pipefail

UPSTREAM_PATH="/Users/pratham/code/perchance/perchange-update"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ $# -ne 1 ]; then
  echo "Usage: $0 <new-sha>" >&2
  exit 1
fi
NEW_SHA="$1"

LAST_SHA="$(grep -oE '\`[0-9a-f]{7,40}\`' "$REPO_ROOT/UPSTREAM.md" | head -1 | tr -d '\`')"
if [ -z "$LAST_SHA" ]; then
  echo "Could not find the last-synced sha in UPSTREAM.md" >&2
  exit 1
fi

SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT

echo "Cloning $UPSTREAM_PATH (read-only) ..."
git clone --quiet "$UPSTREAM_PATH" "$SCRATCH/src"

echo "Diffing frontend/src + frontend/public: $LAST_SHA..$NEW_SHA"
git -C "$SCRATCH/src" diff "$LAST_SHA..$NEW_SHA" -- frontend/src frontend/public \
  > "$SCRATCH/change.patch"

if [ ! -s "$SCRATCH/change.patch" ]; then
  echo "No changes in frontend/src or frontend/public between those commits."
  exit 0
fi

echo "Applying to $REPO_ROOT (3-way, frontend/ prefix stripped) ..."
(cd "$REPO_ROOT" && git apply --3way -p2 "$SCRATCH/change.patch")

cat <<EOF

Applied. Next steps:
  1. Review the diff — look especially for new src/lib/*.ts files with hotlinked image
     or video URLs; extend the imagery review (see UPSTREAM.md) before shipping them.
  2. Update the synced sha in UPSTREAM.md: $LAST_SHA -> $NEW_SHA
  3. bun install && bun run build
  4. Re-run the scrub checklist.
  5. Commit.
EOF
