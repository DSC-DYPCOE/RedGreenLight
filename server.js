require("dotenv").config(); // Load environment variables
const io = require("socket.io")(process.env.PORT || 3000, {
  cors: {
    origin: [
      process.env.URL,
      "https://redgreenlight.netlify.app",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    methods: ["GET", "POST"], 
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
});

let lightStates = {}; // Track light state for each slot
let slotParagraphs = {}; // Map slot IDs to assigned paragraphs
let lightIntervals = {}; // Track intervals for each slot

// Predefined paragraphs
const paragraphs = [
  "In Squid Game, players must remain perfectly still when the giant doll turns around. Any movement detected means instant elimination.",
  "The rules are simple: move during red light and you're eliminated. Only move when the light is green. Stay focused and control your movements.",
  "456 players entered the game seeking the ultimate prize. Many failed at this first challenge, unable to control their trembling bodies.",
  "The giant doll's song echoes through the field: 'Red light, green light, 1-2-3!' Each note could be your last if you're not careful.",
  "The stakes are life and death. One wrong move, one slight tremor, and it's game over. Keep your eyes on the prize and stay absolutely still.",
];

// Utility function to randomly assign a paragraph to a slot
function assignRandomParagraph(slotId) {
  if (!slotParagraphs[slotId]) {
    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    slotParagraphs[slotId] = randomParagraph;
  }
  return slotParagraphs[slotId];
}

// Function to get random duration between min and max seconds
function getRandomDuration(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

// Function to start automatic light toggling for a slot
function startAutoToggle(slotId) {
  if (lightIntervals[slotId]) {
    clearInterval(lightIntervals[slotId]);
  }

  const toggleLight = () => {
    lightStates[slotId] = !lightStates[slotId];
    io.emit("light-toggle", {
      slotId,
      isGreen: lightStates[slotId],
    });
    console.log(`Light for slot ${slotId} is now ${lightStates[slotId] ? "green" : "red"}`);

    // Set next toggle with random duration
    clearInterval(lightIntervals[slotId]);
    const nextDuration = getRandomDuration(2, 8); // Random duration between 2-8 seconds
    lightIntervals[slotId] = setTimeout(toggleLight, nextDuration);
  };

  // Initial toggle
  toggleLight();
}

io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit the current light state and assigned paragraph to the connected client
  socket.on("request-light-state", (data) => {
    const { slotId } = data;
    const assignedParagraph = assignRandomParagraph(slotId); // Ensure paragraph is assigned
    
    // Start auto-toggle if not already started for this slot
    if (!lightIntervals[slotId]) {
      startAutoToggle(slotId);
    }

    socket.emit("light-state", {
      slotId,
      isGreen: lightStates[slotId] || false,
      paragraph: assignedParagraph,
    });
  });

  // Admin manual toggle (optional override)
  socket.on("toggle-light", (data) => {
    const { slotId } = data;
    // Clear existing interval if any
    if (lightIntervals[slotId]) {
      clearInterval(lightIntervals[slotId]);
      delete lightIntervals[slotId];
    }
    // Perform manual toggle
    lightStates[slotId] = !lightStates[slotId];
    io.emit("light-toggle", {
      slotId,
      isGreen: lightStates[slotId],
    });
    console.log(`Light for slot ${slotId} is now ${lightStates[slotId] ? "green" : "red"} (Manual override)`);
  });

  socket.on("score-update", (data) => {
    // Broadcast the score update to all connected clients
    io.emit("leaderboard-update", {
      slotId: data.slotId,
      username: data.username,
      score: data.score
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
}); 