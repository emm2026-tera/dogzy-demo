from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .models import JobRequest
from .queue_manager import queue_manager


app = FastAPI(title="Valkyrie Creator Tool", version="1.0.0")

static_dir = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
async def on_startup() -> None:
    await queue_manager.start()


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(static_dir / "index.html")


@app.get("/api/health")
async def health() -> dict:
    return {
        "ok": True,
        "queue_size": queue_manager.queue.qsize(),
        "max_queue_size": settings.valkyrie_max_queue_size,
    }


@app.post("/api/jobs")
async def create_job(
    image: UploadFile = File(...),
    directive: str = Form(...),
    dialogue: str = Form(""),
    voice_name: str = Form("Valkyrie"),
    image_provider: str = Form(settings.valkyrie_image_provider),
    video_provider: str = Form(settings.valkyrie_video_provider),
    voice_provider: str = Form(settings.valkyrie_voice_provider),
    lipsync_provider: str = Form(settings.valkyrie_lipsync_provider),
) -> dict:
    content = await image.read()
    if not directive.strip():
        raise HTTPException(status_code=400, detail="Directive obligatoire")

    request = JobRequest(
        directive=directive.strip(),
        dialogue=dialogue.strip(),
        voice_name=voice_name.strip() or "Valkyrie",
        image_provider=image_provider.strip(),
        video_provider=video_provider.strip(),
        voice_provider=voice_provider.strip(),
        lipsync_provider=lipsync_provider.strip(),
    )

    try:
        job = await queue_manager.create_job(content, image.filename or "source.png", request)
        return {"job_id": job.job_id, "status": job.status.value}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/jobs")
async def list_jobs() -> dict:
    jobs = [j.to_dict() for j in sorted(queue_manager.jobs.values(), key=lambda x: x.created_at, reverse=True)]
    return {"count": len(jobs), "jobs": jobs}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str) -> dict:
    job = queue_manager.jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable")
    return job.to_dict()


@app.get("/api/jobs/{job_id}/files/{file_path:path}")
async def get_job_file(job_id: str, file_path: str):
    job = queue_manager.jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable")

    target = (job.base_dir / file_path).resolve()
    if not str(target).startswith(str(job.base_dir.resolve())):
        raise HTTPException(status_code=400, detail="Chemin invalide")
    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="Fichier introuvable")

    return FileResponse(target)
