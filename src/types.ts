export type GameMode = 'addition' | 'subtraction' | 'mixed';
export type NumberRange = 20 | 100 | 1000;

export interface Question {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-';
  correctAnswer: number;
  options: number[];
}

export interface WrongQuestion {
  id: string; // unique ID
  num1: number;
  num2: number;
  operator: '+' | '-';
  correctAnswer: number;
  wrongAnswer: number;
  timestamp: number;
  explanationText?: string; // cached AI explanation
}

export type ThemeName = 'strawberry' | 'mint' | 'banana' | 'blueberry' | 'grape';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  buttonBg: string;
  buttonHoverBg: string;
  shadowColor: string;
  emoji: string;
}
