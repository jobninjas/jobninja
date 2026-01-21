
import os
import json
import asyncio
import argparse
import re
from typing import List, Dict, Any, Optional
import docx
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import logging
from resume_analyzer import call_groq_api, clean_json_response

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class ContentUnit:
    def __init__(self, id: str, text: str, unit_type: str, original_index: int):
        self.id = id
        self.text = text
        self.unit_type = unit_type # 'heading', 'bullet', 'paragraph', 'header'
        self.original_index = original_index
        self.rewritten = None

class ResumeTailor:
    def __init__(self, template_path: str, base_path: str, jd: str, reference_path: str = None):
        self.template_path = template_path
        self.base_path = base_path
        self.jd = jd
        self.reference_path = reference_path
        self.units: List[ContentUnit] = []
        self.template_styles = {}
        self.reference_content = ""

    def parse_base_resume(self):
        doc = docx.Document(self.base_path)
        logger.info(f"Parsing base resume: {self.base_path}")
        
        for i, para in enumerate(doc.paragraphs):
            text = para.text.strip()
            if not text:
                continue
            
            unit_type = 'paragraph'
            if self._is_bullet(para):
                unit_type = 'bullet'
            elif self._is_heading(para):
                unit_type = 'heading'
            elif i < 5: # Likely name/contact info
                unit_type = 'header'
            
            unit_id = f"unit_{i}_{unit_type}"
            self.units.append(ContentUnit(unit_id, text, unit_type, i))
        
        logger.info(f"Extracted {len(self.units)} content units.")

    def _is_bullet(self, para):
        if para._p.get_or_add_pPr().numPr:
            return True
        if para.text.strip().startswith(('•', '-', '*', '⁃')):
            return True
        return False

    def _is_heading(self, para):
        text = para.text.strip()
        if "Heading" in para.style.name:
            return True
        if len(text) < 50 and text.isupper():
            return True
        return False

    def analyze_template_styles(self):
        doc = docx.Document(self.template_path)
        logger.info(f"Analyzing template styles: {self.template_path}")
        
        style_map = {
            'header': None,
            'heading': None,
            'bullet': None,
            'paragraph': None
        }
        
        for i, para in enumerate(doc.paragraphs):
            if not para.text.strip(): continue
            
            u_type = 'paragraph'
            if self._is_bullet(para):
                u_type = 'bullet'
            elif self._is_heading(para):
                u_type = 'heading'
            elif i < 3:
                u_type = 'header'
            
            if style_map[u_type] is None:
                style_map[u_type] = self._get_para_format(para)
                logger.debug(f"Captured {u_type} style from template paragraph {i}")

        self.template_styles = style_map
        if not self.template_styles['paragraph']:
             if doc.paragraphs:
                 self.template_styles['paragraph'] = self._get_para_format(doc.paragraphs[0])
             else:
                 self.template_styles['paragraph'] = {'style_name': 'Normal', 'font_name': 'Arial', 'font_size': 11}
        
        for k in style_map:
            if not self.template_styles[k]:
                self.template_styles[k] = self.template_styles['paragraph']

    def _get_para_format(self, para):
        format_info = {
            'style_name': para.style.name,
            'alignment': para.alignment,
            'runs': []
        }
        if para.runs:
            run = para.runs[0]
            format_info['font_name'] = run.font.name
            format_info['font_size'] = run.font.size.pt if run.font.size else None
            format_info['bold'] = run.bold
            format_info['italic'] = run.italic
        
        format_info['left_indent'] = para.paragraph_format.left_indent.pt if para.paragraph_format.left_indent else None
        format_info['first_line_indent'] = para.paragraph_format.first_line_indent.pt if para.paragraph_format.first_line_indent else None
        
        return format_info

    async def get_tailored_content(self, strict_mode: bool = True):
        logger.info("Preparing LLM prompt for content tailoring...")
        
        # Load reference content if provided
        ref_text = ""
        if self.reference_path and os.path.exists(self.reference_path):
            try:
                ref_doc = docx.Document(self.reference_path)
                ref_text = "\n".join([p.text for p in ref_doc.paragraphs if p.text.strip()])
            except: pass

        units_json = [{"id": u.id, "text": u.text, "type": u.unit_type} for u in self.units]
        
        ref_section = f"\n# REFERENCE EXAMPLE (STYLE/CONTENT QUALITY)\n{ref_text}\n" if ref_text else ""

        prompt = f"""
        # ROLE
        Expert Resume Tailoring Specialist.
        
        # OBJECTIVE
        Rewrite the following resume content units to align with the provided Job Description.
        {ref_section}
        # JOB DESCRIPTION
        {self.jd}
        
        # RULES
        1. NEVER delete any content. Every unit must have a corresponding "rewritten" version.
        2. NO REMOVING BULLETS. Maintain the exact number of bullets.
        3. NO TRUNCATION. Do not skip any IDs.
        4. REWRITE for keywords, but KEEP meaning truthful.
        5. OUTPUT: Return a JSON object ONLY.
        
        # OUTPUT FORMAT
        {{
          "units": [
            {{
              "id": "unit_id",
              "original": "original text",
              "rewritten": "your tailored version"
            }}
          ]
        }}
        
        # CONTENT UNITS
        {json.dumps(units_json, indent=2)}
        """
        
        max_retries = 3
        for attempt in range(max_retries):
            logger.info(f"LLM Tailoring Attempt {attempt + 1}/{max_retries}...")
            response = await call_groq_api(prompt, max_tokens=6000)
            
            if not response: continue
                
            try:
                clean_json = clean_json_response(response)
                data = json.loads(clean_json)
                received_units = data.get('units', [])
                received_ids = {u['id'] for u in received_units}
                missing_ids = [u.id for u in self.units if u.id not in received_ids]
                
                self._merge_results(received_units)
                
                if not missing_ids:
                    logger.info("Successfully received all tailored units.")
                    return True
                else:
                    logger.warning(f"Missing IDs: {missing_ids}. Retrying...")
                    missing_units_json = [u for u in units_json if u['id'] in missing_ids]
                    prompt = f"RETRY: You missed these units! Return ONLY the missing ones as JSON: {json.dumps(missing_units_json)}"
            except Exception as e:
                logger.error(f"Error: {e}")

        for u in self.units:
            if u.rewritten is None: u.rewritten = u.text
        return False

    def _merge_results(self, received_units):
        tailored_map = {item['id']: item['rewritten'] for item in received_units}
        for u in self.units:
            if u.id in tailored_map and tailored_map[u.id]:
                u.rewritten = tailored_map[u.id]

    def validate_results(self, strict_mode: bool = True):
        logger.info("--- Validation ---")
        total_units = len(self.units)
        tailored_count = sum(1 for u in self.units if u.rewritten and u.rewritten != u.text)
        logger.info(f"Total: {total_units} | Tailored: {tailored_count}")
        
        missing = [u.id for u in self.units if u.rewritten is None]
        if missing:
            msg = f"Missing {len(missing)} units: {missing}"
            if strict_mode: raise ValueError(msg)
            else: logger.error(msg)
            
        logger.info("Tailoring complete.")

    def generate_docx(self, out_path: str):
        logger.info(f"Generating DOCX: {out_path}")
        doc = docx.Document(self.template_path)
        
        # Clear existing paragraphs and tables
        for para in list(doc.paragraphs):
            p = para._element
            p.getparent().remove(p)
        for table in list(doc.tables):
            t = table._element
            t.getparent().remove(t)

        for u in self.units:
            style_info = self.template_styles.get(u.unit_type, self.template_styles['paragraph'])
            new_para = doc.add_paragraph(u.rewritten or u.text)
            
            try:
                new_para.style = style_info.get('style_name', 'Normal')
            except: pass
            
            if style_info.get('alignment') is not None:
                new_para.alignment = style_info['alignment']
            
            if style_info.get('left_indent') is not None:
                new_para.paragraph_format.left_indent = Pt(style_info['left_indent'])
            
            if new_para.runs:
                run = new_para.runs[0]
                if style_info.get('font_name'): run.font.name = style_info['font_name']
                if style_info.get('font_size'): run.font.size = Pt(style_info['font_size'])
                if style_info.get('bold') is not None: run.bold = style_info['bold']
                if style_info.get('italic') is not None: run.italic = style_info['italic']

        doc.save(out_path)
        logger.info(f"Saved to {out_path}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", required=True)
    parser.add_argument("--resume", required=True)
    parser.add_argument("--jd", required=True)
    parser.add_argument("--reference", help="Reference/Example resume DOCX path")
    parser.add_argument("--out", required=True)
    parser.add_argument("--strict", action="store_true", default=True)
    args = parser.parse_args()
    
    jd_content = args.jd
    if os.path.exists(args.jd):
        with open(args.jd, 'r', encoding='utf-8') as f:
            jd_content = f.read()

    tailor = ResumeTailor(args.template, args.resume, jd_content, reference_path=args.reference)
    tailor.parse_base_resume()
    tailor.analyze_template_styles()
    asyncio.run(tailor.get_tailored_content(strict_mode=args.strict))
    tailor.validate_results(strict_mode=args.strict)
    tailor.generate_docx(args.out)

if __name__ == "__main__":
    main()
