from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    valkyrie_data_dir: str = "./valkyrie_data"
    valkyrie_max_upload_mb: int = 25
    valkyrie_max_queue_size: int = 100
    valkyrie_host: str = "127.0.0.1"
    valkyrie_port: int = 8011

    valkyrie_image_provider: str = "openai_gpt_image_1"
    valkyrie_video_provider: str = "kling"
    valkyrie_voice_provider: str = "elevenlabs"
    valkyrie_lipsync_provider: str = "musetalk"

    openai_api_key: str | None = None
    gemini_api_key: str | None = None
    flux_api_key: str | None = None
    kling_api_key: str | None = None
    runway_api_key: str | None = None
    hailuo_api_key: str | None = None
    elevenlabs_api_key: str | None = None

    @property
    def data_dir(self) -> Path:
        return Path(self.valkyrie_data_dir).resolve()


settings = Settings()
settings.data_dir.mkdir(parents=True, exist_ok=True)
