from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Cepa AI Sidecar", version="0.1.0")


class StoryRequest(BaseModel):
    lot_id: str
    language: str = "es"
    winemaker_note: str = ""
    variety: str = ""
    vintage_year: int = 0
    vineyard_name: str = ""
    vineyard_location: str = ""


class StoryResponse(BaseModel):
    story: str
    language: str


class PairingsRequest(BaseModel):
    lot_id: str
    variety: str
    sensory_profile: dict = {}


class PairingsResponse(BaseModel):
    pairings: list[dict]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/story", response_model=StoryResponse)
def generate_story(req: StoryRequest):
    # Stub: en producción llamaría a OpenAI
    story = (
        f"El {req.variety} {req.vintage_year} de {req.vineyard_name} "
        f"es un vino de carácter único, nacido en {req.vineyard_location}. "
        f"Nota del enólogo: {req.winemaker_note}"
    )
    return StoryResponse(story=story, language=req.language)


@app.post("/pairings", response_model=PairingsResponse)
def generate_pairings(req: PairingsRequest):
    # Stub: en producción llamaría a OpenAI
    pairings = [
        {"food": "Asado de tira", "description": "Complementa los taninos del vino"},
        {"food": "Queso curado", "description": "Equilibra la acidez"},
        {"food": "Pasta con salsa roja", "description": "Harmonía perfecta"},
    ]
    return PairingsResponse(pairings=pairings)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
