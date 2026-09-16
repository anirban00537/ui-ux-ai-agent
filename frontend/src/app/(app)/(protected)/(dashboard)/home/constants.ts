import {
  IconPlant,
  IconDisc,
  IconShoppingBag,
  IconHeart,
} from "@tabler/icons-react";

export const suggestions = [
  {
    icon: IconHeart,
    title: "Kawaii Dream Journal",
    description: "Cute digital diary",
    prompt: `Personal diary and mood tracker. Day view looks like a scrapbook pages with stickers. Mood selector uses animated bouncy emojis. Weekly overview shows a pastel path with milestones. Photo memories have polaroid frames. Soft, patterned background.

Mobile UI, Kawaii Cute aesthetic. Pastel color palette (e.g., strawberry milk pink, baby blue, creamy yellow, lavender). Rounded bubbly shapes, soft drop shadows, playful hand-drawn elements. Rounded sans-serif fonts, bounce animations, friendly atmosphere.`,
    color: "bg-chart-1",
    iconColor: "text-chart-1",
  },
  {
    icon: IconPlant,
    title: "Zen Meditation",
    description: "Mindfulness & calm",
    prompt: `Mindfulness meditation app. Session timer mimics a gently expanding breathing circle. Daily streak indicators are smooth, polished stones. Ambient sound mixer features soft, floating orbs. Nature scapes as blurred backdrops. Calm, airy background.

Mobile UI, Ethereal Zen aesthetic. Soft pastel color palette (e.g., sage green, mist grey, pale lavender). Frosted glass effects, rounded soft corners, plenty of negative space. Minimalist line icons. Elegant serif fonts, slow fade transitions, dreamlike atmosphere.`,
    color: "bg-chart-2",
    iconColor: "text-chart-2",
  },
  {
    icon: IconDisc,
    title: "Retro Music",
    description: "Analog streaming vibe",
    prompt: `Music streaming app. Now playing screen features a spinning vinyl record. Volume sliders look like analog mixing console faders. Playlist covers resemble worn cassette tapes. Equalizer visualizer uses retro VU meters. Texture-rich background.

Mobile UI, Retro Analog aesthetic. Warm vintage color palette (e.g., burnt orange, cream, faded denim, charcoal). Grainy film textures, skeuomorphic buttons, classic paper borders. Nostalgic typography. Typewriter fonts, tactile click animations, physical media inspiration.`,
    color: "bg-chart-3",
    iconColor: "text-chart-3",
  },
  {
    icon: IconShoppingBag,
    title: "Brutalist Fashion",
    description: "Streetwear marketplace",
    prompt: `Streetwear fashion store. Product images are large, raw, and unretouched. Category headers utilize massive, bold typography. 'Add to Cart' buttons are rectangular with hard sharp edges. Navigation menu looks like a raw file directory. Stark, high-contrast background.

Mobile UI, Neo-Brutalist aesthetic. High contrast color palette (e.g., stark black, white, safety yellow, international orange). Thick black outlines, exposed grid systems, overlapping layouts. Raw geometric shapes. Monospace and bold sans-serif fonts, marquee scroll effects, industrial vibe.`,
    color: "bg-chart-4",
    iconColor: "text-chart-4",
  },
];

export type Suggestion = typeof suggestions[number];
