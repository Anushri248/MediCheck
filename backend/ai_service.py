import os
import re
from datetime import date
import google.generativeai as genai

def calculate_age(dob_str):
    try:
        dob = date.fromisoformat(dob_str)
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except (ValueError, TypeError):
        return 0

def extract_section(text, start_header, end_header=None):
    if end_header:
        pattern = f"{start_header}(.*?){end_header}"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    else:
        pattern = f"{start_header}(.*)"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        
    if match:
        return match.group(1).strip()
    return ""

def parse_list(text):
    items = []
    for line in text.split('\n'):
        line = line.strip()
        if line.startswith(('•', '-', '*')):
            items.append(line[1:].strip())
        elif line: # handle cases where AI forgets the bullet point
            items.append(line)
    return items

def generate_health_report(patient_data):
    fallback = {
        "clinical_summary": "",
        "identified_risks": [],
        "risk_level": "UNKNOWN",
        "recommendations": [],
        "follow_up": ""
    }

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return fallback

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        gender = patient_data.get('gender', 'Other')
        age = calculate_age(patient_data.get('date_of_birth', ''))
        
        hb_normal = "12.0-17.5"
        if gender.lower() == 'male':
            hb_normal = "13.5-17.5"
        elif gender.lower() == 'female':
            hb_normal = "12.0-15.5"
            
        prompt = f"""You are a clinical AI assistant helping healthcare administrators 
understand patient blood test results.

Analyze the following patient data and return a structured health report.

Patient Details:
- Name: {patient_data.get('full_name')}
- Gender: {gender}
- Age: {age} years
- Glucose: {patient_data.get('glucose')} mg/dL (Normal: 70-100 mg/dL fasting)
- Haemoglobin: {patient_data.get('haemoglobin')} g/dL (Normal: {hb_normal})
- Cholesterol: {patient_data.get('cholesterol')} mg/dL (Normal: below 200 mg/dL)

Return your response in this EXACT format with these EXACT section headers:

CLINICAL SUMMARY:
[2-3 sentence overview of the patient's overall blood test results]

IDENTIFIED RISKS:
• [Risk 1]
• [Risk 2]
• [Risk 3 if applicable]

RISK LEVEL: [return only one of these exact words: LOW / MODERATE / HIGH]

RECOMMENDATIONS:
• [Recommendation 1]
• [Recommendation 2]
• [Recommendation 3]

FOLLOW UP:
[One sentence on when and why the patient should follow up]

Be clinical, concise, and specific to the values provided.
Do not add any disclaimers or notes after the report.
"""

        response = model.generate_content(prompt)
        text = response.text

        report = {
            "clinical_summary": "",
            "identified_risks": [],
            "risk_level": "UNKNOWN",
            "recommendations": [],
            "follow_up": ""
        }

        # Parse sections
        summary_raw = extract_section(text, r"CLINICAL SUMMARY:", r"IDENTIFIED RISKS:")
        risks_raw = extract_section(text, r"IDENTIFIED RISKS:", r"RISK LEVEL:")
        risk_level_raw = extract_section(text, r"RISK LEVEL:", r"RECOMMENDATIONS:")
        recs_raw = extract_section(text, r"RECOMMENDATIONS:", r"FOLLOW UP:")
        follow_up_raw = extract_section(text, r"FOLLOW UP:")

        report['clinical_summary'] = summary_raw
        report['identified_risks'] = parse_list(risks_raw)
        
        rl = risk_level_raw.upper().strip()
        if "HIGH" in rl:
            report['risk_level'] = "HIGH"
        elif "MODERATE" in rl:
            report['risk_level'] = "MODERATE"
        elif "LOW" in rl:
            report['risk_level'] = "LOW"
            
        report['recommendations'] = parse_list(recs_raw)
        report['follow_up'] = follow_up_raw

        return report

    except Exception:
        # Fallback dictionary on any exception (timeout, malformed API response, etc.)
        return fallback
