
# Resume Tailoring Pipeline

A robust CLI tool to tailor a resume DOCX to a job description while strictly adhering to a target template's formatting and ensuring 100% content preservation.

## Features
- **Style Source of Truth**: Inherits fonts, sizes, colors, and layout from a provided template DOCX.
- **Content Unit Chunking**: Breaks the resume into immutable units (bullets, headings, etc.) to prevent line cutting or content loss.
- **Structured LLM Pipeline**: Uses Llama-3 (via Groq) to perform structured rewrites with 1:1 mapping validation.
- **Retry Mechanism**: Automatically retries for missing units and falls back to original content if needed (never leaves units blank).
- **Validation Guardrails**: Ensures unit counts match exactly and flags significant truncations.

## Installation

Ensure you have the dependencies installed:

```bash
pip install python-docx pydantic aiohttp
```

## Usage

```bash
python tailor_resume.py \
  --template <path_to_template.docx> \
  --resume <path_to_user_resume.docx> \
  --jd <path_to_jd.txt_or_raw_text> \
  --reference <path_to_optimized_example.docx> \
  --out <path_to_output.docx>
```

### Example

```bash
python tailor_resume.py \
  --template Sai_Ram_AI_Developer_Resume_with_Project3.docx \
  --resume my_old_resume.docx \
  --jd "Seeking expert in Python and LLMs..." \
  --reference Optimized_Resume_Snowflake.docx \
  --out tailored_resume.docx
```

## Requirements Adherence
- **Never deletes content**: No bullets or segments are removed.
- **Exact Formatting**: The tool analyzes the template and applies its styles (font name, size, bold, indents) to the output.
- **No Truncation**: Validation ensures every input unit is present in the output.
- **Strict Mode**: Fails the run if any unit is missing from the AI response (default ON).
