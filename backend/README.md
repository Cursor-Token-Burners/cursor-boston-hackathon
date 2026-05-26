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

## Error model

The endpoint returns explicit HTTP errors for common failures:
- 422 invalid JSON payload
- 415 unsupported video extension
- 400 empty/corrupt upload read
- 413 oversized video
- 422 no readable frames / no detectable pose
- 500 unexpected server fault

## cURL example

```bash
curl -X POST "http://127.0.0.1:8000/analyze/acl" ^
  -F "video=@sample.mp4" ^
  -F "text_intake_json={\"mechanism\":\"pivot_twist\",\"heard_pop\":true,\"immediate_swelling_within_2h\":true,\"instability_giving_way\":true,\"weight_bearing\":\"painful\",\"pain_0_10\":7}" ^
  -F "video_input_json={\"start_sec\":0,\"duration_sec\":8}"
```

## Notes

This is a hackathon-grade MVP. It is conservative and safety-first and is not a medical diagnosis.

