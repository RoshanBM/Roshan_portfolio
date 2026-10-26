// All site copy lives here. Edit this file to update the portfolio.
// Keep hyphens (-) for ranges; the design avoids em dashes.

export const person = {
  name: 'Roshan Balaji Mahashabde',
  shortName: 'Roshan Mahashabde',
  monogram: 'RBM',
  role: 'ML / AI Engineer',
  location: 'London, UK',
  email: 'roshanbalajim2004@gmail.com',
  linkedin: 'https://www.linkedin.com/in/roshan-mahashabde',
  github: 'https://github.com/RoshanBM',
  cv: '/Roshan-Mahashabde-CV.pdf',
};

export const discs = [
  {
    id: 'about',
    label: 'About',
    title: 'About',
    art: 'about',
    rim: 'ROSHAN BALAJI MAHASHABDE     MSC APPLIED AI     UNIVERSITY OF WARWICK     2026',
    // Shown in the top-left table while the disc is centred
    credits: [
      ['Name', 'Roshan B. Mahashabde'],
      ['Based in', 'London, UK'],
      ['Studying', 'MSc Applied AI, Warwick'],
      ['Open to', 'ML & AI Engineer roles'],
    ],
    // Two highlights shown under the disc
    highlights: [
      ['Warwick', 'MSc Applied AI'],
      ['RV College', 'BE Electronics, 2:1'],
    ],
    // Detail view
    byline: [
      ['Focus', 'LLMs, computer vision, data pipelines'],
      ['Works in', 'Python, PyTorch'],
    ],
    specs: [
      ['Degree', 'MSc Applied Artificial Intelligence'],
      ['Graduating', 'January 2027'],
      ['Right to work', 'United Kingdom'],
      ['Languages', 'English (fluent)'],
    ],
    statement: ['I turn research', 'into software', 'that reaches', 'real users'],
    intro:
      'Engineering graduate finishing an MSc in Applied Artificial Intelligence at Warwick, with three research internships and four peer-reviewed publications. I build, deploy and test machine learning systems across LLMs, computer vision and data pipelines.',
    tracks: [
      {
        title: 'MSc Applied Artificial Intelligence',
        meta: 'University of Warwick',
        time: '2025-2026',
        body: [
          'Modules: Artificial Intelligence & Deep Learning, Fundamentals of AI and Data Mining, Programming for Artificial Intelligence.',
          'Dissertation: Machine-learning detection of GNSS multipath: generalisation, interpretability, and the limits of measurement exclusion for reliable navigation.',
        ],
      },
      {
        title: 'BE Electronics and Communication',
        meta: 'RV College of Engineering',
        time: '2021-2025',
        body: [
          'Awarded a 2:1 (UK equivalent). Modules: Signal Processing, Embedded Systems, Machine Learning.',
          'Final-year project: an LLM assistant for data acquisition and control systems, published at IEEE INSPECT 2025.',
        ],
      },
      {
        title: 'Toolkit',
        meta: 'Languages, ML, data, engineering',
        time: 'Skills',
        body: [
          'Python, MATLAB, SQL, C/C++.',
          'PyTorch, TensorFlow, scikit-learn, Hugging Face, XGBoost, OpenCV.',
          'Pandas, NumPy, SQLite, Plotly.js, Docker, Git, Flask, HTML/CSS/JavaScript.',
        ],
      },
      {
        title: 'Certificates',
        meta: 'NPTEL',
        time: '2023-2024',
        body: [
          'Foundation of Cloud IoT Edge ML (May 2024).',
          'Programming, Data Structures and Algorithms Using Python (Sept 2023).',
        ],
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    title: 'Projects',
    art: 'projects',
    rim: 'SELECTED PROJECTS     PYTHON     PYTORCH     XGBOOST     FLASK     2025-2026',
    credits: [
      ['Tracks', '6 projects'],
      ['Stack', 'Python, XGBoost, Flask'],
      ['Years', '2025-2026'],
      ['Source', 'github.com/RoshanBM'],
    ],
    highlights: [
      ['Digital twin', 'R² of 0.99'],
      ['NHS dashboard', '9.35M rows processed'],
    ],
    byline: [
      ['Built with', 'Python, Flask, XGBoost, SHAP'],
      ['Code on', 'GitHub'],
    ],
    specs: [
      ['Years', '2025-2026'],
      ['Domains', 'Navigation, health, maintenance'],
      ['Methods', 'Gradient boosting, clustering, RAG'],
      ['Delivery', 'Dashboards, notebooks, web apps'],
    ],
    statement: ['Models', 'you can open,', 'test and', 'actually use'],
    intro:
      'A mix of research and full-stack work. Each project ends in something a person can run: a dashboard, a simulator or a tested notebook.',
    tracks: [
      {
        title: 'GNSS Multipath Detection',
        meta: 'MSc dissertation',
        time: '2026',
        body: [
          'Machine-learning detection of GNSS multipath for reliable navigation, studying how well models generalise, how interpretable they are, and where excluding measurements stops helping.',
        ],
        links: [['Repository', 'https://github.com/RoshanBM/GNSS-Multipath-Detection-for-Reliable-Navigation']],
      },
      {
        title: 'Digital Twin for a Marine Gas Turbine',
        meta: 'Python, Flask, XGBoost, SHAP',
        time: 'Mar-Apr 2026',
        body: [
          'A web-based digital twin that simulates turbine telemetry and forecasts engine degradation from live sensor readings.',
          'Benchmarked four regression models and selected XGBoost (R² of 0.99), then added SHAP explanations to an interactive fault-injection dashboard.',
        ],
        links: [['Repository', 'https://github.com/adrohilla99/naval-turbine-simulator-and-predictive-maintanance']],
      },
      {
        title: 'Diabetes Risk Modelling',
        meta: 'Predictive healthcare analytics',
        time: 'Jan-Feb 2026',
        body: [
          'A screening classifier on 229,781 CDC health records using RFECV feature selection and SMOTE, threshold-tuned to 63% recall for diabetes and prediabetes.',
          'Hand-engineered composite risk features, then PCA and K-Means to segment patients into four clusters.',
        ],
        links: [['Repository', 'https://github.com/RoshanBM/Diabetes-Risk-Analysis']],
      },
      {
        title: 'NHS Prescribing Dashboard',
        meta: 'Python, Flask, SQLite, Plotly.js',
        time: 'Oct-Nov 2025',
        body: [
          'A full-stack analytics dashboard for NHS prescribing data across regions.',
          'Chunked Pandas ETL took 9.35M raw rows down to 1.88M clean ones, then surfaced regional price variation.',
        ],
        links: [['Repository', 'https://github.com/RoshanBM/NHS_prescribing_dashboard']],
      },
      {
        title: 'The Chamber Assistant',
        meta: 'LLM for industrial fault correction',
        time: '2025',
        body: [
          'Final-year project: a language-model assistant for data acquisition and control systems, published at IEEE INSPECT 2025.',
        ],
        links: [['Paper', 'https://doi.org/10.1109/INSPECT67393.2025.11350352']],
      },
      {
        title: 'Clinical Guideline RAG Assistant',
        meta: 'In progress',
        time: '2026',
        body: [
          'Question answering over WHO guidelines with hybrid retrieval (BM25 plus embeddings), a cross-encoder reranker and a safety-focused evaluation set.',
        ],
      },
    ],
  },
  {
    id: 'experience',
    label: 'Experience',
    title: 'Experience',
    art: 'experience',
    rim: 'ISRO U R RAO SATELLITE CENTRE     IISC x WIRIN     IEEE     BENGALURU     2023-2025',
    credits: [
      ['Tracks', '3 internships'],
      ['Where', 'ISRO, IISc x WIRIN, IEEE'],
      ['Years', '2023-2025'],
      ['Based', 'Bengaluru, India'],
    ],
    highlights: [
      ['ISRO', 'Adopted by 20+ engineers'],
      ['IISc x WIRIN', '4-camera 360° vision'],
    ],
    byline: [
      ['Roles', 'Research and engineering intern'],
      ['Where', 'Bengaluru, India'],
    ],
    specs: [
      ['Years', '2023-2025'],
      ['Sectors', 'Space, autonomous vehicles, research'],
      ['Shipped', 'LLM assistant, perception pipeline'],
      ['Papers', '2 from internship work'],
    ],
    statement: ['From the lab', 'to the teams', 'who use it', 'every day'],
    intro:
      'Three research internships, each ending with a system that other people kept using after I left.',
    tracks: [
      {
        title: 'Research Intern',
        meta: 'U R Rao Satellite Centre, ISRO',
        time: 'Apr-Jun 2025',
        body: [
          'Deployed a cloud-native LLM assistant using Hugging Face, Unsloth, Gradio and Docker, adopted by an engineering team of 20+ staff.',
          'Fine-tuned open-source models on domain documentation, working with users to improve answer relevance for 3 active R&D teams.',
          'Replaced a manual search across 5+ legacy systems with a single containerised pipeline.',
        ],
      },
      {
        title: 'Project Engineering Intern',
        meta: 'IISc x WIRIN, RVCE',
        time: 'Jun 2023-Jun 2024',
        body: [
          'Built a real-time 360-degree computer vision system with OpenCV and multi-camera stitching, removing blind spots for autonomous vehicle testing.',
          'Integrated live video from 4 cameras into a perception pipeline, reducing detection errors caused by occlusion.',
          'Delivered to the Centre of Excellence for Connected Autonomous Vehicles, where it became the primary perception input.',
        ],
      },
      {
        title: 'Research Intern',
        meta: 'IEEE',
        time: 'Nov 2023-Apr 2024',
        body: [
          'Trained XGBoost and KNN classifiers on custom datasets, with results that fed into 2 peer-reviewed publications.',
          'Ran sensitivity analysis and simulations across 6+ configurations to find the best design variant.',
        ],
      },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    title: 'Research',
    art: 'research',
    rim: 'PEER-REVIEWED PUBLICATIONS     IEEE     SPRINGER     2024-2025',
    credits: [
      ['Tracks', '4 papers'],
      ['Publishers', 'IEEE, Springer'],
      ['Years', '2024-2025'],
      ['Topics', 'Sensing, ML, LLMs'],
    ],
    highlights: [
      ['Peer-reviewed', '4 publications'],
      ['Latest', 'IEEE INSPECT 2025'],
    ],
    byline: [
      ['Author on', '4 papers, first author on 1'],
      ['Venues', 'IEEE, Springer'],
    ],
    specs: [
      ['Years', '2024-2025'],
      ['Publishers', 'IEEE, Springer'],
      ['Methods', 'KNN, predictive modelling, LLMs'],
      ['Domains', 'Biosensing, industry, business'],
    ],
    statement: ['Four papers', 'across sensing,', 'machine learning', 'and language'],
    intro:
      'Peer-reviewed work from my undergraduate years, spanning fibre-optic biosensors, predictive modelling and language models for industrial systems.',
    tracks: [
      {
        title: 'The Chamber Assistant: A Language-Model Approach to Industrial Fault Correction and Documentation',
        meta: 'IEEE INSPECT 2025, pp. 1-6',
        time: '2025',
        body: ['Chebbi, N.S., Mahashabde, R.B., Usha Rani, K.R. and Barve, P.'],
        links: [['DOI', 'https://doi.org/10.1109/INSPECT67393.2025.11350352']],
      },
      {
        title: 'Analysing Technology Ecosystem Business Models: A Predictive Modelling Approach',
        meta: 'IEEE InC4 2025, pp. 1-7',
        time: '2025',
        body: ['Chebbi, N.S., Mahashabde, R.B., Shrinivas, B.M., Makam, P.K., Kumar, S. and Kiran, V.'],
        links: [['DOI', 'https://doi.org/10.1109/InC465408.2025.11256413']],
      },
      {
        title: 'K-Nearest Neighbor Optimization of Silver-Graphene Fiber Optic Sensor for Lung Cancer Detection',
        meta: 'CSCT 2024, Springer, Smart Innovation, Systems and Technologies',
        time: '2025',
        body: ['Chebbi, N., Mahashabde, R.B., Nandi, S., Kumar, S., Jayanthi, P.N. and Sahana, B.'],
        links: [['DOI', 'https://doi.org/10.1007/978-981-96-6254-8_35']],
      },
      {
        title: 'Silver-TiO2 Nanoparticles Enabled Fiber Optic Sensor for Biosensing',
        meta: 'IEEE ICCCNT 2024, pp. 1-7',
        time: '2024',
        body: ['Mahashabde, R.B., Chebbi, N.S., Practoor, P.P., Sharan, P. and Sharma, K.'],
        links: [['DOI', 'https://doi.org/10.1109/ICCCNT61001.2024.10725200']],
      },
    ],
  },
];
