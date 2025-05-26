// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Social Auth
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Additional OAuth configuration
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
export const REDIRECT_URI = `${FRONTEND_URL}/login`;

// Get current environment
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Application constants
export const APP_NAME = 'Grade Distribution Visualization';
export const COPYRIGHT_YEAR = new Date().getFullYear();

// Chart Colors
export const CHART_COLORS = [
  '#3498db', // Blue
  '#2ecc71', // Green
  '#e74c3c', // Red
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#d35400', // Pumpkin
  '#34495e', // Dark Blue
  '#16a085', // Green Sea
  '#27ae60', // Nephritis
  '#2980b9', // Belize Hole
  '#8e44ad', // Wisteria
  '#c0392b', // Pomegranate
  '#f1c40f', // Sunflower
];

// Grade ranges for histogram
export const GRADE_RANGES = [
  { min: 0, max: 9, label: '0-9' },
  { min: 10, max: 19, label: '10-19' },
  { min: 20, max: 29, label: '20-29' },
  { min: 30, max: 39, label: '30-39' },
  { min: 40, max: 49, label: '40-49' },
  { min: 50, max: 59, label: '50-59' },
  { min: 60, max: 69, label: '60-69' },
  { min: 70, max: 79, label: '70-79' },
  { min: 80, max: 89, label: '80-89' },
  { min: 90, max: 100, label: '90-100' },
];
