import os
from openai import OpenAI


def generate_technical_report(
    original_count: int, valid_count: int, density: float, bounding_box: dict
) -> str:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-api-key"))

    prompt = (
        f"Métricas do Scan 3D:\n"
        f"- Pontos originais: {original_count}\n"
        f"- Pontos válidos (pós-limpeza): {valid_count}\n"
        f"- Densidade: {density:.4f}\n"
        f"- Limites: Min {bounding_box.get('min')} | Max {bounding_box.get('max')}\n"
        "Com base nessa densidade e na perda de pontos (ruído), forneça uma análise de engenharia "
        "curta (máximo 1 linha) avaliando a integridade do scan."
    )

    response = client.chat.completions.create(
        model="gpt-4o", messages=[{"role": "user", "content": prompt}], max_tokens=100
    )

    content = response.choices[0].message.content
    return content.strip() if content else "Laudo não gerado."
