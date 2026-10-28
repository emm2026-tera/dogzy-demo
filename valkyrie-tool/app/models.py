from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class JobStatus(str, Enum):
    queued = "queued"
    running = "running"
    done = "done"
    failed = "failed"


@dataclass
class JobRequest:
    directive: str
    dialogue: str
    voice_name: str
    image_provider: str
    video_provider: str
    voice_provider: str
    lipsync_provider: str


@dataclass
class JobRecord:
    job_id: str
    created_at: str
    status: JobStatus
    request: JobRequest
    base_dir: Path
    input_image: Path
    log: list[str] = field(default_factory=list)
    artifacts: dict[str, str] = field(default_factory=dict)
    error: str | None = None
    started_at: str | None = None
    finished_at: str | None = None

    def to_dict(self) -> dict:
        return {
            "job_id": self.job_id,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "status": self.status.value,
            "request": {
                "directive": self.request.directive,
                "dialogue": self.request.dialogue,
                "voice_name": self.request.voice_name,
                "image_provider": self.request.image_provider,
                "video_provider": self.request.video_provider,
                "voice_provider": self.request.voice_provider,
                "lipsync_provider": self.request.lipsync_provider,
            },
            "artifacts": self.artifacts,
            "error": self.error,
            "log": self.log,
        }
