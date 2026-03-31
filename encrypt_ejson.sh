#!/usr/bin/env sh

# POSIX-compliant helper to (re)encrypt one or more *.ejson files in-place.
# Works on macOS, Linux, WSL, busybox, etc.
#
# Requirements:
#   • ejson (https://github.com/Shopify/ejson)
#
# ----------------------------------------
# List of .ejson files to encrypt – one per line. Edit as needed.
# ----------------------------------------
FILES="
.env.ejson
"

# ----------------------------------------
# Function: encrypt file
# ----------------------------------------
encrypt_file() {
  f="$1"

  if [ ! -f "$f" ]; then
    printf "[WARN] %s not found – skipping\n" "$f" >&2
    return 0
  fi

  if ejson encrypt "$f" >/dev/null; then
    printf "[OK]  encrypted %s\n" "$f"
  else
    printf "[ERR] failed to encrypt %s\n" "$f" >&2
    return 1
  fi
}

# ----------------------------------------
# Iterate over file list
# ----------------------------------------
printf "%s" "$FILES" | while IFS= read -r file; do
  [ -z "$file" ] && continue  # skip blank lines
  encrypt_file "$file"
done
