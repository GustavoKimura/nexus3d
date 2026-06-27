import os
import logging
from openai import OpenAI, OpenAIError

logger = logging.getLogger(__name__)


def generate_technical_report(
    original_count: int, valid_count: int, density: float, bounding_box: dict
) -> str:
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError("Chave da OpenAI ausente. Verifique o arquivo .env.")

    client = OpenAI(api_key=api_key)

    prompt = (
        f"Métricas do Scan 3D:\n"
        f"- Pontos originais: {original_count}\n"
        f"- Pontos válidos (pós-limpeza): {valid_count}\n"
        f"- Densidade: {density:.4f}\n"
        f"- Limites: Min {bounding_box.get('min')} | Max {bounding_box.get('max')}\n"
        "Com base nessa densidade e na perda de pontos (ruído), forneça uma análise de engenharia "
        "curta (máximo 1 linha) avaliando a integridade do scan."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
        )
        content = response.choices[0].message.content
        return content.strip() if content else "Laudo não gerado."
    except OpenAIError as e:
        logger.error(f"Erro na API da OpenAI: {str(e)}")
        return "Falha de comunicação com a IA. O scan foi salvo, mas o laudo requer revisão da chave de API."
