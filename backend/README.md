# Backend (ACL video + text)

## Run locally

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `http://localhost:8000/health`

## API

`POST /analyze/acl` (multipart form)

- `video`: file upload
- `text_intake_json`: JSON string matching `ACLTextIntake`
- `video_input_json` (optional): JSON string matching `VideoInput`

This returns a structured JSON response with:
- severity band (low/moderate/high/insufficient)
- urgency (self-care/clinician soon/ortho soon/emergency)
- confidence + rationale + extracted video signals

## Notes

This is a hackathon-grade MVP. It is conservative and safety-first and is not a medical diagnosis.

