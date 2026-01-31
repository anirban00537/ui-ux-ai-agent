import {
  IconRobot,
  IconRocket,
  IconLeaf,
  IconBooks,
} from "@tabler/icons-react";

export const suggestions = [
  {
    icon: IconRobot,
    title: "AI Revolution",
    description: "How AI is transforming industries",
    prompt: "Create a presentation about how artificial intelligence is revolutionizing healthcare, education, and creative industries",
    color: "bg-chart-1", 
    iconColor: "text-chart-1",
  },
  {
    icon: IconRocket,
    title: "Space Exploration",
    description: "Journey through the cosmos",
    prompt: "Create a presentation about recent breakthroughs in space exploration, Mars missions, and the future of interstellar travel",
    color: "bg-chart-2",
    iconColor: "text-chart-2",
  },
  {
    icon: IconLeaf,
    title: "Climate Solutions",
    description: "Saving our planet",
    prompt: "Create a presentation about innovative climate change solutions, renewable energy technologies, and sustainable living practices",
    color: "bg-chart-3",
    iconColor: "text-chart-3",
  },
  {
    icon: IconBooks,
    title: "Ancient Wonders",
    description: "Mysteries of history",
    prompt: "Create a presentation about the Seven Wonders of the Ancient World, their construction, and their historical significance",
    color: "bg-chart-4",
    iconColor: "text-chart-4",
  },
];

export type Suggestion = typeof suggestions[number];
