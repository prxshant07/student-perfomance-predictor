from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Model baseline data
TARGET_COLS = {
    'middle_school': [
        'MS_Math_Score',
        'MS_Science_Score', 
        'MS_Social_Studies_Score',
        'MS_English_Score'
    ],
    'high_school': [
        'HS_Algebra_II_Score',
        'HS_Chemistry_Score',
        'HS_History_Score',
        'HS_Literature_Score'
    ],
    'university': [
        'CSE_Data_Structures_Score',
        'CSE_Algorithms_Score',
        'CSE_Database_Systems_Score'
    ]
}

SUBJECT_MEANS = {
    'MS_Math_Score': 75.5,
    'MS_Science_Score': 73.2,
    'MS_Social_Studies_Score': 76.8,
    'MS_English_Score': 78.1,
    'HS_Algebra_II_Score': 72.4,
    'HS_Chemistry_Score': 70.9,
    'HS_History_Score': 74.3,
    'HS_Literature_Score': 76.5,
    'CSE_Data_Structures_Score': 68.7,
    'CSE_Algorithms_Score': 66.2,
    'CSE_Database_Systems_Score': 71.3
}

SUBJECT_STDS = {
    'MS_Math_Score': 12.3,
    'MS_Science_Score': 13.1,
    'MS_Social_Studies_Score': 11.8,
    'MS_English_Score': 10.9,
    'HS_Algebra_II_Score': 14.2,
    'HS_Chemistry_Score': 15.1,
    'HS_History_Score': 12.7,
    'HS_Literature_Score': 11.4,
    'CSE_Data_Structures_Score': 16.3,
    'CSE_Algorithms_Score': 17.2,
    'CSE_Database_Systems_Score': 14.8
}

# Baseline averages
STUDY_HOURS_AVG = 8.5
ATTENDANCE_AVG = 85.0
PARTICIPATION_AVG = 7.2

# Learning resources
LEARNING_RESOURCES = {
    'MS_Math_Score': {
        'videos': ['Khan Academy - Middle School Math', 'Math Antics YouTube Channel'],
        'practice': ['IXL Math Practice', 'Prodigy Math Game'],
        'books': ['Pre-Algebra by Richard Rusczyk']
    },
    'MS_Science_Score': {
        'videos': ['Crash Course Kids', 'SciShow Kids'],
        'practice': ['Mystery Science', 'Science Buddies'],
        'books': ['DK Science Encyclopedia']
    },
    'MS_Social_Studies_Score': {
        'videos': ['Crash Course World History', 'National Geographic Kids'],
        'practice': ['iCivics', 'Seterra Geography'],
        'books': ['A Young People\'s History of the United States']
    },
    'MS_English_Score': {
        'videos': ['Grammar Bytes', 'Crash Course Literature'],
        'practice': ['NoRedInk', 'ReadTheory'],
        'books': ['Elements of Style by Strunk & White']
    },
    'HS_Algebra_II_Score': {
        'videos': ['Khan Academy - Algebra 2', 'Professor Leonard'],
        'practice': ['Paul\'s Online Math Notes', 'Wolfram Alpha'],
        'books': ['Algebra 2 by Ron Larson']
    },
    'HS_Chemistry_Score': {
        'videos': ['Tyler DeWitt Chemistry', 'Bozeman Science'],
        'practice': ['ChemCollective', 'PhET Simulations'],
        'books': ['Chemistry: The Central Science']
    },
    'HS_History_Score': {
        'videos': ['Crash Course US History', 'Extra History'],
        'practice': ['Quizlet History Decks', 'AP History Practice'],
        'books': ['A People\'s History of the United States']
    },
    'HS_Literature_Score': {
        'videos': ['Thug Notes', 'CrashCourse Literature'],
        'practice': ['SparkNotes', 'LitCharts'],
        'books': ['How to Read Literature Like a Professor']
    },
    'CSE_Data_Structures_Score': {
        'videos': ['MIT OpenCourseWare', 'Abdul Bari Algorithms'],
        'practice': ['LeetCode', 'HackerRank Data Structures'],
        'books': ['Introduction to Algorithms (CLRS)']
    },
    'CSE_Algorithms_Score': {
        'videos': ['MIT 6.006', 'Tushar Roy Algorithms'],
        'practice': ['Codeforces', 'Project Euler'],
        'books': ['Algorithm Design Manual by Skiena']
    },
    'CSE_Database_Systems_Score': {
        'videos': ['CMU Database Systems', 'freeCodeCamp SQL'],
        'practice': ['SQLZoo', 'LeetCode Database'],
        'books': ['Database System Concepts by Silberschatz']
    }
}

def predict_score(study_hours, attendance, participation, subject):
    """
    Simple prediction model based on weighted features
    """
    # Normalize inputs
    study_norm = (study_hours - STUDY_HOURS_AVG) / 5.0
    attendance_norm = (attendance - ATTENDANCE_AVG) / 15.0
    participation_norm = (participation - PARTICIPATION_AVG) / 3.0
    
    # Weights for each feature
    weights = {
        'study': 0.4,
        'attendance': 0.35,
        'participation': 0.25
    }
    
    # Get baseline for subject
    base_score = SUBJECT_MEANS[subject]
    std = SUBJECT_STDS[subject]
    
    # Calculate prediction
    feature_score = (
        weights['study'] * study_norm +
        weights['attendance'] * attendance_norm +
        weights['participation'] * participation_norm
    )
    
    predicted = base_score + (feature_score * std)
    
    # Ensure score is between 0 and 100
    predicted = max(0, min(100, predicted))
    
    return round(predicted, 1)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/subjects/<grade_level>', methods=['GET'])
def get_subjects(grade_level):
    """Get subjects for a specific grade level"""
    if grade_level not in TARGET_COLS:
        return jsonify({'error': 'Invalid grade level'}), 400
    
    subjects = [col.replace('_Score', '').replace('_', ' ') for col in TARGET_COLS[grade_level]]
    return jsonify({'subjects': subjects, 'grade_level': grade_level})

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict student performance"""
    try:
        data = request.json
        
        study_hours = float(data.get('study_hours', 0))
        attendance = float(data.get('attendance', 0))
        participation = float(data.get('participation', 0))
        grade_level = data.get('grade_level')
        selected_subjects = data.get('subjects', [])
        
        # Validate inputs
        if not (0 <= study_hours <= 40):
            return jsonify({'error': 'Study hours must be between 0 and 40'}), 400
        if not (0 <= attendance <= 100):
            return jsonify({'error': 'Attendance must be between 0 and 100'}), 400
        if not (0 <= participation <= 10):
            return jsonify({'error': 'Participation must be between 0 and 10'}), 400
        
        if grade_level not in TARGET_COLS:
            return jsonify({'error': 'Invalid grade level'}), 400
        
        # Get predictions for selected subjects
        predictions = {}
        for subject_display in selected_subjects:
            # Convert display name back to column name
            subject_col = subject_display.replace(' ', '_') + '_Score'
            
            if subject_col in TARGET_COLS[grade_level]:
                score = predict_score(study_hours, attendance, participation, subject_col)
                predictions[subject_display] = {
                    'score': score,
                    'mean': SUBJECT_MEANS[subject_col],
                    'status': 'strong' if score >= SUBJECT_MEANS[subject_col] else 'needs_improvement'
                }
        
        # Find weak subjects
        weak_subjects = sorted(
            [(subj, data['score']) for subj, data in predictions.items() if data['status'] == 'needs_improvement'],
            key=lambda x: x[1]
        )
        
        # Get resources for weak subjects
        resources = {}
        for subj, _ in weak_subjects[:3]:  # Top 3 weak subjects
            subject_col = subj.replace(' ', '_') + '_Score'
            if subject_col in LEARNING_RESOURCES:
                resources[subj] = LEARNING_RESOURCES[subject_col]
        
        return jsonify({
            'predictions': predictions,
            'weak_subjects': [s[0] for s, _ in weak_subjects],
            'resources': resources,
            'overall_average': round(sum(p['score'] for p in predictions.values()) / len(predictions), 1) if predictions else 0
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)