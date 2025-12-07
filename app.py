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

# Subject-specific weights (how much each metric affects different subjects)
SUBJECT_WEIGHTS = {
    'MS_Math_Score': {'study': 0.45, 'attendance': 0.30, 'participation': 0.25},
    'MS_Science_Score': {'study': 0.40, 'attendance': 0.35, 'participation': 0.25},
    'MS_Social_Studies_Score': {'study': 0.35, 'attendance': 0.35, 'participation': 0.30},
    'MS_English_Score': {'study': 0.35, 'attendance': 0.30, 'participation': 0.35},
    'HS_Algebra_II_Score': {'study': 0.50, 'attendance': 0.30, 'participation': 0.20},
    'HS_Chemistry_Score': {'study': 0.45, 'attendance': 0.35, 'participation': 0.20},
    'HS_History_Score': {'study': 0.35, 'attendance': 0.35, 'participation': 0.30},
    'HS_Literature_Score': {'study': 0.40, 'attendance': 0.30, 'participation': 0.30},
    'CSE_Data_Structures_Score': {'study': 0.55, 'attendance': 0.25, 'participation': 0.20},
    'CSE_Algorithms_Score': {'study': 0.55, 'attendance': 0.25, 'participation': 0.20},
    'CSE_Database_Systems_Score': {'study': 0.50, 'attendance': 0.30, 'participation': 0.20}
}

# Baseline averages
STUDY_HOURS_AVG = 8.5
ATTENDANCE_AVG = 85.0
PARTICIPATION_AVG = 7.2

# Learning resources
LEARNING_RESOURCES = {
    'MS_Math_Score': {
        'videos': ['Khan Academy - Middle School Math', 'Math Antics YouTube Channel', 'Professor Leonard Basics'],
        'practice': ['IXL Math Practice', 'Prodigy Math Game', 'Mathway Problem Solver'],
        'books': ['Pre-Algebra by Richard Rusczyk', 'Math Doesn\'t Suck by Danica McKellar'],
        'tips': ['Practice 30 minutes daily', 'Focus on understanding concepts, not just memorizing', 'Create formula sheets']
    },
    'MS_Science_Score': {
        'videos': ['Crash Course Kids', 'SciShow Kids', 'Bill Nye Science Guy'],
        'practice': ['Mystery Science', 'Science Buddies', 'PhET Interactive Simulations'],
        'books': ['DK Science Encyclopedia', 'National Geographic Science Books'],
        'tips': ['Do hands-on experiments', 'Connect science to real-world examples', 'Watch science documentaries']
    },
    'MS_Social_Studies_Score': {
        'videos': ['Crash Course World History', 'National Geographic Kids', 'History Channel Student Resources'],
        'practice': ['iCivics', 'Seterra Geography', 'Quizlet History Sets'],
        'books': ['A Young People\'s History of the United States', 'DK History Encyclopedia'],
        'tips': ['Create timeline posters', 'Use mnemonic devices for dates', 'Connect history to current events']
    },
    'MS_English_Score': {
        'videos': ['Grammar Bytes', 'Crash Course Literature', 'TED-Ed Writing Lessons'],
        'practice': ['NoRedInk', 'ReadTheory', 'Grammarly Free Version'],
        'books': ['Elements of Style by Strunk & White', 'The Writing Process workbooks'],
        'tips': ['Read 20 minutes daily', 'Keep a vocabulary journal', 'Practice writing different formats']
    },
    'HS_Algebra_II_Score': {
        'videos': ['Khan Academy - Algebra 2', 'Professor Leonard', 'PatrickJMT Math Videos'],
        'practice': ['Paul\'s Online Math Notes', 'Wolfram Alpha', 'Desmos Graphing Calculator'],
        'books': ['Algebra 2 by Ron Larson', 'The Art of Problem Solving'],
        'tips': ['Review Algebra 1 basics', 'Practice problems daily', 'Master graphing techniques', 'Form study groups']
    },
    'HS_Chemistry_Score': {
        'videos': ['Tyler DeWitt Chemistry', 'Bozeman Science', 'Professor Dave Explains'],
        'practice': ['ChemCollective', 'PhET Simulations', 'Chembalancer'],
        'books': ['Chemistry: The Central Science', 'Organic Chemistry as a Second Language'],
        'tips': ['Master the periodic table', 'Practice balancing equations daily', 'Use molecular models', 'Attend lab sessions']
    },
    'HS_History_Score': {
        'videos': ['Crash Course US History', 'Extra History', 'The Great Courses'],
        'practice': ['Quizlet History Decks', 'AP History Practice', 'Historical thinking exercises'],
        'books': ['A People\'s History of the United States', 'Howard Zinn\'s works'],
        'tips': ['Create comprehensive timelines', 'Analyze primary sources', 'Connect events causally', 'Write practice essays']
    },
    'HS_Literature_Score': {
        'videos': ['Thug Notes', 'CrashCourse Literature', 'The School of Life'],
        'practice': ['SparkNotes', 'LitCharts', 'Poetry Foundation'],
        'books': ['How to Read Literature Like a Professor', 'The Norton Anthology'],
        'tips': ['Read actively with annotations', 'Join book clubs', 'Analyze literary devices', 'Write critical essays']
    },
    'CSE_Data_Structures_Score': {
        'videos': ['MIT OpenCourseWare 6.006', 'Abdul Bari Algorithms', 'William Fiset'],
        'practice': ['LeetCode', 'HackerRank Data Structures', 'GeeksforGeeks'],
        'books': ['Introduction to Algorithms (CLRS)', 'Data Structures and Algorithms in Python'],
        'tips': ['Implement from scratch', 'Understand time/space complexity', 'Practice coding daily', 'Visualize structures']
    },
    'CSE_Algorithms_Score': {
        'videos': ['MIT 6.006', 'Tushar Roy Algorithms', 'Back to Back SWE'],
        'practice': ['Codeforces', 'Project Euler', 'AtCoder'],
        'books': ['Algorithm Design Manual by Skiena', 'Competitive Programming Handbook'],
        'tips': ['Master fundamental algorithms', 'Practice competitive programming', 'Analyze complexity', 'Study dynamic programming']
    },
    'CSE_Database_Systems_Score': {
        'videos': ['CMU Database Systems', 'freeCodeCamp SQL', 'Stanford Database Course'],
        'practice': ['SQLZoo', 'LeetCode Database', 'Mode Analytics SQL Tutorial'],
        'books': ['Database System Concepts by Silberschatz', 'SQL Performance Explained'],
        'tips': ['Practice SQL queries daily', 'Understand normalization', 'Learn query optimization', 'Build real projects']
    }
}

def predict_score(study_hours, attendance, participation, subject):
    """Enhanced prediction model with subject-specific weights"""
    # Normalize inputs
    study_norm = (study_hours - STUDY_HOURS_AVG) / 5.0
    attendance_norm = (attendance - ATTENDANCE_AVG) / 15.0
    participation_norm = (participation - PARTICIPATION_AVG) / 3.0
    
    # Get subject-specific weights
    weights = SUBJECT_WEIGHTS.get(subject, {'study': 0.4, 'attendance': 0.35, 'participation': 0.25})
    
    # Get baseline for subject
    base_score = SUBJECT_MEANS[subject]
    std = SUBJECT_STDS[subject]
    
    # Calculate prediction with subject-specific weights
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
    """Predict student performance with enhanced analytics"""
    try:
        data = request.json
        
        # Validate and parse inputs with null checks
        try:
            study_hours = float(data.get('general_metrics', {}).get('study_hours') or 0)
            attendance = float(data.get('general_metrics', {}).get('attendance') or 0)
            participation = float(data.get('general_metrics', {}).get('participation') or 0)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid input values. Please enter valid numbers.'}), 400
        
        grade_level = data.get('grade_level')
        selected_subjects = data.get('subjects', [])
        subject_metrics = data.get('subject_metrics', {})
        
        # Validate inputs
        if not (0 <= study_hours <= 40):
            return jsonify({'error': 'Study hours must be between 0 and 40'}), 400
        if not (0 <= attendance <= 100):
            return jsonify({'error': 'Attendance must be between 0 and 100'}), 400
        if not (0 <= participation <= 10):
            return jsonify({'error': 'Participation must be between 0 and 10'}), 400
        
        if grade_level not in TARGET_COLS:
            return jsonify({'error': 'Invalid grade level'}), 400
        
        if not selected_subjects:
            return jsonify({'error': 'Please select at least one subject'}), 400
        
        # Get predictions for selected subjects
        predictions = {}
        for subject_display in selected_subjects:
            subject_col = subject_display.replace(' ', '_') + '_Score'
            
            if subject_col in TARGET_COLS[grade_level]:
                # Get mock test score for this subject if available
                mock_score = None
                if subject_display in subject_metrics:
                    try:
                        mock_score = float(subject_metrics[subject_display].get('mock_test_score', 0))
                    except (ValueError, TypeError):
                        mock_score = None
                
                # Calculate prediction - if mock test score exists, use it as primary indicator
                if mock_score and 0 <= mock_score <= 100:
                    # Weight: 70% mock test, 30% general metrics
                    base_prediction = predict_score(study_hours, attendance, participation, subject_col)
                    score = round((mock_score * 0.7) + (base_prediction * 0.3), 1)
                else:
                    # Use only general metrics
                    score = predict_score(study_hours, attendance, participation, subject_col)
                
                mean = SUBJECT_MEANS[subject_col]
                diff_from_mean = score - mean
                
                predictions[subject_display] = {
                    'score': score,
                    'mean': mean,
                    'diff_from_mean': round(diff_from_mean, 1),
                    'percentile': round((score / 100) * 100, 1),
                    'status': 'strong' if score >= mean else 'needs_improvement',
                    'grade': get_letter_grade(score),
                    'mock_score': mock_score if mock_score else None
                }
        
        # Calculate overall statistics
        all_scores = [p['score'] for p in predictions.values()]
        overall_average = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0
        
        # Find weak and strong subjects
        weak_subjects = sorted(
            [(subj, data['score'], data['diff_from_mean']) for subj, data in predictions.items() 
             if data['status'] == 'needs_improvement'],
            key=lambda x: x[1]
        )
        
        strong_subjects = sorted(
            [(subj, data['score'], data['diff_from_mean']) for subj, data in predictions.items() 
             if data['status'] == 'strong'],
            key=lambda x: x[1],
            reverse=True
        )
        
        # Get resources for weak subjects
        resources = {}
        for subj, score, diff in weak_subjects[:3]:
            subject_col = subj.replace(' ', '_') + '_Score'
            if subject_col in LEARNING_RESOURCES:
                resources[subj] = LEARNING_RESOURCES[subject_col]
        
        # Performance insights
        insights = generate_insights(study_hours, attendance, participation, predictions)
        
        return jsonify({
            'predictions': predictions,
            'overall_average': overall_average,
            'weak_subjects': [{'name': s[0], 'score': s[1], 'diff': s[2]} for s in weak_subjects],
            'strong_subjects': [{'name': s[0], 'score': s[1], 'diff': s[2]} for s in strong_subjects],
            'resources': resources,
            'insights': insights,
            'metrics': {
                'study_hours': study_hours,
                'attendance': attendance,
                'participation': participation
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_letter_grade(score):
    """Convert numerical score to letter grade"""
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'

def generate_insights(study_hours, attendance, participation, predictions):
    """Generate personalized insights based on metrics"""
    insights = []
    
    if study_hours < STUDY_HOURS_AVG:
        insights.append({
            'type': 'warning',
            'message': f'Your study hours ({study_hours}h) are below average ({STUDY_HOURS_AVG}h). Consider increasing study time by {round(STUDY_HOURS_AVG - study_hours, 1)} hours per week.'
        })
    else:
        insights.append({
            'type': 'success',
            'message': f'Great job! Your study hours ({study_hours}h) exceed the average ({STUDY_HOURS_AVG}h).'
        })
    
    if attendance < ATTENDANCE_AVG:
        insights.append({
            'type': 'warning',
            'message': f'Your attendance ({attendance}%) is below average ({ATTENDANCE_AVG}%). Aim to attend all classes for better performance.'
        })
    else:
        insights.append({
            'type': 'success',
            'message': f'Excellent attendance ({attendance}%)! Keep it up.'
        })
    
    if participation < PARTICIPATION_AVG:
        insights.append({
            'type': 'info',
            'message': f'Try to increase class participation. Current: {participation}/10, Average: {PARTICIPATION_AVG}/10'
        })
    else:
        insights.append({
            'type': 'success',
            'message': f'Great class participation ({participation}/10)!'
        })
    
    return insights

if __name__ == '__main__':
    app.run(debug=True, port=5000)
