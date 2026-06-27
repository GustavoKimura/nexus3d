import os
import logging
from openai import OpenAI, OpenAIError

logger = logging.getLogger(__name__)


def generate_technical_report(
    original_count: int,
    valid_count: int,
    density: float,
    bounding_box: dict,
    language: str = "en",
) -> str:
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError("OpenAI API key is missing. Check the .env file.")

    client = OpenAI(api_key=api_key)
    lang_instruction = "English" if language == "en" else "Japanese"

    loss_percentage = (
        ((original_count - valid_count) / original_count * 100)
        if original_count > 0
        else 0
    )
    max_bound = bounding_box.get("max")
    max_z = max_bound[2] if max_bound and len(max_bound) >= 3 else 0.0

    prompt = (
        f"You are a Senior Data Quality Inspector for 3D LiDAR surveying. Analyze the following telemetry data from a surveying robot. "
        f"Original points collected: {original_count}. "
        f"Valid points after noise reduction filtering: {valid_count}. "
        f"Loss rate: {loss_percentage:.2f}%. "
        f"Max terrain height (Z): {max_z:.4f}. "
        f"Write a strict, concise technical report (maximum 2 sentences) assessing the viability of this scan for generating a Digital Twin. "
        f"Use professional surveying terminology. Evaluate if the noise loss is acceptable and state if the data is approved for 3D modeling. "
        f"Return the text strictly in {lang_instruction}."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
        )
        content = response.choices[0].message.content
        return content.strip() if content else "Report not generated."
    except OpenAIError as e:
        logger.error(f"OpenAI API Error: {str(e)}")
        return "Failed to communicate with AI. Scan saved, but report requires API key review."
