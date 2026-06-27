import os
from openai import OpenAI


def generate_technical_report(valid_points_count: int, anomaly_detected: bool) -> str:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-api-key"))

    prompt = (
        f"Quantidade de pontos válidos: {valid_points_count}. "
        f"Anomalia detectada: {anomaly_detected}. "
        "Forneça um laudo técnico de exata 1 linha dizendo se o robô deve prosseguir ou parar."
    )

    response = client.chat.completions.create(
        model="gpt-4o", messages=[{"role": "user", "content": prompt}], max_tokens=100
    )

    content = response.choices[0].message.content
    return content.strip() if content else "Laudo não gerado."
