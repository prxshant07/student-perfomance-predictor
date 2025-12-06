# Learnlytics

A web application for predicting student performance across multiple subjects using machine learning.

## Overview

Learnlytics predicts student scores across various academic levels:
- **Middle School**: Math, Science, Social Studies, English
- **High School**: Algebra II, Chemistry, History, Literature  
- **College (CSE)**: Data Structures, Algorithms, Database Systems

## Features

### Prediction Variables
The model uses the following input features:
- Weekly self-study hours
- Attendance percentage
- Class participation
- Total score

### Target Predictions
Predicts performance in 11 different subjects across educational levels.

## Project Structure

```
learnlytics/
├── backend/          # Python ML models and API
├── frontend/         # Web interface
├── data/            # Sample datasets (not actual student data)
├── notebooks/       # Training and analysis notebooks
└── README.md
```

## Installation

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Start the backend server:
```bash
cd backend
python app.py
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser to `http://localhost:3000` (or specified port)

## Model Information

### Baseline Statistics
The model uses baseline statistics for normalization and comparison:
- Study hours average
- Attendance average  
- Participation average
- Subject-specific means and standard deviations

### Performance Metrics
RMSE - 0.98

## Technologies Used

**Backend:**
- Python
- scikit-learn
- Flask with RestAPI's

**Frontend:**
- React.js
- tailwindcss- v4.0.8d

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
Contact me for model dataset


## Privacy & Ethics

This application handles student performance data. Please ensure:
- Proper consent is obtained for data usage
- Data is anonymized and protected
- Predictions are used responsibly to support students

## Contact

Prashant Singh Rajput - prashantrajput7116@gmail.com
