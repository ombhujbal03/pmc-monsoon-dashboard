# 🌧️ Monsoon Health Risk Mapping — PMC Edition
### Predictive Urban Disease Hotspot Forecasting & Municipal Sanitation Dashboard

An advanced full-stack application designed for the Pune Municipal Corporation (PMC) to forecast vector-borne and waterborne disease outbreaks (such as Malaria, Leptospirosis, Dengue, and Typhoid) during the monsoon season. 

---

## 🚀 Key Features
* **Spatiotemporal Ward Risk Heatmapping:** Interactive OpenStreetMap integration using Leaflet to visualize real-time outbreak probabilities across different Pune ward offices (e.g., Hadapsar, Mundhwa, Fursungi).
* **Live Weather Integration:** Fetches real-time meteorological indicators (rainfall, temperature, humidity) via the Open-Meteo API.
* **Civic Grievance Correlation:** Analyzes unresolved drainage, sewage overflow, and water stagnation logs to predict high-risk zones.
* **Explainable AI (SHAP-Style Insights):** Transparent breakdown of prediction drivers showing exact feature contributions (e.g., sewage overflow impact vs. temperature).
* **Sanitation Strike Plan:** Automated generation of preventive health actions and sanitation schedules for municipal health officers.
* **Feedback Loop:** Interactive field feedback system allowing sanitation inspectors to log ground-truth validation against model warnings.

---

## 🛠️ Tech Stack
* **Frontend:** React, Vite, TypeScript, Tailwind CSS, Recharts, React-Leaflet (OpenStreetMap)
* **Backend:** FastAPI, Python, Node.js / Express, SQLite / PostgreSQL
* **Machine Learning & Analytics:** scikit-learn, XGBoost, Random Forest, SHAP (Explainable AI)
* **Tools & Version Control:** Visual Studio Code, Git, GitHub

---

## 📂 Project Architecture
```text
pmc-monsoon-dashboard/
├── backend/          # Node.js/Python API routes, database models, and SQLite outbreak data
├── public/           # Static assets, icons, and configuration files
├── src/              # React frontend components, mapping logic, and UI dashboards
│   ├── components/   # Reusable UI widgets and map layers
│   └── ...           
├── supabase/         # Database migrations and client configurations
├── .gitignore        # Excludes sensitive environment files and node_modules
├── package.json      # Project dependencies and npm scripts
└── README.md         # Project documentation
