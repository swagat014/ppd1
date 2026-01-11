import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from '../../components/student/StudentLayout';
import DashboardHome from './DashboardHome';
import ResumeAnalysis from './ResumeAnalysis';
import DSAPractice from './DSAPractice';
import ProblemDetail from './ProblemDetail';
import AptitudePractice from './AptitudePractice';
import AptitudeTest from './AptitudeTest';
import MockInterviews from './MockInterviews';
import EnglishAnalysis from './EnglishAnalysis';
import ReadinessAnalyzer from './ReadinessAnalyzer';
import CoreSubjects from './CoreSubjects';
import Analytics from './Analytics';

const StudentDashboard: React.FC = () => {
  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/resume" element={<ResumeAnalysis />} />
        <Route path="/dsa" element={<DSAPractice />} />
        <Route path="/dsa/problem/:id" element={<ProblemDetail />} />
        <Route path="/aptitude" element={<AptitudePractice />} />
        <Route path="/aptitude/test/:id" element={<AptitudeTest />} />
        <Route path="/interviews" element={<MockInterviews />} />
        <Route path="/english" element={<EnglishAnalysis />} />
        <Route path="/readiness" element={<ReadinessAnalyzer />} />
        <Route path="/core-subjects" element={<CoreSubjects />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </StudentLayout>
  );
};

export default StudentDashboard;
