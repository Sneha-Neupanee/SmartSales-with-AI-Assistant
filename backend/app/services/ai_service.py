import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


def generate_ai_explanation(stats: dict) -> dict:
    """Generate AI-powered business insights using OpenAI GPT."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OpenAI API key not configured. Please add OPENAI_API_KEY to .env file"
        )

    client = OpenAI(api_key=api_key)

    prompt = f"""
You are a business analyst AI assistant. Analyze the following business statistics and provide actionable insights.

Business Statistics:
{stats}

Please provide:
1. A brief summary of the overall business performance
2. Key strengths and opportunities
3. Areas of concern or risk
4. 3-5 specific, actionable recommendations to improve profitability

Keep your response concise, professional, and focused on actionable advice. Format your response with clear sections.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert business analyst who provides clear, actionable "
                    "insights based on sales data."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=800,
    )

    return {
        "status": "success",
        "explanation": response.choices[0].message.content,
        "model_used": "gpt-4o-mini",
        "tokens_used": response.usage.total_tokens,
    }
