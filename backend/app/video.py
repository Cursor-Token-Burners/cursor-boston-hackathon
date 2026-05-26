from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional

import cv2
import mediapipe as mp
import numpy as np

from .schemas import VideoInput


class VideoAnalysisError(Exception):
    """Raised when uploaded video content cannot be safely analyzed."""


@dataclass(frozen=True)
class VideoSignals:
    """Container for extracted movement features and quality metadata."""

    analyzed_frames: int
    pose_frames: int
    pose_coverage: float
    mean_knee_angle_deg: Optional[float]
    knee_angle_std_deg: Optional[float]
    mean_knee_abduction_proxy: Optional[float]
    notes: list[str]

    def as_dict(self) -> dict:
        return {
            "analyzed_frames": self.analyzed_frames,
            "pose_frames": self.pose_frames,
            "pose_coverage": self.pose_coverage,
            "mean_knee_angle_deg": self.mean_knee_angle_deg,
            "knee_angle_std_deg": self.knee_angle_std_deg,
            "mean_knee_abduction_proxy": self.mean_knee_abduction_proxy,
            "notes": self.notes,
        }


def _angle_deg(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Compute angle ABC in degrees with B as the vertex."""
    ba = a - b
    bc = c - b
    denom = (np.linalg.norm(ba) * np.linalg.norm(bc)) + 1e-9
    cosang = float(np.dot(ba, bc) / denom)
    cosang = max(-1.0, min(1.0, cosang))
    return math.degrees(math.acos(cosang))


def _crop_roi(frame: np.ndarray, vi: VideoInput) -> np.ndarray:
    """Crop a normalized ROI from the frame; return full frame if ROI is invalid."""
    if vi.roi_x is None or vi.roi_y is None or vi.roi_w is None or vi.roi_h is None:
        return frame
    h, w = frame.shape[:2]
    x0 = int(max(0, min(w - 1, vi.roi_x * w)))
    y0 = int(max(0, min(h - 1, vi.roi_y * h)))
    x1 = int(max(1, min(w, (vi.roi_x + vi.roi_w) * w)))
    y1 = int(max(1, min(h, (vi.roi_y + vi.roi_h) * h)))
    if x1 <= x0 + 2 or y1 <= y0 + 2:
        return frame
    return frame[y0:y1, x0:x1]


def analyze_video(path: str, vi: VideoInput) -> VideoSignals:
    """
    Extract ACL-relevant movement proxies from a user-selected clip.

    Why these features:
    - `knee_angle` (hip-knee-ankle angle) approximates sagittal flexion/extension behavior.
    - `knee_angle_std_deg` captures motion inconsistency, a proxy for guarding/instability.
    - `knee_abduction_proxy` estimates medial/lateral deviation in 2D; this loosely tracks
      dynamic valgus patterns associated with ACL risk in jump/landing contexts.

    Important:
    These are supportive signals only and are never treated as a standalone diagnosis.
    """
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise VideoAnalysisError("Could not open uploaded video file.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    start_frame = int(max(0, vi.start_sec * fps))
    max_frames = int(max(1, vi.duration_sec * fps))
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    try:
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.4,
            min_tracking_confidence=0.4,
        )
    except Exception as exc:
        cap.release()
        raise VideoAnalysisError(f"Failed to initialize pose estimator: {exc}") from exc

    knee_angles: list[float] = []
    abduction_proxy: list[float] = []
    analyzed = 0
    pose_ok = 0
    notes: list[str] = []

    try:
        for _ in range(max_frames):
            ok, frame = cap.read()
            if not ok:
                break
            analyzed += 1

            frame = _crop_roi(frame, vi)
            try:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            except Exception:
                notes.append("frame_color_conversion_failed")
                continue

            try:
                res = pose.process(rgb)
            except Exception:
                notes.append("pose_process_failed")
                continue
            if not res.pose_landmarks:
                continue

            lms = res.pose_landmarks.landmark

            # Use LEFT leg landmarks as default; if visibility is low, fall back to right.
            def get(i: int) -> np.ndarray:
                return np.array([lms[i].x, lms[i].y], dtype=np.float32)

            # Indices from MediaPipe Pose:
            # 23 left_hip, 25 left_knee, 27 left_ankle
            # 24 right_hip, 26 right_knee, 28 right_ankle
            left_vis = min(lms[23].visibility, lms[25].visibility, lms[27].visibility)
            right_vis = min(lms[24].visibility, lms[26].visibility, lms[28].visibility)
            if max(left_vis, right_vis) < 0.35:
                continue

            if left_vis >= right_vis:
                hip, knee, ankle = get(23), get(25), get(27)
            else:
                hip, knee, ankle = get(24), get(26), get(28)

            # Knee flexion proxy angle from 2D points.
            knee_angle = _angle_deg(hip, knee, ankle)
            knee_angles.append(knee_angle)

            # Very rough "valgus/abduction proxy" in image plane:
            # compare knee x position relative to hip-ankle line.
            # Positive means knee is more "medial" than expected (camera dependent).
            line = ankle - hip
            line_norm = np.linalg.norm(line) + 1e-9
            # signed distance of knee to hip->ankle line in x/y normalized plane
            # Using 2D cross product magnitude / norm as distance; sign from cross z.
            v1 = knee - hip
            cross_z = float(line[0] * v1[1] - line[1] * v1[0])
            dist = cross_z / line_norm
            abduction_proxy.append(dist)

            pose_ok += 1
    finally:
        cap.release()
        pose.close()

    if analyzed == 0:
        raise VideoAnalysisError("No frames were readable from uploaded video.")
    if pose_ok == 0:
        raise VideoAnalysisError("No valid body pose detected in selected clip/ROI.")

    if len(knee_angles) >= 5:
        mean_angle = float(np.mean(knee_angles))
        std_angle = float(np.std(knee_angles))
    else:
        mean_angle = None
        std_angle = None

    mean_abd = float(np.mean(abduction_proxy)) if len(abduction_proxy) >= 5 else None

    coverage = float(pose_ok / analyzed) if analyzed > 0 else 0.0
    if coverage < 0.35:
        notes.append("low_pose_coverage_consider_roi_or_shorter_clip")

    return VideoSignals(
        analyzed_frames=analyzed,
        pose_frames=pose_ok,
        pose_coverage=coverage,
        mean_knee_angle_deg=mean_angle,
        knee_angle_std_deg=std_angle,
        mean_knee_abduction_proxy=mean_abd,
        notes=notes,
    )

