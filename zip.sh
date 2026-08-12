#!/usr/bin/env bash
set -euo pipefail

root="$(pwd)"
root_name="$(basename "$root")"
timestamp="$(date '+%Y%m%d_%H%M%S')"
zip_path="$root/${root_name}_${timestamp}.zip"

stage="$(mktemp -d "${TMPDIR:-/tmp}/zipstage_XXXXXX")"

cleanup() {
  rm -rf "$stage"
}
trap cleanup EXIT

# Copy allowed top-level items into staging
# Excludes:
# - hidden top-level items: .*
# - *.iml
# - *.zip
# - *.ps1
find "$root" -mindepth 1 -maxdepth 1 | while IFS= read -r item; do
  name="$(basename "$item")"

  case "$name" in
    .*|*.iml|*.zip|*.ps1|*.sh)
      continue
      ;;
  esac

  cp -R "$item" "$stage/"
done

# Remove zip if it somehow already exists
if [ -f "$zip_path" ]; then
  rm -f "$zip_path"
fi

# Create zip from staged contents
(
  cd "$stage"
  zip -r "$zip_path" . >/dev/null
)

echo "Created: $zip_path"
echo "Run: ./zip.sh"
