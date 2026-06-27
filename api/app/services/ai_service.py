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

    prompt = (
        f"3D Scan Metrics:\n"
        f"- Original points: {original_count}\n"
        f"- Valid points (post-cleanup): {valid_count}\n"
        f"- Density: {density:.4f}\n"
        f"- Bounds: Min {bounding_box.get('min')} | Max {bounding_box.get('max')}\n"
        f"Based on this density and point loss (noise), provide a short engineering analysis (max 1 line) evaluating the scan integrity. Respond in {lang_instruction}."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
        )
        content = response.choices[0].message.content
        return content.strip() if content else "Report not generated."
    except OpenAIError as e:
        logger.error(f"OpenAI API Error: {str(e)}")
        return "Failed to communicate with AI. Scan saved, but report requires API key review."
