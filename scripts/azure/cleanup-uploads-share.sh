#!/usr/bin/env bash
set -euo pipefail

# Cleanup helper for Azure File Share uploads
# Required:
#   AZ_UPLOADS_ACCOUNT_NAME, AZ_UPLOADS_ACCOUNT_KEY, AZ_UPLOADS_SHARE_NAME

: "${AZ_UPLOADS_ACCOUNT_NAME:?AZ_UPLOADS_ACCOUNT_NAME is required}"
: "${AZ_UPLOADS_ACCOUNT_KEY:?AZ_UPLOADS_ACCOUNT_KEY is required}"
: "${AZ_UPLOADS_SHARE_NAME:?AZ_UPLOADS_SHARE_NAME is required}"

echo "Removing .DS_Store files from Azure File Share..."

python3 - <<'PY'
import json
import os
import subprocess

account = os.environ["AZ_UPLOADS_ACCOUNT_NAME"]
key = os.environ["AZ_UPLOADS_ACCOUNT_KEY"]
share = os.environ["AZ_UPLOADS_SHARE_NAME"]


def run_az(args):
  return subprocess.check_output(["az", *args], text=True)


def list_path(path=""):
  args = [
    "storage",
    "file",
    "list",
    "--account-name",
    account,
    "--account-key",
    key,
    "--share-name",
    share,
    "-o",
    "json",
  ]
  if path:
    args.extend(["--path", path])
  return json.loads(run_az(args))


def delete_file(path):
  run_az(
    [
      "storage",
      "file",
      "delete",
      "--account-name",
      account,
      "--account-key",
      key,
      "--share-name",
      share,
      "--path",
      path,
      "-o",
      "none",
    ]
  )
  print(f"Deleted {path}")


def walk(path=""):
  items = list_path(path)
  for item in items:
    name = item.get("name", "")
    full_path = f"{path}/{name}" if path else name
    if item.get("isDirectory"):
      walk(full_path)
    elif name == ".DS_Store":
      delete_file(full_path)


walk("")
print("Done.")
PY
