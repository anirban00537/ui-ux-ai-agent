import {
  IconRobot,
  IconRocket,
  IconLeaf,
  IconBooks,
} from "@tabler/icons-react";

export const suggestions = [
  {
    icon: IconRobot,
    title: "AI Chat App",
    description: "Intelligent conversational interface",
    prompt: "Design a mobile app for an AI assistant with chat interface, history, and voice recognition features",
    color: "bg-chart-1", 
    iconColor: "text-chart-1",
  },
  {
    icon: IconRocket,
    title: "Space Tourism",
    description: "Book your journey to Mars",
    prompt: "Design a mobile app for booking commercial space flights with seat selection and mission details",
    color: "bg-chart-2",
    iconColor: "text-chart-2",
  },
  {
    icon: IconLeaf,
    title: "Eco Tracker",
    description: "Monitor your carbon footprint",
    prompt: "Design a mobile app that helps users track their daily sustainability habits and environmental impact",
    color: "bg-chart-3",
    iconColor: "text-chart-3",
  },
  {
    icon: IconBooks,
    title: "Learning LMS",
    description: "Platform for online education",
    prompt: "Design a mobile app for an online learning platform with courses, progress tracking, and quizzes",
    color: "bg-chart-4",
    iconColor: "text-chart-4",
  },
];

export type Suggestion = typeof suggestions[number];
