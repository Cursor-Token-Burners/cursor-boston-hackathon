# Data downloads

This folder is intentionally git-ignored (datasets can be large).

## ACL jump/landing dataset (public)

The README references the ACL jump-landing dataset from Scientific Data (2025). The dataset is hosted on Figshare.

- Paper: `https://www.nature.com/articles/s41597-025-05934-5`
- Mirror: `https://pmc.ncbi.nlm.nih.gov/articles/PMC12528683/`
- Figshare DOI (dataset): `10.6084/m9.figshare.28890545.v1`

### Download (recommended)

```bash
cd scripts
python download_acl_figshare_dataset.py --out ..\data\acl_jump_dataset --max-files 10
```

Notes:
- Start with `--max-files 10` to confirm everything works before downloading the full dataset.
- Many research datasets are multiple GB; full downloads may take a while.

