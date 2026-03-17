"""
Deterministic Resume Parser v3
Primary format handled: "Title  /  Company\tDate" (Sairam's DOCX format)
Also handles stacked and dash-separated formats.
"""

import re
from typing import Optional

# ── Date range — handles "Feb 2026 – Present" AND "2026 – Present" ──────────
DATE_RANGE = re.compile(
    r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})'
    r'\s*[\-\u2013\u2014]\s*'
    r'(Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})',
    re.I
)

# "Title  /  Company\tDate"
JOB_SLASH_DATE = re.compile(r'^(.+?)\s{1,4}/\s{1,4}(.+?)\t(.+)$')
# "Title  /  Company" (no inline date, 2+ spaces around slash)
JOB_SLASH_ONLY = re.compile(r'^(.+?)\s{2,}/\s{2,}(.+)$')

EMAIL_RE  = re.compile(r'[\w\.\+\-]+@[\w\.\-]+\.\w{2,}')
PHONE_RE  = re.compile(r'\(?\d{3}\)?[\s\.\-]?\d{3}[\s\.\-]?\d{4}')
YEAR_RE   = re.compile(r'\b(20\d{2}|19\d{2})\b')
DEGREE_RE = re.compile(
    r'\b(Bachelor|Master|Doctor|PhD|B\.?S\.?|M\.?S\.?|B\.?Tech|M\.?Tech|'
    r'B\.?E\.?|M\.?E\.?|MBA|BBA|Associate|Diploma)\b', re.I
)

SECTION_MAP = [
    (re.compile(r'^(PROFESSIONAL\s+)?SUMMARY$', re.I),               'summary'),
    (re.compile(r'^(PROFESSIONAL\s+)?EXPERIENCE$', re.I),            'experience'),
    (re.compile(r'^WORK\s+EXPERIENCE$', re.I),                       'experience'),
    (re.compile(r'^EMPLOYMENT(\s+HISTORY)?$', re.I),                 'experience'),
    (re.compile(r'^KEY\s+PROJECTS?$', re.I),                         'projects'),
    (re.compile(r'^PROJECTS?$', re.I),                                'projects'),
    (re.compile(r'^EDUCATION$', re.I),                                'education'),
    (re.compile(r'^CERTIFICATIONS?(\s+[&]\s+LICENSES?)?$', re.I),   'certifications'),
    (re.compile(r'^LICENSES?(\s+(AND|[&])\s+CERTIFICATIONS?)?$', re.I), 'certifications'),
    (re.compile(r'^(CORE\s+)?SKILLS?$', re.I),                       'skills'),
    (re.compile(r'^TECHNICAL\s+SKILLS?$', re.I),                     'skills'),
]


def detect_section(s: str) -> Optional[str]:
    for pat, name in SECTION_MAP:
        if pat.match(s.strip()):
            return name
    return None


def extract_date(s: str) -> str:
    m = DATE_RANGE.search(s)
    return m.group(0) if m else ''


def is_date_only(s: str) -> bool:
    m = DATE_RANGE.search(s)
    if not m:
        return False
    remainder = DATE_RANGE.sub('', s).strip().strip('-\u2013\u2014').strip()
    return len(remainder) < 5


def parse_resume_deterministic(text: str) -> dict:
    result = {
        'name': '', 'email': '', 'phone': '', 'location': '',
        'links': {'linkedin': '', 'github': '', 'portfolio': ''},
        'summary': '', 'employers': [], 'projects': [],
        'education': [], 'certifications': [], 'skills_raw': [],
    }

    lines = [l.rstrip() for l in text.split('\n')]
    non_empty = [l for l in lines if l.strip()]

    # ── Header: name is first line; scan next 5 for contact info ────────────
    if non_empty:
        name = non_empty[0].strip()
        # Verify name against raw text — don't truncate
        raw_lines = text.split('\n')
        for line in raw_lines[:3]:
            # Remove asterisks (markdown bold) and strip
            clean = re.sub(r'\*+', '', line).strip()
            if clean.upper() == name.upper() or name.upper() in clean.upper():
                name = clean
                break
        result['name'] = name

    for line in non_empty[1:6]:
        s = line.strip()
        if not s:
            continue
        # Stop scanning once we hit a section header or long sentence
        if detect_section(s) or len(s) > 120:
            break
        if EMAIL_RE.search(s) and not result['email']:
            result['email'] = EMAIL_RE.search(s).group()
        if PHONE_RE.search(s) and not result['phone']:
            result['phone'] = PHONE_RE.search(s).group()
        # Location: find segment with comma but no email/phone
        # Works for "email | phone | City, State" — takes LAST matching segment
        if '|' in s and not result['location']:
            for seg in [p.strip() for p in s.split('|')]:
                if ',' in seg and not EMAIL_RE.search(seg) and not PHONE_RE.search(seg):
                    result['location'] = seg
        if 'linkedin.com' in s.lower():
            result['links']['linkedin'] = s
        if 'github.com' in s.lower():
            result['links']['github'] = s

    # ── State machine ────────────────────────────────────────────────────────
    current_section  = None
    summary_lines    = []
    current_employer = None
    current_bullets  = []
    expect_location  = False
    current_project  = None
    proj_bullets     = []

    def flush_employer():
        nonlocal current_employer, current_bullets, expect_location
        if current_employer:
            current_employer['bullets'] = current_bullets[:]
            result['employers'].append(current_employer)
        current_employer = None
        current_bullets  = []
        expect_location  = False

    def flush_project():
        nonlocal current_project, proj_bullets
        if current_project:
            current_project['bullets'] = proj_bullets[:]
            result['projects'].append(current_project)
        current_project = None
        proj_bullets    = []

    def make_employer(company, title, dates):
        dm = DATE_RANGE.search(dates)
        return {
            'company':  company,
            'title':    title,
            'location': '',
            'dates':    dates,
            'start':    dm.group(1) if dm else '',
            'end':      dm.group(2) if dm else 'Present',
            'bullets':  [],
        }

    for line in lines:
        s = line.strip()
        if not s:
            continue

        sec = detect_section(s)
        if sec:
            flush_employer()
            flush_project()
            current_section = sec
            expect_location = False
            continue

        # ── SUMMARY ──────────────────────────────────────────────────────────
        if current_section == 'summary':
            summary_lines.append(s)
            continue

        # ── SKILLS ───────────────────────────────────────────────────────────
        if current_section == 'skills':
            result['skills_raw'].append(s)
            continue

        # ── CERTIFICATIONS ───────────────────────────────────────────────────
        if current_section == 'certifications':
            result['certifications'].append(re.sub(r'^[•\-\*]\s*', '', s))
            continue

        # ── EDUCATION ────────────────────────────────────────────────────────
        if current_section == 'education':
            _parse_edu(s, result['education'])
            continue

        # ── PROJECTS ─────────────────────────────────────────────────────────
        if current_section == 'projects':
            is_bullet_line = s.startswith(('•', '-', '*'))
            has_separator  = any(sep in s for sep in (' \u2014 ', ' \u2013 ', '  \u2014  '))

            if is_bullet_line:
                if current_project is not None:
                    proj_bullets.append(re.sub(r'^[•\-\*]\s*', '', s))
            elif has_separator or (current_project is None and not is_bullet_line):
                flush_project()
                # Split on em-dash separator
                for sep in ('  \u2014  ', ' \u2014 ', ' \u2013 '):
                    if sep in s:
                        parts = s.split(sep, 1)
                        name  = parts[0].strip()
                        tech  = [t.strip() for t in re.split(r'[·,]', parts[1]) if t.strip()]
                        current_project = {'name': name, 'tech_stack': tech, 'link': ''}
                        proj_bullets = []
                        break
                else:
                    current_project = {'name': s, 'tech_stack': [], 'link': ''}
                    proj_bullets = []
            elif current_project is not None and not detect_section(s):
                # Plain text continuation bullet
                proj_bullets.append(s)
            continue

        # ── EXPERIENCE ───────────────────────────────────────────────────────

        # Format 1 (PRIMARY): "Title  /  Company\tDate"
        m = JOB_SLASH_DATE.match(s)
        if m and DATE_RANGE.search(m.group(3)):
            flush_employer()
            dates = extract_date(m.group(3))
            current_employer = make_employer(
                company=m.group(2).strip(),
                title=m.group(1).strip(),
                dates=dates
            )
            expect_location = True
            continue

        # Format 2: "Title  /  Company" no inline date
        m2 = JOB_SLASH_ONLY.match(s)
        if m2 and not DATE_RANGE.search(s) and not detect_section(s):
            flush_employer()
            current_employer = make_employer(
                company=m2.group(2).strip(),
                title=m2.group(1).strip(),
                dates=''
            )
            expect_location = True
            continue

        # Date-only line (fills Format 2 entry)
        if is_date_only(s) and current_employer and not current_employer['dates']:
            dates = extract_date(s)
            dm = DATE_RANGE.search(dates)
            current_employer['dates'] = dates
            current_employer['start'] = dm.group(1) if dm else ''
            current_employer['end']   = dm.group(2) if dm else 'Present'
            continue

        # Location line (immediately after job header)
        if expect_location and current_employer:
            if (not s.startswith(('•', '-', '*'))
                    and not DATE_RANGE.search(s)
                    and len(s) < 60
                    and not detect_section(s)
                    and not JOB_SLASH_DATE.match(s)
                    and not JOB_SLASH_ONLY.match(s)):
                current_employer['location'] = s
                expect_location = False
                continue
            else:
                expect_location = False

        # Bullet with leading character
        if s.startswith(('•', '-', '*')) and current_employer:
            current_bullets.append(re.sub(r'^[•\-\*]\s*', '', s))
            continue

        # Plain-text bullet (List Paragraph style, no leading char)
        if (current_employer
                and not detect_section(s)
                and not JOB_SLASH_DATE.match(s)
                and not JOB_SLASH_ONLY.match(s)
                and not is_date_only(s)
                and len(s) > 15):
            current_bullets.append(s)

    flush_employer()
    flush_project()
    result['summary'] = ' '.join(summary_lines).strip()
    return result


def _parse_edu(s: str, education: list):
    year_m = YEAR_RE.search(s)
    year   = year_m.group() if year_m else ''
    # Remove tab+year patterns like "\t2024"
    clean  = re.sub(r'\t\s*\d{4}', '', s).strip()
    clean  = YEAR_RE.sub('', clean).strip().strip('|').strip().strip('\u2014\u2013-').strip()

    if DEGREE_RE.search(clean):
        degree, major, university = '', '', ''
        # "Master of Science: MIS — University" or "Master of Science, MIS"
        for sep in (':', ','):
            if sep in clean:
                parts  = clean.split(sep, 1)
                degree = parts[0].strip()
                rest   = parts[1].strip()
                for dsep in (' \u2014 ', ' \u2013 ', ' - '):
                    if dsep in rest:
                        sub       = rest.split(dsep, 1)
                        major     = sub[0].strip()
                        university = sub[1].strip()
                        break
                else:
                    major = rest.strip()
                break
        else:
            degree = clean

        # Merge into previous entry if it has university but no degree yet
        if education and education[-1].get('university') and not education[-1].get('degree'):
            education[-1]['degree'] = degree
            education[-1]['major']  = major
            if year:
                education[-1]['year'] = year
        else:
            education.append({'degree': degree, 'major': major,
                               'university': university, 'year': year})
    else:
        # University name line
        if education and not education[-1].get('university'):
            education[-1]['university'] = clean
            if year:
                education[-1]['year'] = year
        else:
            education.append({'degree': '', 'major': '',
                               'university': clean, 'year': year})


def merge_with_ai_facts(det: dict, ai: dict) -> dict:
    """Merge: deterministic wins on structure, AI wins on summary prose only."""
    merged = dict(det)
    # Use AI summary only if deterministic found none
    if ai.get('summary_original') and not merged.get('summary'):
        merged['summary'] = ai['summary_original']
    # Links
    for k in ('linkedin', 'github', 'portfolio'):
        if not merged['links'].get(k) and ai.get('links', {}).get(k):
            merged['links'][k] = ai['links'][k]
    # Certs — only fill if deterministic found none
    if not merged['certifications']:
        ai_certs = (ai.get('certifications')
                    or ai.get('skills', {}).get('certifications', []))
        if ai_certs:
            merged['certifications'] = ai_certs
    return merged


def validate_parse(result: dict, resume_text: str) -> dict:
    import logging
    logger = logging.getLogger(__name__)
    raw_dates   = len(DATE_RANGE.findall(resume_text))
    n_employers = len(result['employers'])
    if n_employers < raw_dates - 1:
        logger.warning(f'[DET PARSER] {n_employers} employers, ~{raw_dates} date ranges in text')
    for emp in result['employers']:
        if not emp.get('company'):
            logger.warning(f'[DET PARSER] Missing company: {emp.get("title")} {emp.get("dates")}')
    logger.info(f'[DET PARSER] {n_employers} employers, {len(result["projects"])} projects, '
                f'{len(result["education"])} edu, {len(result["certifications"])} certs')
    return result
