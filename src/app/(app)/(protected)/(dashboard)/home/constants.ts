import {
  IconCpu,
  IconPlant,
  IconDisc,
  IconShoppingBag,
} from "@tabler/icons-react";

export const suggestions = [
  {
    icon: IconCpu,
    title: "Cyberpunk Crypto",
    description: "Futuristic trading hub",
    prompt: `Crypto trading app. Real-time market charts look like holographic projections. Transaction history items have glitch-effect borders. Wallet balance displayed in luminous digital digits. Asset icons are glowing 3D polygons. Dark, immersive background.

Mobile UI, Cyberpunk Futuristic aesthetic. Neon color palette (e.g., electric blue, neon purple, matrix green). Glowing grid lines, metallic textures, terminal-style typography. High-tech HUD elements. Monospaced fonts, smooth slide animations, data-driven visuals.`,
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
