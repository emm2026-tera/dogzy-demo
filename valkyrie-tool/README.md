# Valkyrie Creator Tool (V1)

Outil personnel sur mesure pour Valkyrie.

Cette V1 met en place le **chef d'orchestre**:
- Interface web unique (upload image + directive + dialogue + voix)
- Backend Python d'orchestration
- File d'attente de rendus
- Pipeline en chaîne: image -> video -> voix -> lip-sync -> sous-titres -> assemblage
- Architecture prête pour brancher API réelles (OpenAI, Gemini, Kling, Runway, ElevenLabs, etc.)

## Important
Cette V1 exécute des **adapters simulés** par défaut (sans appels externes) pour valider tout le flux de production.
Les clés API se mettent dans `.env` et ne doivent jamais être partagées.

## Lancer

```bash
cd /home/runner/work/dogzy-demo/dogzy-demo/valkyrie-tool
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8011 --reload
```

Ouvrir: `http://127.0.0.1:8011`

## API
- `GET /api/health`
- `POST /api/jobs` (multipart: `image`, `directive`, `dialogue`, `voice_name`, providers optionnels)
- `GET /api/jobs`
- `GET /api/jobs/{job_id}`
- `GET /api/jobs/{job_id}/files/{file_path}`

## Structure
- `app/main.py`: API + interface
- `app/queue_manager.py`: file d'attente + worker
- `app/pipeline.py`: logique orchestrée étape par étape
- `app/providers.py`: adapters par moteur
- `app/config.py`: paramètres et sécurité
