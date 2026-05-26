from __future__ import annotations

"""
Download helper for the public ACL jump/landing dataset hosted on Figshare.

Why this exists:
- Hackathon judges want reproducible steps to obtain test data.
- The dataset is large; this script supports partial download to sanity-check pipeline.

Dataset reference:
- Scientific Data paper: https://www.nature.com/articles/s41597-025-05934-5
- Figshare DOI: 10.6084/m9.figshare.28890545.v1

This script uses Figshare's public API:
1) Resolve DOI -> Figshare article ID
2) List article files
3) Download files (optionally limited)
"""

import argparse
import json
import os
from pathlib import Path
from typing import Any
from urllib.request import urlopen, urlretrieve


FIGSHARE_API = "https://api.figshare.com/v2"
DEFAULT_DOI = "10.6084/m9.figshare.28890545.v1"


def _http_json(url: str) -> Any:
    """Fetch JSON from a public endpoint with basic error context."""
    try:
        with urlopen(url) as resp:  # noqa: S310 (public URL fetch)
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch JSON from {url}: {exc}") from exc


def resolve_doi_to_article_id(doi: str) -> int:
    """
    Resolve a Figshare DOI into an article id.

    Args:
        doi: Figshare DOI (e.g. "10.6084/m9.figshare.28890545.v1")

    Returns:
        Figshare article id
    """
    data = _http_json(f"{FIGSHARE_API}/articles?doi={doi}")
    if not data:
        raise RuntimeError(f"No Figshare article found for DOI {doi}")
    return int(data[0]["id"])


def list_article_files(article_id: int) -> list[dict[str, Any]]:
    """
    List downloadable files for a Figshare article.

    Returns list entries including: name, size, download_url, id.
    """
    return list(_http_json(f"{FIGSHARE_API}/articles/{article_id}/files"))


def download_files(files: list[dict[str, Any]], out_dir: Path, max_files: int | None) -> None:
    """
    Download Figshare files to a local directory.

    Args:
        files: Figshare file metadata objects.
        out_dir: directory to write files to.
        max_files: optional limit to download only first N files.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    to_get = files[:max_files] if max_files is not None else files

    for f in to_get:
        name = f.get("name") or f"file_{f.get('id')}"
        url = f.get("download_url")
        if not url:
            raise RuntimeError(f"Missing download_url for file {name}")

        dest = out_dir / name
        if dest.exists() and dest.stat().st_size > 0:
            continue

        try:
            urlretrieve(url, dest)  # noqa: S310 (public URL download)
        except Exception as exc:
            raise RuntimeError(f"Failed downloading {name} from {url}: {exc}") from exc


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--doi", default=DEFAULT_DOI)
    parser.add_argument("--out", required=True, help="Output directory")
    parser.add_argument("--max-files", type=int, default=10, help="Download only first N files (sanity check)")
    args = parser.parse_args()

    out_dir = Path(args.out).resolve()
    doi = str(args.doi).strip()
    max_files = int(args.max_files) if args.max_files is not None else None
    if max_files is not None and max_files <= 0:
        max_files = None

    article_id = resolve_doi_to_article_id(doi)
    files = list_article_files(article_id)
    if not files:
        raise RuntimeError(f"No files listed for Figshare article id={article_id}")

    # Save manifest for reproducibility.
    manifest = out_dir / "figshare_manifest.json"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps({"doi": doi, "article_id": article_id, "files": files}, indent=2), encoding="utf-8")

    download_files(files, out_dir, max_files=max_files)

    print(f"Downloaded {min(len(files), max_files or len(files))} file(s) to {out_dir}")


if __name__ == "__main__":
    main()

