import json
from pathlib import Path

from .models import JobRecord
from .providers import ProviderRegistry


class OrchestrationPipeline:
    def __init__(self) -> None:
        self.providers = ProviderRegistry()

    def process(self, job: JobRecord) -> dict[str, str]:
        out_dir = job.base_dir / "output"
        out_dir.mkdir(parents=True, exist_ok=True)

        def log(message: str) -> None:
            job.log.append(message)

        log("1/6 Préparation image")
        image_stage = out_dir / "01_image_stage.json"
        self.providers.get(job.request.image_provider).run(
            stage="image_prep",
            payload={
                "directive": job.request.directive,
                "input_image": str(job.input_image),
            },
            output_file=image_stage,
        )

        log("2/6 Animation image→vidéo")
        video_stage = out_dir / "02_video_stage.json"
        self.providers.get(job.request.video_provider).run(
            stage="image_to_video",
            payload={
                "directive": job.request.directive,
                "image_stage": str(image_stage),
                "duration_seconds": 8,
            },
            output_file=video_stage,
        )

        log("3/6 Génération voix")
        voice_stage = out_dir / "03_voice_stage.json"
        self.providers.get(job.request.voice_provider).run(
            stage="text_to_speech",
            payload={
                "voice_name": job.request.voice_name,
                "dialogue": job.request.dialogue,
            },
            output_file=voice_stage,
        )

        log("4/6 Lip-sync")
        lipsync_stage = out_dir / "04_lipsync_stage.json"
        self.providers.get(job.request.lipsync_provider).run(
            stage="lipsync",
            payload={
                "video_stage": str(video_stage),
                "voice_stage": str(voice_stage),
            },
            output_file=lipsync_stage,
        )

        log("5/6 Sous-titres (Whisper)")
        subtitle_stage = out_dir / "05_subtitles.srt"
        subtitle_stage.write_text(
            "1\n00:00:00,000 --> 00:00:03,000\n[Simulation] " + job.request.dialogue + "\n",
            encoding="utf-8",
        )

        log("6/6 Assemblage final (FFmpeg pipeline)")
        final_manifest = out_dir / "06_final_manifest.json"
        final_manifest.write_text(
            json.dumps(
                {
                    "job_id": job.job_id,
                    "timeline": {
                        "video": str(video_stage),
                        "voice": str(voice_stage),
                        "lipsync": str(lipsync_stage),
                        "subtitles": str(subtitle_stage),
                    },
                    "final_output": "Replace with ffmpeg output path (e.g., final.mp4)",
                    "status": "simulation_completed",
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

        log("Terminé")
        return {
            "image_stage": str(image_stage.relative_to(job.base_dir)),
            "video_stage": str(video_stage.relative_to(job.base_dir)),
            "voice_stage": str(voice_stage.relative_to(job.base_dir)),
            "lipsync_stage": str(lipsync_stage.relative_to(job.base_dir)),
            "subtitles": str(subtitle_stage.relative_to(job.base_dir)),
            "final_manifest": str(final_manifest.relative_to(job.base_dir)),
        }
