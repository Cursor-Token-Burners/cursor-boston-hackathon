# cursor-boston-hackathon

## Problem

ACL injuries are often misunderstood in the first hours after injury. Athletes and coaches need quick, structured guidance on:
- likely ACL concern level,
- how urgently to seek care,
- what to avoid before specialist evaluation.

This project focuses only on ACL and provides **decision support** (not diagnosis).

## Solution (ACL, video + text only)

The app accepts:
1. **Structured text intake** (mechanism, pop, swelling, instability, weight-bearing, pain)
2. **Short video clip** (5-15 seconds, ideally with selected ROI around injured athlete)

The backend returns:
- severity band (`low_acl_concern`, `moderate_acl_concern`, `high_acl_concern`, `insufficient_evidence`)
- urgency (`self_care`, `see_clinician_soon`, `ortho_or_sports_med_soon`, `emergency_now`)
- confidence, rationale, red flags, and next steps
- extracted video movement signals + retrieved ACL rehab context

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend API:** FastAPI, Uvicorn, Pydantic
- **Video processing:** OpenCV + MediaPipe Pose
- **Numeric features:** NumPy
- **Knowledge grounding:** local `ACL_REHAB.md` retrieval (RAG-lite)

## Architecture and directory modularity

- `frontend/`: UI and upload workflow
- `backend/app/main.py`: HTTP endpoints and request validation
- `backend/app/acl_service.py`: orchestration/fusion of text + video + retrieval
- `backend/app/triage.py`: conservative text-only ACL triage rubric
- `backend/app/video.py`: pose extraction and movement feature computation
- `backend/app/acl_knowledge.py`: ACL rehab retrieval from `ACL_REHAB.md`
- `ACL_REHAB.md`: rehab knowledge corpus for grounding

## Exact data flow

1. **User submits multipart request**:
   - `video` file
   - `text_intake_json`
   - optional `video_input_json` (clip start/duration + ROI)
2. **Input validation**:
   - JSON schema checks (`ACLTextIntake`, `VideoInput`)
   - file type/size checks
3. **Video-to-feature pipeline**:
   - decode selected clip
   - run MediaPipe Pose per frame
   - compute:
     - knee angle (hip-knee-ankle)
     - knee angle variability (std dev)
     - 2D knee abduction/valgus proxy
     - pose coverage quality
4. **Text triage baseline**:
   - weighted rubric for classic ACL pattern signals + red flags
5. **RAG pipeline (ACL rehab grounding)**:
   - load `ACL_REHAB.md`
   - keyword-retrieve top matching snippets from user intake terms
   - attach snippets to response context
6. **Fusion and safety guardrails**:
   - text is primary signal
   - video adjusts confidence and can mildly escalate concern
   - severe red flags can escalate urgency
7. **Structured response returned** to frontend

## Why these video features

- **Knee angle** approximates flexion/extension behavior during movement.
- **Knee angle variability** is a practical proxy for guarding/instability.
- **Abduction/valgus proxy** approximates medial collapse tendencies often discussed in ACL risk literature.
- **Pose coverage** prevents overconfident predictions from low-quality tracking.

These are supportive signals and not standalone diagnosis.

## Error handling and edge cases

Backend explicitly handles:
- invalid JSON payloads (422)
- unsupported or empty uploads (415/400)
- oversized uploads (413)
- unreadable/corrupted video files (422)
- no detectable body pose in selected clip/ROI (422)
- missing rehab snippet match (falls back to conservative context note)
- unexpected server failures (500 with controlled message)

## Run the full application

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend health: `http://127.0.0.1:8000/health`

## Evaluation benchmarks (for judging)

- **Urgency classification**: macro-F1 + high-risk recall
- **Severity banding**: weighted F1 + confusion matrix
- **Safety metric**: false negatives on red-flag cases (target near zero)
- **Confidence calibration**: reliability bins / Brier score
- **Video quality metric**: percent of clips with acceptable pose coverage

## Public sources for test data

- ACL jump-landing motion dataset (Scientific Data, 2025):  
  [https://www.nature.com/articles/s41597-025-05934-5](https://www.nature.com/articles/s41597-025-05934-5)
- Open-access mirror:  
  [https://pmc.ncbi.nlm.nih.gov/articles/PMC12528683/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12528683/)

You can also collect controlled phone videos (walk, single-leg stance, shallow squat) for consistent local testing.