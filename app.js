import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BookOpen, TrendingUp, Award, AlertCircle, ArrowRight, Check, Clock, Users, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const Learnlytics = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [gradeLevel, setGradeLevel] = useState('');
  const [formData, setFormData] = useState({
    study_hours: '',
    attendance: '',
    participation: '',
    subjects: []
  });
  const [subjectMetrics, setSubjectMetrics] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedResource, setExpandedResource] = useState(null);

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
    setFormData({ study_hours: '', attendance: '', participation: '', subjects: [] });
    setSubjectMetrics({});
    setCurrentPage('input');
  };

  const handleSubjectToggle = useCallback((subject) => {
    setFormData(prev => {
      const newSubjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects: newSubjects };
    });
    
    setSubjectMetrics(prev => {
      if (!formData.subjects.includes(subject)) {
        return {
          ...prev,
          [subject]: { mock_test_score: '' }
        };
      }
      return prev;
    });
  }, [formData.subjects]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubjectMetricChange = useCallback((subject, field, value) => {
    setSubjectMetrics(prev => ({
      ...prev,
      [subject]: {
        ...(prev[subject] || {}),
        [field]: value
      }
    }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.study_hours || !formData.attendance || !formData.participation) {
      alert('Please fill in all general metric fields');
      return;
    }

    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    for (const subject of formData.subjects) {
      const metrics = subjectMetrics[subject];
      if (!metrics || !metrics.mock_test_score) {
        alert(`Please enter mock test score for ${subject}`);
        return;
      }
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade_level: gradeLevel,
          general_metrics: {
            study_hours: parseFloat(formData.study_hours),
            attendance: parseFloat(formData.attendance),
            participation: parseFloat(formData.participation)
          },
          subjects: formData.subjects,
          subject_metrics: Object.fromEntries(
            Object.entries(subjectMetrics).map(([subject, metrics]) => [
              subject,
              {
                mock_test_score: parseFloat(metrics.mock_test_score)
              }
            ])
          )
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
        setCurrentPage('results');
      } else {
        alert(data.error || 'Error predicting scores');
      }
    } catch (error) {
      alert('Error connecting to server. Make sure backend is running at http://localhost:5000');
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
            className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
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
        <button onClick={() => setCurrentPage('landing')} className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold">
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
      <div className="max-w-6xl mx-auto">
        <button onClick={() => setCurrentPage('grade')} className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold">
          ← Back to Grade Selection
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Input Your Metrics</h2>
          <p className="text-gray-600 mb-8">Tell us about your study habits and select subjects for prediction</p>
          <div className="space-y-8">
            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">General Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Clock className="mr-2" size={18} />
                    Weekly Study Hours
                  </label>
                  <input
                    value={formData.study_hours}
                    onChange={(e) => handleInputChange('study_hours', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500"
                    placeholder="e.g., 8.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average: 8.5 hours/week</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Users className="mr-2" size={18} />
                    Attendance (%)
                  </label>
                  <input
                    value={formData.attendance}
                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500"
                    placeholder="e.g., 85"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average: 85%</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Target className="mr-2" size={18} />
                    Class Participation (0-10)
                  </label>
                  <input
                    value={formData.participation}
                    onChange={(e) => handleInputChange('participation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500"
                    placeholder="e.g., 7.2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average: 7.2/10</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Subjects for Prediction</label>
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
            {formData.subjects.length > 0 && (
              <div className="space-y-6">
                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Subject-Specific Metrics</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Enter mock test scores for each selected subject for more accurate predictions
                  </p>
                </div>
                {formData.subjects.map((subject) => (
                  <div key={subject} className="bg-purple-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <BookOpen className="mr-2 text-purple-600" size={20} />
                      {subject}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mock Test Score (0-100) *
                        </label>
                        <input
                          value={subjectMetrics[subject]?.mock_test_score || ''}
                          onChange={(e) => handleSubjectMetricChange(subject, 'mock_test_score', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                          placeholder="e.g., 75"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your most recent mock test score for this subject</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg disabled:opacity-50 transition"
            >
              {loading ? 'Analyzing Performance...' : 'Predict Performance'}
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

    const radarData = Object.entries(results.predictions).map(([subject, data]) => ({
      subject: subject.replace(/^(MS|HS|CSE)\s/, '').substring(0, 10),
      score: data.score,
      fullMark: 100
    }));

    const customFont = { fontFamily: 'Inter, system-ui, sans-serif' };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => { setCurrentPage('input'); setResults(null); }} className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold">
            ← New Prediction
          </button>
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Performance Analysis Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <p className="text-white/80 mb-1 text-sm">Overall Average</p>
                <p className="text-5xl font-bold">{results.overall_average}%</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <p className="text-white/80 mb-1 text-sm">Strong Subjects</p>
                <p className="text-5xl font-bold">{results.strong_subjects.length}</p>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
                <p className="text-white/80 mb-1 text-sm">Needs Focus</p>
                <p className="text-5xl font-bold">{results.weak_subjects.length}</p>
              </div>
            </div>
            {results.insights && results.insights.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="mr-2 text-yellow-500" size={24} />
                  Personalized Insights
                </h3>
                <div className="space-y-3">
                  {results.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'success' ? 'bg-green-50 border-green-500' :
                        insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <p className="text-sm text-gray-800">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Score Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} style={customFont} />
                    <YAxis domain={[0, 100]} style={customFont} />
                    <Tooltip contentStyle={customFont} />
                    <Legend wrapperStyle={customFont} />
                    <Bar dataKey="score" fill="#6366f1" name="Your Score" />
                    <Bar dataKey="average" fill="#a78bfa" name="Class Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" style={customFont} />
                    <PolarRadiusAxis domain={[0, 100]} style={customFont} />
                    <Radar name="Your Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                    <Tooltip contentStyle={customFont} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Subject Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results.predictions).map(([subject, data]) => (
                  <div key={subject} className={`p-4 rounded-lg border-2 ${data.status === 'strong' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800">{subject}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${data.status === 'strong' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {data.grade}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700"><span className="font-semibold">Your Score:</span> {data.score}%</p>
                      <p className="text-gray-700"><span className="font-semibold">Class Average:</span> {data.mean}%</p>
                      <p className={`font-semibold ${data.diff_from_mean >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.diff_from_mean >= 0 ? '+' : ''}{data.diff_from_mean}% from average
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {results.weak_subjects.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <AlertCircle className="text-red-600 mr-2" size={24} />
                  <h3 className="text-xl font-bold text-red-800">Subjects Requiring Attention</h3>
                </div>
                <div className="space-y-3">
                  {results.weak_subjects.map((subject) => (
                    <div key={subject.name} className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{subject.name}</span>
                        <div className="text-right">
                          <span className="text-red-600 font-bold text-lg">{subject.score}%</span>
                          <p className="text-xs text-gray-600">{Math.abs(subject.diff)}% below average</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {Object.keys(results.resources || {}).length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="mr-2 text-indigo-600" size={28} />
                  Recommended Learning Resources
                </h3>
                <p className="text-gray-600 mb-6">Curated resources to help you improve in weak areas</p>
                {Object.entries(results.resources).map(([subject, resources]) => (
                  <div key={subject} className="mb-6 bg-indigo-50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedResource(expandedResource === subject ? null : subject)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-indigo-100 transition"
                    >
                      <h4 className="text-lg font-bold text-indigo-900">{subject}</h4>
                      {expandedResource === subject ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedResource === subject && (
                      <div className="p-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          <div>
                            <p className="font-semibold text-gray-700 mb-2">💡 Tips</p>
                            <ul className="space-y-1">
                              {resources.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-gray-600">• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
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
