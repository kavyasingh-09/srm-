// ──────────────────────────────────────────────────────────────────
// AI Simulator Utility
// Simulates AI-powered listing generation, price recommendation,
// and scam detection — all client-side (no backend required).
// ──────────────────────────────────────────────────────────────────

// ─── AI LISTING GENERATOR ─────────────────────────────────────────
const LISTING_TEMPLATES = {
  "Textbooks": [
    { title: "B.Tech Textbook Bundle (Core Engineering Subjects)", description: "Well-preserved textbook set covering core engineering subjects. Minimal pencil markings. Ideal for juniors starting the same semester. Save significantly compared to buying new from the book store.", price: 280 },
    { title: "Previous Year Question Paper Collection", description: "Complete set of end-semester PYQs with solved answers. Excellent for exam preparation. Includes model papers for internal exams.", price: 120 },
    { title: "Engineering Reference Book (Like New)", description: "Standard SRM reference textbook, barely used. No missing or torn pages. Selling after completing the course.", price: 200 },
  ],
  "Notes & Study Materials": [
    { title: "DSA Semester Notes (Arrays, Trees, Graphs)", description: "Comprehensive hand-written notes for Data Structures & Algorithms. Includes clean diagrams and explanations for key algorithms.", price: 50 },
    { title: "Python programming and Web Tech Lab Files", description: "Fully compiled lab manuals with inputs and verified outputs for all experiments. Ready for direct lab submission reference.", price: 80 },
    { title: "Chemistry & Physics Lecture Slides Combined Notes", description: "Complete class lecture slides compiled with personal side-notes for core first-year subjects.", price: 0 },
  ],
  "Electronics": [
    { title: "Scientific Calculator (Exam Approved)", description: "Works perfectly for all SRM internal and end-semester examinations. Solving capability: matrices, integration, statistics, and complex equations. Includes original cover case.", price: 750 },
    { title: "USB-C Laptop Charger (65W)", description: "Compatible with most modern laptops. 65W fast charging. Cable is intact with no fraying. Tested and working.", price: 600 },
    { title: "Noise-Cancelling Earphones with Mic", description: "Clear audio output. Works with all platforms including SRM online portals and video calls. Great for online classes.", price: 450 },
    { title: "Portable LED Study Desk Lamp", description: "3 brightness modes, USB-powered, flexible neck. Perfect for late-night studies without disturbing your roommate.", price: 350 },
  ],
  "Bicycles & Transport": [
    { title: "Campus Commuter Bicycle (Multi-Speed)", description: "Ideal for daily rides between hostel and Tech Park or academic blocks. Gears shift smoothly. Chain recently oiled. Tyres have good tread life remaining.", price: 2800 },
    { title: "Lightweight Foldable Cycle", description: "Folds in 10 seconds for easy storage inside hostel rooms. Aluminium frame, lightweight, easy to carry. Small scratches on frame but mechanically perfect.", price: 3200 },
  ],
  "Hostel Essentials": [
    { title: "Electric Kettle (1.5L, Auto-Shutoff)", description: "Boils water in under 3 minutes. Auto-shutoff safety feature. Essential for making tea, coffee, or Maggi during late-night exam preparations. Clean and working.", price: 400 },
    { title: "Foldable Metal Cupboard Organizer", description: "Portable, stackable, and saves significant shelf space inside the hostel room cupboard. Holds books, clothes, and accessories separately.", price: 320 },
    { title: "Extension Board (4-Socket, 5 Meters)", description: "Surge-protected 4-socket extension board with individual on/off switches. Needed when the room has limited plug points.", price: 200 },
    { title: "Non-Slip Bathroom Slippers (Size 8)", description: "Sturdy rubber, anti-slip sole. Hostel bathroom floors can get slippery. Extra pair available.", price: 80 },
  ],
  "Lab Coats & Fashion": [
    { title: "SRM Standard White Lab Coat (Size M/L)", description: "Clean, ironed, and pressed white lab coat conforming to SRM lab dress code. Size is approximately M/L. Suitable for chemistry, biology, and biotech labs.", price: 260 },
    { title: "Formal College Shirt (White)", description: "SRM exam and placement formal white shirt. Well-ironed and laundered. Selling because it no longer fits.", price: 180 },
  ],
  "Other Accessories": [
    { title: "Engineering Drawing Complete Kit", description: "Full mini-drafter set with T-Square, drawing board, set squares, compass, and pencil types H/HB/2H. Essential for 1st-year Engineering Graphics course.", price: 750 },
    { title: "Sports Equipment (Badminton Racket Set)", description: "Pair of rackets with 3 shuttlecocks. Lightweight frame, good balance and grip. Used for regular play at the SRM sports complex.", price: 700 },
  ],
  "Projects": [
    { title: "Voice Controlled Robotic Vehicle (Arduino)", description: "Fully assembled robotics mini-project. Powered by Arduino Uno, HC-05 Bluetooth module, and L298N motor driver shield. Ready for lab presentation. PPT and documentation included.", price: 1500 },
    { title: "Biometric Attendance Management System", description: "Working major project utilizing ESP32, Adafruit fingerprint sensor, and local web dashboard to mark student roll calls. Code base clean and commented.", price: 2200 },
    { title: "E-Commerce Shopping Web App (React & Firebase)", description: "Complete web application project code. User authentication, catalog search, cart checkout, and Firebase backend integration. Perfect for web tech lab.", price: 1000 },
  ],
};

export function generateAIListing(category) {
  const templates = LISTING_TEMPLATES[category] || LISTING_TEMPLATES["Other Accessories"];
  const picked = templates[Math.floor(Math.random() * templates.length)];
  // Add slight random variation to price (±10%)
  const variation = Math.round(picked.price * (0.9 + Math.random() * 0.2));
  return {
    title: picked.title,
    description: picked.description,
    price: variation,
  };
}

// ─── AI PRICE RECOMMENDATION ──────────────────────────────────────
const PRICE_RANGES = {
  "Textbooks":          { newBase: 500,  sellRatio: 0.50 },
  "Notes & Study Materials": { newBase: 200,  sellRatio: 0.40 },
  "Electronics":        { newBase: 2500, sellRatio: 0.60 },
  "Bicycles & Transport":{ newBase: 6000, sellRatio: 0.55 },
  "Hostel Essentials":  { newBase: 800,  sellRatio: 0.50 },
  "Lab Coats & Fashion":{ newBase: 600,  sellRatio: 0.45 },
  "Projects":            { newBase: 3500, sellRatio: 0.60 },
  "Other Accessories":  { newBase: 1200, sellRatio: 0.55 },
};

const CONDITION_MULTIPLIERS = {
  "New (Sealed)": 0.95,
  "Like New":     0.75,
  "Good":         0.55,
  "Fair":         0.35,
  "Needs repair": 0.20,
};

export function getPriceRecommendation(category, condition) {
  const range = PRICE_RANGES[category] || { newBase: 1000, sellRatio: 0.50 };
  const condMul = CONDITION_MULTIPLIERS[condition] || 0.55;
  const newPrice = range.newBase + Math.round(range.newBase * (Math.random() * 0.2 - 0.1));
  const recommended = Math.round(newPrice * range.sellRatio * condMul * 10) * 10;
  return { newPrice, recommended: Math.max(recommended, 50) };
}

// ─── AI SCAM DETECTION ────────────────────────────────────────────
const SUSPICIOUS_KEYWORDS = [
  "guarantee", "100% profit", "earn money", "send advance",
  "pay first", "lottery", "free iphone", "free laptop",
  "transfer", "bitcoin", "upi advance", "paytm advance",
  "click link", "whatsapp me now", "urgent urgent",
];

const UNREALISTIC_PRICE_RANGES = {
  "Electronics":          { min: 50,   max: 50000 },
  "Bicycles & Transport": { min: 200,  max: 30000 },
  "Textbooks":            { min: 10,   max: 3000  },
  "Notes & Study Materials": { min: 0,    max: 1000  },
  "Hostel Essentials":    { min: 10,   max: 5000  },
  "Lab Coats & Fashion":  { min: 20,   max: 2000  },
  "Projects":             { min: 100,  max: 25000 },
  "Other Accessories":    { min: 10,   max: 10000 },
};

export function detectScam(title, price, description, category) {
  const flags = [];
  const text = `${title} ${description}`.toLowerCase();

  // Check for suspicious keywords
  SUSPICIOUS_KEYWORDS.forEach((kw) => {
    if (text.includes(kw.toLowerCase())) {
      flags.push(`Suspicious phrase detected: "${kw}"`);
    }
  });

  // Check for unrealistic prices
  const range = UNREALISTIC_PRICE_RANGES[category] || { min: 10, max: 20000 };
  if (price !== 0) {
    if (price < range.min) {
      flags.push(`Price (₹${price}) is unrealistically low for this category.`);
    }
    if (price > range.max) {
      flags.push(`Price (₹${price}) seems unusually high for this category.`);
    }
  }

  // Check for extremely short descriptions
  if (description && description.trim().length < 20) {
    flags.push("Description is too short — low-quality listing.");
  }

  // Score: 100 = completely safe, reduced per flag
  const score = Math.max(0, 100 - flags.length * 30);
  const safe = score >= 70;

  return { score, flags, safe };
}
