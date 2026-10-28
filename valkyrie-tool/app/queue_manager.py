import asyncio
from pathlib import Path
from uuid import uuid4

from .config import settings
from .models import JobRecord, JobRequest, JobStatus, now_iso
from .pipeline import OrchestrationPipeline


class QueueManager:
    def __init__(self) -> None:
        self.jobs: dict[str, JobRecord] = {}
        self.queue: asyncio.Queue[str] = asyncio.Queue(maxsize=settings.valkyrie_max_queue_size)
        self.pipeline = OrchestrationPipeline()
        self.worker_task: asyncio.Task | None = None

    async def start(self) -> None:
        if self.worker_task and not self.worker_task.done():
            return
        self.worker_task = asyncio.create_task(self._worker_loop(), name="valkyrie-worker")

    async def _worker_loop(self) -> None:
        while True:
            job_id = await self.queue.get()
            job = self.jobs.get(job_id)
            if not job:
                self.queue.task_done()
                continue
            job.status = JobStatus.running
            job.started_at = now_iso()
            try:
                artifacts = self.pipeline.process(job)
                job.artifacts = artifacts
                job.status = JobStatus.done
            except Exception as exc:  # noqa: BLE001
                job.status = JobStatus.failed
                job.error = str(exc)
                job.log.append(f"ERREUR: {exc}")
            finally:
                job.finished_at = now_iso()
                self.queue.task_done()

    async def create_job(self, image_bytes: bytes, filename: str, request: JobRequest) -> JobRecord:
        max_bytes = settings.valkyrie_max_upload_mb * 1024 * 1024
        if len(image_bytes) > max_bytes:
            raise ValueError(f"Image trop volumineuse (> {settings.valkyrie_max_upload_mb}MB)")

        suffix = Path(filename).suffix.lower()
        if suffix not in {".png", ".jpg", ".jpeg", ".webp"}:
            raise ValueError("Format image non supporté (png/jpg/jpeg/webp)")

        if self.queue.full():
            raise ValueError("File d'attente pleine, réessaie plus tard")

        job_id = uuid4().hex
        base_dir = settings.data_dir / "jobs" / job_id
        input_dir = base_dir / "input"
        input_dir.mkdir(parents=True, exist_ok=True)
        input_image = input_dir / f"source{suffix}"
        input_image.write_bytes(image_bytes)

        job = JobRecord(
            job_id=job_id,
            created_at=now_iso(),
            status=JobStatus.queued,
            request=request,
            base_dir=base_dir,
            input_image=input_image,
            log=["Job créé et placé en file d'attente"],
        )
        self.jobs[job_id] = job
        await self.queue.put(job_id)
        return job


queue_manager = QueueManager()
