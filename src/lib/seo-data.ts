export interface IndustryTemplate {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  features: string[];
  useCases: string[];
  colorVibe: string;
  promptExample: string;
}

export const industryTemplates: IndustryTemplate[] = [
  {
    slug: "ecommerce",
    title: "E-commerce App Design",
    description: "Create stunning shopping experiences with our AI-powered e-commerce app generator.",
    metaDescription: "Generate professional e-commerce mobile app designs in seconds. AI-powered UI kits for fashion, electronics, and retail apps.",
    heroTitle: "Design the Perfect E-commerce App",
    heroSubtitle: "Convert more shoppers with a mobile experience designed for sales.",
    features: [
      "Product Discovery Feeds",
      "Seamless Checkout Flows",
      "User Reviews & Ratings",
      "Wishlist & Favorites"
    ],
    useCases: ["Fashion Retail", "Electronics Store", "Handmade Marketplace", "Grocery Delivery"],
    colorVibe: "Clean, Trustworthy, High-Contrast",
    promptExample: "A modern, minimalist fashion e-commerce app with large product imagery, clean typography, and a seamless checkout process."
  },
  {
    slug: "fitness",
    title: "Fitness & Workout App Design",
    description: "Build motivating fitness trackers and workout guides with our AI design tools.",
    metaDescription: "Generate fitness app designs instantly. Create workout trackers, yoga guides, and health monitoring apps with AI.",
    heroTitle: "Build a Fitness App That Moves Users",
    heroSubtitle: "Engage users with energetic designs and intuitive activity tracking.",
    features: [
      "Activity Dashboards",
      "Workout Video Libraries",
      "Progress Analytics",
      "Social Challenges"
    ],
    useCases: ["Personal Training", "Yoga Studio", "Running Tracker", "Meal Planning"],
    colorVibe: "Energetic, Vibrant, Dark Mode Friendly",
    promptExample: "A high-energy fitness tracking app with dark mode, neon accents for progress bars, and a social feed for sharing workouts."
  },
  {
    slug: "real-estate",
    title: "Real Estate App Design",
    description: "Design elegant property finders and real estate listings with AI.",
    metaDescription: "Expert real estate app design generator. Create property listing apps, rental platforms, and agent tools in minutes.",
    heroTitle: "Real Estate Apps That Sell",
    heroSubtitle: "Showcase properties in their best light with immersive, clean layouts.",
    features: [
      "Map-Based Search",
      "High-Res Photo Galleries",
      "Virtual Tour Integration",
      "Agent Contact Forms"
    ],
    useCases: ["Property Finder", "Rental Market", "Luxury Homes", "Agent CRM"],
    colorVibe: "Trustworthy, Blue/Gold/White, Professional",
    promptExample: "A trustworthy real estate app featuring a map-based search, large property cards, and a clean, professional blue and white color scheme."
  },
  {
    slug: "education",
    title: "Education & Learning App Design",
    description: "Create engaging learning experiences for students of all ages.",
    metaDescription: "AI education app design generator. Build LMS platforms, flashcard apps, and language learning tools effortlessly.",
    heroTitle: "Empower Learning with Great Design",
    heroSubtitle: "Focus on the content with distraction-free, accessible educational UIs.",
    features: [
      "Course Progress Tracking",
      "Interactive Quizzes",
      "Video Lesson Players",
      "Achievement Gamification"
    ],
    useCases: ["Language Learning", "Online Courses", "Kids Education", "Skill Sharing"],
    colorVibe: "Playful, Accessible, Calm",
    promptExample: "A colorful and playful language learning app with gamified progress tracking, flashcards, and friendly mascot illustrations."
  },
  {
    slug: "finance",
    title: "Fintech & Banking App Design",
    description: "Secure, professional, and clean designs for modern financial apps.",
    metaDescription: "Generate secure fintech app designs. AI tools for banking, crypto, personal finance, and budget tracking apps.",
    heroTitle: "Trust & Clarity in Finance",
    heroSubtitle: "Simplify complex financial data with clean, modern interfaces.",
    features: [
      "Data Visualization Charts",
      "Transaction History",
      "Secure Login Flows",
      "Budgeting Tools"
    ],
    useCases: ["Neobank", "Crypto Wallet", "Expense Tracker", "Investment Portfolio"],
    colorVibe: "Secure, Blue/Green, Minimalist",
    promptExample: "A sleek, modern fintech app with dark mode, vibrant data visualization charts, and a clean transaction feed."
  },
  {
    slug: "social",
    title: "Social Networking App Design",
    description: "Connect people with intuitive social feeds and messaging interfaces.",
    metaDescription: "Design the next big social network. AI templates for community apps, messaging platforms, and dating apps.",
    heroTitle: "Connect the World",
    heroSubtitle: "Focus on content and connection with optimized social layouts.",
    features: [
      "Infinite Feeds",
      "User Profiles",
      "Real-time Chat",
      "Stories & Media Sharing"
    ],
    useCases: ["Community Forum", "Dating App", "Event Networking", "Chat Application"],
    colorVibe: "Vibrant, Friendly, Clean",
    promptExample: "A trendy social networking app with a clean feed, story circles at the top, and a vibrant, youthful color palette."
  },
  {
    slug: "travel",
    title: "Travel & Booking App Design",
    description: "Inspire adventure with beautiful travel guides and booking flows.",
    metaDescription: "Create travel app designs that inspire. AI generation for flight booking, hotel reservation, and city guide apps.",
    heroTitle: "Design Your Next Adventure",
    heroSubtitle: "Immersive visuals and smooth booking flows for the modern traveler.",
    features: [
      "Destination Guides",
      "Booking Calendars",
      "Itinerary Management",
      "Reviews & Recommendations"
    ],
    useCases: ["Flight Booking", "Hotel Reservation", "City Guide", "Travel Journal"],
    colorVibe: "Bright, Airy, Photo-Centric",
    promptExample: "An inspiring travel booking app with full-screen destination images, clean date pickers, and a serene, airy aesthetic."
  },
  {
    slug: "food",
    title: "Food Delivery & Restaurant App Design",
    description: "Appetizing designs for food delivery, recipes, and restaurant menus.",
    metaDescription: "Delicious food app designs generated by AI. Create delivery apps, recipe books, and restaurant reservation systems.",
    heroTitle: "Feast Your Eyes",
    heroSubtitle: "Showcase food beautifully with layouts designed for appetite appeal.",
    features: [
      "Visual Menus",
      "Order Tracking",
      "Recipe Steps",
      "Restaurant Discovery"
    ],
    useCases: ["Food Delivery", "Recipe Book", "Restaurant Reservation", "Meal Kit Service"],
    colorVibe: "Warm, Appetizing, Clean",
    promptExample: "A mouth-watering food delivery app with large food photography, bold orange accents, and easy-to-read menus."
  }
];
