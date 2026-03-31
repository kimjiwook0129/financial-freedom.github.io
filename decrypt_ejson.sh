#!/usr/bin/env sh

# POSIX-compliant script to decrypt every *.ejson file listed below into a
# corresponding .env file, without creating temporary files.
# Works with sh (dash), bash 3+/4+ (macOS / Linux), zsh, busybox ash, etc.
#
# Requirements:
#   • ejson (https://github.com/Shopify/ejson)
#   • jq     (https://stedolan.github.io/jq/)
#
# ----------------------------------------
# Mapping table: "source:destination" per line.
# ----------------------------------------
MAPPINGS="
.env.ejson:.env
"

# ----------------------------------------
# Function: decrypt file
# ----------------------------------------
decrypt_and_write() {
  src="$1"   # .ejson file
  dst="$2"   # .env file

  if [ ! -f "$src" ]; then
    printf "[WARN] %s not found – skipping\n" "$src" >&2
    return 0
  fi

  # Perform decryption and transform JSON → .env
  if ejson decrypt "$src" 2>/dev/null | \
       jq -r 'to_entries | map(select(.key != "_public_key")) | map("\(.key)=\"\(.value)\"") | .[]' > "$dst"; then
    printf "[OK]  %s → %s\n" "$src" "$dst"
  else
    printf "[ERR] Failed to decrypt %s\n" "$src" >&2
    return 1
  fi
}

# ----------------------------------------
# Iterate over mapping lines
# ----------------------------------------
printf "%s" "$MAPPINGS" | while IFS=: read -r src dst; do
  # Skip blank lines (e.g., the last newline)
  [ -z "$src" ] && continue
  decrypt_and_write "$src" "$dst"
done
