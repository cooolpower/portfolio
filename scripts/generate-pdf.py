import os
import json
import urllib.request
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data.json")
PUBLIC_DIR = os.path.join(os.path.dirname(BASE_DIR), "public")

REGULAR_FONT_URL = "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Regular.ttf"
BOLD_FONT_URL = "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Bold.ttf"

REGULAR_FONT_PATH = os.path.join(BASE_DIR, "NanumGothic-Regular.ttf")
BOLD_FONT_PATH = os.path.join(BASE_DIR, "NanumGothic-Bold.ttf")

# Download fonts if they don't exist
def download_fonts():
    if not os.path.exists(REGULAR_FONT_PATH):
        print("Downloading NanumGothic Regular font...")
        urllib.request.urlretrieve(REGULAR_FONT_URL, REGULAR_FONT_PATH)
    if not os.path.exists(BOLD_FONT_PATH):
        print("Downloading NanumGothic Bold font...")
        urllib.request.urlretrieve(BOLD_FONT_URL, BOLD_FONT_PATH)

def format_text(text):
    if not text:
        return ""
    # Escape HTML special characters
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Convert **bold** markdown to <b>bold</b> HTML tags for ReportLab Paragraph
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    # Convert newlines to br tags
    text = text.replace("\n", "<br/>")
    return text

def build_pdf(data, output_filename, lang="ko"):
    profile = data["profile"]
    careers = data["careers"]
    projects = data["projects"]
    skills = data["skills"]

    pdf_path = os.path.join(PUBLIC_DIR, output_filename)
    
    # 0.5 inch margins (36 pt)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Define custom paragraph styles using NanumGothic
    name_style = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontName='NanumGothic-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )
    
    role_style = ParagraphStyle(
        'ResumeRole',
        parent=styles['Normal'],
        fontName='NanumGothic',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0d9488'), # teal-600 tint
        spaceAfter=8
    )
    
    contact_style = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='NanumGothic',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569') # slate-600
    )
    
    section_title_style = ParagraphStyle(
        'ResumeSectionTitle',
        parent=styles['Normal'],
        fontName='NanumGothic-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    section_header_text_style = ParagraphStyle(
        'ResumeSectionHeaderText',
        parent=styles['Normal'],
        fontName='NanumGothic-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='NanumGothic',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor('#334155'), # slate-700
        spaceAfter=6
    )
    
    timeline_style = ParagraphStyle(
        'ResumeTimeline',
        parent=styles['Normal'],
        fontName='NanumGothic',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#64748b'), # slate-500
        alignment=0 # Left align
    )
    
    job_title_style = ParagraphStyle(
        'ResumeJobTitle',
        parent=styles['Normal'],
        fontName='NanumGothic-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )
    
    job_desc_style = ParagraphStyle(
        'ResumeJobDesc',
        parent=styles['Normal'],
        fontName='NanumGothic',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569'),
        spaceAfter=4
    )
    
    bullet_style = ParagraphStyle(
        'ResumeBullet',
        parent=styles['Normal'],
        fontName='NanumGothic',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        firstLineIndent=-10,
        spaceAfter=2
    )

    story = []
    
    # 1. Header (Name, Title, Contact Info)
    story.append(Paragraph(profile["name"], name_style))
    story.append(Paragraph(profile["role"], role_style))
    
    contact_parts = [
        f"Email: {profile['email']}",
        f"GitHub: {profile['github']}"
    ]
    if lang == "ko":
        contact_parts.append("Location: Seoul, South Korea")
    else:
        contact_parts.append("Location: Seoul, South Korea")
        
    story.append(Paragraph(" | ".join(contact_parts), contact_style))
    story.append(Spacer(1, 10))
    
    # Divider line
    story.append(Table([[""]], colWidths=[540], rowHeights=[1], style=TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0)
    ])))
    story.append(Spacer(1, 8))
    
    # Helper to draw a section divider
    def add_section_header(title):
        p = Paragraph(title, section_header_text_style)
        header_table = Table([[p]], colWidths=[540])
        header_table.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0)
        ]))
        story.append(header_table)
        story.append(Spacer(1, 6))

    # 2. About Me
    add_section_header("ABOUT ME" if lang == "en" else "소개")
    story.append(Paragraph(format_text(profile["aboutMe"]), body_style))
    story.append(Spacer(1, 4))

    # 3. Experience
    add_section_header("EXPERIENCE" if lang == "en" else "경력 사항")
    
    for career in careers:
        # Left side: Date timeline
        left_flow = [Paragraph(career["period"], timeline_style)]
        
        # Right side: Job Details
        right_flow = []
        company_name = format_text(career['company'])
        if career.get('link'):
            company_display = f"<b><a href=\"{career['link']}\" color=\"#0d9488\">{company_name}</a></b> @ {career['role']}"
        else:
            company_display = f"<b>{company_name}</b> @ {career['role']}"
        right_flow.append(Paragraph(company_display, job_title_style))
        right_flow.append(Spacer(1, 2))
        
        if career.get("description"):
            right_flow.append(Paragraph(format_text(career["description"]), job_desc_style))
            
        # Group achievements by group name
        grouped_achievements = []
        current_group = None
        
        for ach in career.get("achievements", []):
            match = re.match(r'^\[(.*?)\]\s*(.*)$', ach)
            if match:
                group_name = match.group(1)
                text = match.group(2)
                if current_group and current_group['name'] == group_name:
                    current_group['items'].append(text)
                else:
                    current_group = {'name': group_name, 'items': [text]}
                    grouped_achievements.append(current_group)
            else:
                current_group = {'name': None, 'items': [ach]}
                grouped_achievements.append(current_group)
                
        group_links = career.get('groupLinks', {})
        for group in grouped_achievements:
            if group['name']:
                group_style = ParagraphStyle(
                    'GroupHeaderStyle', parent=job_title_style, fontSize=8.5, leading=12, spaceBefore=4, spaceAfter=2
                )
                display_name = format_text(group['name'])
                if group_links and group['name'] in group_links:
                    display_name = f'<a href="{group_links[group["name"]]}" color="#0d9488">{display_name}</a>'
                right_flow.append(Paragraph(display_name, group_style))
                for item in group['items']:
                    right_flow.append(Paragraph(f"&bull; {format_text(item)}", ParagraphStyle(
                        'GroupBullet', parent=bullet_style, leftIndent=22, firstLineIndent=-10
                    )))
            else:
                for item in group['items']:
                    right_flow.append(Paragraph(f"&bull; {format_text(item)}", bullet_style))
            
        if career.get("skills"):
            skills_txt = f"<i>Skills: {', '.join(career['skills'])}</i>"
            right_flow.append(Paragraph(skills_txt, ParagraphStyle(
                'JobSkills', parent=body_style, fontSize=8, textColor=colors.HexColor('#64748b'), spaceBefore=2
            )))
            
        right_flow.append(Spacer(1, 8))
        
        # Row table to align left and right parts
        # Total width = 540 (left=120, right=420)
        entry_table = Table([[left_flow, right_flow]], colWidths=[120, 420])
        entry_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        
        # Keep each career entry together on one page if possible
        story.append(KeepTogether([entry_table]))
        
    story.append(Spacer(1, 4))
    
    # 4. Projects
    add_section_header("PROJECTS" if lang == "en" else "프로젝트")
    
    for proj in projects:
        # Left side: Date timeline
        p_period = f"{proj['period']['start']} - {proj['period']['end']}"
        left_flow = [Paragraph(p_period, timeline_style)]
        
        # Right side: Project Details
        right_flow = []
        proj_display = f"<b>{proj['title']}</b> | {proj['role']}"
        right_flow.append(Paragraph(proj_display, job_title_style))
        right_flow.append(Spacer(1, 2))
        
        if proj.get("summary"):
            right_flow.append(Paragraph(format_text(proj["summary"]), job_desc_style))
            
        # Tech stacks
        techs = [tech["name"] for tech in proj.get("techStack", [])]
        if techs:
            tech_txt = f"<i>Tech Stack: {', '.join(techs)}</i>"
            right_flow.append(Paragraph(tech_txt, ParagraphStyle(
                'ProjTech', parent=body_style, fontSize=8, textColor=colors.HexColor('#0d9488'), spaceBefore=2
            )))
            
        right_flow.append(Spacer(1, 8))
        
        entry_table = Table([[left_flow, right_flow]], colWidths=[120, 420])
        entry_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        
        story.append(KeepTogether([entry_table]))
        
    story.append(Spacer(1, 4))
    
    # 5. Skills
    add_section_header("SKILLS" if lang == "en" else "보유 기술")
    
    skill_rows = []
    for cat in skills:
        label = f"<b>{cat['title']}</b>"
        skills_list = ", ".join(cat["skills"])
        skill_rows.append([Paragraph(label, job_title_style), Paragraph(skills_list, body_style)])
        
    skills_table = Table(skill_rows, colWidths=[120, 420])
    skills_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(KeepTogether([skills_table]))
    
    # Build Document
    doc.build(story)
    print(f"Generated PDF at {pdf_path}")

def main():
    download_fonts()
    
    # Register TrueType fonts
    pdfmetrics.registerFont(TTFont('NanumGothic', REGULAR_FONT_PATH))
    pdfmetrics.registerFont(TTFont('NanumGothic-Bold', BOLD_FONT_PATH))
    
    # Load exported JSON data
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Generate Korean Resume
    build_pdf(data["ko"], "resume.pdf", lang="ko")
    
    # Generate English Resume
    build_pdf(data["en"], "resume_en.pdf", lang="en")

if __name__ == "__main__":
    main()
