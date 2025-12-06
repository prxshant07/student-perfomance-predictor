import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, TrendingUp, Award, AlertCircle, ArrowRight, Check } from 'lucide-react';

const Learnlytics = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [gradeLevel, setGradeLevel] = useState('');
  const [formData, setFormData] = useState({
    study_hours: '',
    attendance: '',
    participation: '',
    subjects: []
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  const gradeOptions = [
    { id: 'middle_school', name: 'Middle School', icon: '🎒', description: 'Grades 6-8' },
    { id: 'high_school', name: 'High School', icon: '📚', description: 'Grades 9-12' },
    { id: 'university', name: 'University (CSE)', icon: '🎓', description: 'Computer Science' }
  ];

  const subjectsByGrade = {
    middle_school: ['MS Math', 'MS Science', 'MS Social Studies', 'MS English'],
    high_school: ['HS Algebra II', 'HS Chemistry', 'HS History', 'HS Literature'],
    university: ['CSE Data Structures', 'CSE Algorithms', 'CSE Database Systems']
  };

  const handleGradeSelect = (grade) => {
    setGradeLevel(grade);
    setFormData({ ...formData, subjects: [] });
    setCurrentPage('input');
  };

  const handleSubjectToggle = (subject) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject];
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = async () => {
    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grade_level: gradeLevel,
          study_hours: parseFloat(formData.study_hours),
          attendance: parseFloat(formData.attendance),
          participation: parseFloat(formData.participation)
        })
      });

      const data = await response.json();
      setResults(data);
      setCurrentPage('results');
    } catch (error) {
      alert('Error predicting scores. Make sure backend is running at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-6 rounded-full">
              <TrendingUp size={64} className="text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">Learnlytics</h1>
          <p className="text-xl text-white/90 mb-8">
            AI-Powered Student Performance Prediction & Improvement Platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 p-6 rounded-xl">
              <BookOpen className="mx-auto mb-3 text-white" size={40} />
              <h3 className="text-white font-semibold text-lg mb-2">Predict Performance</h3>
              <p className="text-white/80 text-sm">Get accurate predictions across multiple subjects</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <Award className="mx-auto mb-3 text-white" size={40} />
              <h3 className="text-white font-semibold text-lg mb-2">Identify Weaknesses</h3>
              <p className="text-white/80 text-sm">Discover areas that need improvement</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <TrendingUp className="mx-auto mb-3 text-white" size={40} />
              <h3 className="text-white font-semibold text-lg mb-2">Get Resources</h3>
              <p className="text-white/80 text-sm">Receive personalized learning recommendations</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('grade')}
            className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started <ArrowRight className="inline ml-2" size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const GradeSelectionPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => setCurrentPage('landing')}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          ← Back
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-3 text-center">Select Your Education Level</h2>
          <p className="text-gray-600 text-center mb-10">Choose the grade level to get personalized predictions</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gradeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleGradeSelect(option.id)}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl text-white hover:shadow-2xl transform hover:scale-105 transition"
              >
                <div className="text-6xl mb-4">{option.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{option.name}</h3>
                <p className="text-white/80">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const InputMetricsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentPage('grade')}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          ← Back to Grade Selection
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Input Your Metrics</h2>
          <p className="text-gray-600 mb-8">Tell us about your study habits and select subjects for prediction</p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weekly Study Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={formData.study_hours}
                  onChange={(e) => setFormData({ ...formData, study_hours: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., 8.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attendance (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., 85"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class Participation (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.participation}
                  onChange={(e) => setFormData({ ...formData, participation: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., 7.2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Subjects for Prediction
              </label>
              <div className="grid grid-cols-2 gap-3">
                {subjectsByGrade[gradeLevel]?.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleSubjectToggle(subject)}
                    className={`p-4 rounded-lg border-2 font-medium transition ${
                      formData.subjects.includes(subject)
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {formData.subjects.includes(subject) && <Check className="inline mr-2" size={18} />}
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || formData.subjects.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Analyzing...' : 'Predict Performance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultsPage = () => {
    if (!results) return null;

    const chartData = Object.entries(results.predictions).map(([subject, data]) => ({
      subject: subject.replace(/^(MS|HS|CSE)\s/, ''),
      score: data.score,
      average: data.mean
    }));

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentPage('input')}
            className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← New Prediction
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-10 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Performance Analysis</h2>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-1">Overall Average Score</p>
                  <p className="text-5xl font-bold">{results.overall_average}%</p>
                </div>
                <Award size={80} className="text-white/30" />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Score Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#6366f1" name="Your Score" />
                  <Bar dataKey="average" fill="#a78bfa" name="Class Average" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {results.weak_subjects.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <AlertCircle className="text-red-600 mr-2" size={24} />
                  <h3 className="text-xl font-bold text-red-800">Subjects Needing Attention</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.weak_subjects.map((subject) => (
                    <span key={subject} className="bg-red-200 text-red-800 px-4 py-2 rounded-full font-medium">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(results.resources).length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Recommended Learning Resources</h3>
                {Object.entries(results.resources).map(([subject, resources]) => (
                  <div key={subject} className="mb-6 bg-indigo-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-indigo-900 mb-3">{subject}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">📺 Videos</p>
                        <ul className="space-y-1">
                          {resources.videos.map((video, i) => (
                            <li key={i} className="text-sm text-gray-600">• {video}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">✏️ Practice</p>
                        <ul className="space-y-1">
                          {resources.practice.map((practice, i) => (
                            <li key={i} className="text-sm text-gray-600">• {practice}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">📚 Books</p>
                        <ul className="space-y-1">
                          {resources.books.map((book, i) => (
                            <li key={i} className="text-sm text-gray-600">• {book}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'grade' && <GradeSelectionPage />}
      {currentPage === 'input' && <InputMetricsPage />}
      {currentPage === 'results' && <ResultsPage />}
    </div>
  );
};

export default Learnlytics;