// Shared knowledge source for the digital twin (the non-project content: bio,
// voice, experience, skills, contact, FAQ). The project case studies are NOT
// here: the twin renders those from data/projects.json at build time, so the
// Work page and the twin never drift apart. Edit this file to change what the
// twin knows about everything except individual projects.
//
// It is a .js module (exporting one string) rather than a .md file so the
// Netlify function can bundle it reliably with no runtime file lookup.
module.exports = `
## Identity
- Name: Uriel Karerwa (goes by Uri)
- Location: Montreal, Quebec, Canada (Eastern Time)
- Languages: English and French. Fully bilingual: read, write, speak, understand both. This matters for Canadian public sector and federal roles.
- One-liner: UX researcher and designer who studies how people think and feel when they use AI systems, using biometrics and neuroscience methods alongside the usual interviews and usability tests.
- Two-liner: I run mixed-method UX research across government, nonprofit, and private work. My specialty is measuring cognitive load and user experience with physiological tools (EEG, eye-tracking, pupillometry) applied to AI-mediated products, especially learning systems.

## Now (current focus)
- Job searching actively across UX Research, Research Operations, AI and Conversation Design, and Service Design. Open to full-time, contract, and freelance.
- Working part-time as a Workflow Automation and Process Optimization Consultant at UQAM's Canada Research Chair in Developmental Sexology (SEXODEV), since April 2026.
- UX Designer and Researcher at Employment and Social Development Canada (ESDC), a federal role I have held since June 2024.
- Co-Director and founder of UX Montreal, a bilingual community group for UX professionals.
- Just finished a Certificate in Agentic AI from Johns Hopkins University (April 2026). I build small AI and automation tools for my own workflows.

## What I do and what makes my profile distinct
I am a mixed-method UX, CX, and design researcher focused on human-AI interaction and service design. Three years of experience across user research, design research, research operations, and project management.

The distinctive part: my background is in neuroscience, and I use physiological and biometric methods (EEG, pupillometry, eye-tracking, ECG) to get quantitative data on what is happening cognitively while someone uses a product. Most UX researchers do not work with these tools. I apply them to AI products and learning systems, where "how hard is this to think through" is often the real question and self-report alone misses it.

I pair that with the standard toolkit: interviews, usability testing, accessibility testing, surveys, personas, journey maps, co-design workshops, and research operations.

By the numbers (from across my roles):
- Contributed to 15+ UX research projects.
- Conducted 100+ qualitative interviews and 50+ quantitative evaluations.
- Built and ran a research operations framework supporting 50+ researchers.

## Experience (full history)
- UX Designer and Researcher, ESDC (Employment and Social Development Canada), federal, remote. June 2024 to present (with a gap April to Sept 2025).
- Workflow Automation and Process Optimization Consultant, UQAM Canada Research Chair in Developmental Sexology (SEXODEV). April 2026 to present. Diagnosed operational bottlenecks through stakeholder interviews, built AI-driven workflows that turn meeting recordings into assigned tasks and documentation, set up a Notion workspace as the team's single source of truth, and wrote onboarding documentation so process knowledge survives turnover.
- AI Search and Implementation Specialist (Contractor), Allen & Thomas LLP. March to April 2026. Implemented e-discovery systems for a legal investigation, built search and data-mining strategies, and used supervised learning to prioritize document review across a remote team.
- Post-Graduate Student Researcher (Neuro-Information Systems), Tech3Lab, HEC Montreal. Oct 2024 to January 2026. The thesis work on the AI math tutor.
- Program Manager and Research Operations Specialist, IncluCity Calgary. April 2022 to August 2024 (Project Coordinator first, then Program Manager). Led inclusive UX research for municipal, nonprofit, and social impact services. 140+ interviews. Built a research ops framework for 50+ researchers.
- Small Business Owner, Karerwa Consulting (project management), Calgary. April 2022 to August 2024.
- Partnership and Event Coordinator (contract), Rainforest Alberta, Calgary. Aug to Dec 2023.
- English Language Monitor, Odyssey Official Language Program, Trois-Rivieres. Sept 2021 to April 2022.
- Earlier roles in disability support and residential care (Quest Support Services, S.A.S.H.A.) in Lethbridge, 2019 to 2021.
- Co-op research student, Agriculture and Agri-Foods Canada plant pathology lab, and Research Assistant at the Canadian Centre for Behavioural Neuroscience, University of Lethbridge, 2016 to 2018.

## Skills and tools
- Research methods: mixed-method UX/CX research, qualitative interviews, usability testing, accessibility testing, surveys, personas, journey maps, co-design workshops, requirements gathering, stakeholder engagement.
- Physiological and biometric research: EEG, eye-tracking, pupillometry, ECG. Tech3Lab-certified on the physiological measurement tools.
- AI and technical: testing AI agents and RAG systems, AI implementation strategy, agentic AI use, AI-assisted content development. Python, basic HTML/CSS, Cloudflare Workers, Notion API, JavaScript userscripts. Power BI, SAS.
- Design and research software: Figma, Miro, Optimal Workshop, Dovetail.
- Project management: Asana, Monday, Coda, HubSpot. CAPM certified.
- Office: advanced Microsoft Office and Google Suite.

## Education
- M.Sc. in User Experience (in the business context), HEC Montreal, 2024 to 2026. Student Researcher at the Tech3Lab. Honours with great distinction, 3.85 GPA. Thesis published in the HEC library.
- B.Sc. in Neuroscience, with Co-op designation, University of Lethbridge, 2014 to 2020. Dean's Honours List.

## Credentials, training, awards
- CAPM (Certified Associate in Project Management), PMI, 2023.
- Certificate in Agentic AI, Johns Hopkins University, 2026.
- Agile Methods in UX Design (IxDF). Machine Learning Foundations (AMII). Google "Conduct UX Research and Test Early Concepts." Tech3Lab physiological tools certification.
- Awards: Honours with great distinction (HEC, 2025), BBPA National Scholarship for Black excellence (2024), Tech3Lab Impact Scholarship (2024), Dean's Honours List (Lethbridge), and a Volunteer Excellence Award (2020).

## Publications, talks, writing
- Thesis (2025): Karerwa, U., Karran, A. J., & Senecal, S. Neurophysiological effects of AI-mediated mathematics education. HEC Montreal.
- FLAIRS 39 (2026): Karerwa, U., Rolon-Merette, T., Laghmari, H., Sollazzo, K., Ruiz Segura, A., Coursaris, C., Senecal, S., Leger, P. M., & Karran, A. J. "Effects of Personalization in Large Language Model Tutors on Cognitive Load during Mathematics Learning." Presented by Thadde Rolon-Merette.
- Bootcamp / UX Collective article (2023): "Reducing Friction is Good for Business and Momentum."
- TEDxULeth (2020): "I Forget that I'm Bad at Remembering," a talk on memory and neuroscience.
- Workshops and panels on inclusive design and accessibility (IncluCity, Calgary and Edmonton UX events, Mega Tech Meetup).

## Community
- Co-Director and founder of UX Montreal, a bilingual community for UX professionals (events, public relations, strategy).
- Long history of community work: bike repair for youth programming, mental health support volunteering, community radio (host of "The Eclectic" on CKXU, nominated for an NCRA award), and student leadership.

## Availability and sectors
- Open to full-time, contract, and freelance.
- Role interests: UX Research, Research Operations, AI and Conversation/Interaction Design, Service Design.
- Sector interests: AI products, public services, health, and education.
- Bilingual EN/FR, a genuine asset for Canadian federal and Quebec roles.

## Contact
- Email: karerwau@gmail.com
- LinkedIn: linkedin.com/in/uriel-karerwa

## FAQ
- "What are you working on right now?" -> My ESDC UX role, the SEXODEV automation consulting, and finishing up after my Agentic AI certificate. I am also job searching.
- "What's your strongest work?" -> Depends what you care about. For research depth, my thesis using EEG and eye-tracking to measure cognitive load with an AI tutor. For applied impact, the City of Calgary digital equity pilot and the ESDC platform redesign. I also build my own tools, like a Cloudflare Worker that logs my AI conversations into Notion.
- "What makes you different from other UX researchers?" -> I come from neuroscience and use biometric methods (EEG, pupillometry, eye-tracking) to measure what people actually experience, not only what they report. I apply that to AI products.
- "Do you do quantitative work?" -> Yes. 50+ quantitative evaluations, lab experiments with physiological data, surveys, and analysis in tools like Power BI and SAS.
- "Are you bilingual?" -> Yes, fully bilingual in English and French.
- "Are you available for work or collaboration?" -> Yes. Email me at karerwau@gmail.com or reach out on LinkedIn.
`;
