import json
from pathlib import Path
from typing import Any


class ProviderAdapter:
    def __init__(self, name: str):
        self.name = name

    def run(self, stage: str, payload: dict[str, Any], output_file: Path) -> Path:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(
            json.dumps(
                {
                    "provider": self.name,
                    "stage": stage,
                    "payload": payload,
                    "note": "Simulation output. Replace adapter with real API/local model call.",
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        return output_file


class ProviderRegistry:
    def get(self, provider_name: str) -> ProviderAdapter:
        return ProviderAdapter(provider_name)
