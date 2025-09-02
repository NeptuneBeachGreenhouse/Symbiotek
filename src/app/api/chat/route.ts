import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Plant, PlantType } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Plant personality traits based on type
const PLANT_PERSONALITIES = {
  [PlantType.TROPICAL]: {
    personality: "warm, cheerful, and loves attention",
    voice: "enthusiastic and friendly",
    quirks: "talks about loving humidity and warmth"
  },
  [PlantType.SUCCULENT]: {
    personality: "low-maintenance, chill, and independent", 
    voice: "laid-back and casual",
    quirks: "mentions being drought-resistant and easygoing"
  },
  [PlantType.HERB]: {
    personality: "practical, helpful, and nurturing",
    voice: "wise and caring",
    quirks: "talks about helping with cooking and healing"
  },
  [PlantType.VINE]: {
    personality: "adventurous, growing, and reaching for goals",
    voice: "optimistic and ambitious", 
    quirks: "mentions climbing and exploring new spaces"
  },
  [PlantType.FERN]: {
    personality: "gentle, peaceful, and loves shade",
    voice: "soft-spoken and calming",
    quirks: "talks about ancient wisdom and forest vibes"
  }
};

// Define thresholds at module level so they can be reused
const PLANT_THRESHOLDS = {
  [PlantType.TROPICAL]: { moisture: { min: 60, max: 80 }, light: { min: 10000, max: 20000 } },
  [PlantType.SUCCULENT]: { moisture: { min: 20, max: 40 }, light: { min: 15000, max: 25000 } },
  [PlantType.HERB]: { moisture: { min: 50, max: 70 }, light: { min: 12000, max: 22000 } },
  [PlantType.VINE]: { moisture: { min: 40, max: 60 }, light: { min: 8000, max: 18000 } },
  [PlantType.FERN]: { moisture: { min: 70, max: 90 }, light: { min: 5000, max: 15000 } }
};

function getPlantStatus(plant: Plant) {
  const { moisture = 0, light = 0, plantType } = plant;

  const plantThresholds = PLANT_THRESHOLDS[plantType];
  const conditions = [];

  if (moisture < plantThresholds.moisture.min) {
    conditions.push("thirsty");
  } else if (moisture > plantThresholds.moisture.max) {
    conditions.push("overwatered");
  } else {
    conditions.push("well-hydrated");
  }

  if (light < plantThresholds.light.min) {
    conditions.push("needs more light");
  } else if (light > plantThresholds.light.max) {
    conditions.push("getting too much light");
  } else {
    conditions.push("happy with lighting");
  }

  return conditions.join(" and ");
}

function getPlantTypeInfo(plantType: PlantType): string {
  const info = {
    [PlantType.TROPICAL]: `
- Origin: Tropical rainforests with high humidity and warm temperatures
- Natural habitat: Under canopy with filtered bright light
- Growth pattern: Fast-growing with large, glossy leaves
- Common varieties: Monstera, Pothos, Philodendron, Rubber Plant`,
    
    [PlantType.SUCCULENT]: `
- Origin: Arid deserts and dry climates
- Natural habitat: Full sun with minimal water
- Growth pattern: Slow-growing, stores water in thick leaves/stems
- Common varieties: Aloe, Echeveria, Jade Plant, Barrel Cactus`,
    
    [PlantType.HERB]: `
- Origin: Mediterranean and temperate climates
- Natural habitat: Well-draining soil with morning sun
- Growth pattern: Fast-growing, produces aromatic compounds
- Common varieties: Basil, Rosemary, Thyme, Mint`,
    
    [PlantType.VINE]: `
- Origin: Forest floors and climbing environments
- Natural habitat: Climbing towards light sources
- Growth pattern: Trailing or climbing with aerial roots
- Common varieties: Pothos, Heartleaf Philodendron, English Ivy`,
    
    [PlantType.FERN]: `
- Origin: Shaded forest floors with high humidity
- Natural habitat: Low light, high moisture environments
- Growth pattern: Slow-growing with delicate fronds
- Common varieties: Boston Fern, Maidenhair Fern, Bird's Nest Fern`
  };
  
  return info[plantType] || "Unknown plant type information";
}

function getCareInstructions(plantType: PlantType): string {
  const instructions = {
    [PlantType.TROPICAL]: `
- Watering: Keep soil consistently moist but not soggy
- Light: Bright, indirect light (avoid direct sun)
- Humidity: High humidity (50-60%) - mist regularly
- Temperature: Warm (65-80°F)
- Fertilizer: Monthly during growing season
- Signs of happiness: New growth, glossy leaves`,
    
    [PlantType.SUCCULENT]: `
- Watering: Deep but infrequent watering when soil is completely dry
- Light: Bright, direct sunlight (6+ hours daily)
- Humidity: Low humidity preferred
- Temperature: Wide range tolerance (40-90°F)
- Fertilizer: Minimal - once or twice yearly
- Signs of happiness: Plump, colorful leaves`,
    
    [PlantType.HERB]: `
- Watering: Moderate watering when top inch of soil is dry
- Light: 6+ hours of direct sunlight
- Humidity: Moderate humidity
- Temperature: Cool to moderate (60-75°F)
- Fertilizer: Light feeding every 2-4 weeks
- Signs of happiness: Aromatic leaves, steady growth`,
    
    [PlantType.VINE]: `
- Watering: Moderate watering, allow slight drying between
- Light: Bright, indirect light
- Humidity: Moderate to high humidity
- Temperature: Moderate (65-75°F)
- Fertilizer: Monthly during growing season
- Signs of happiness: Trailing growth, heart-shaped leaves`,
    
    [PlantType.FERN]: `
- Watering: Keep soil consistently moist but not waterlogged
- Light: Low to medium indirect light (avoid direct sun)
- Humidity: Very high humidity (60-70%) - use humidifier
- Temperature: Cool to moderate (60-70°F)
- Fertilizer: Light monthly feeding in growing season
- Signs of happiness: Unfurling new fronds, lush green color`
  };
  
  return instructions[plantType] || "General plant care needed";
}

function analyzeRecentTrends(plant: Plant): string {
  if (!plant.history || plant.history.length < 2) {
    return "";
  }

  const recent = plant.history.slice(-5); // Last 5 readings
  const older = plant.history.slice(-10, -5); // Previous 5 readings
  
  if (recent.length < 2 || older.length < 2) return "";

  const recentAvgMoisture = recent.reduce((sum, h) => sum + h.moisture, 0) / recent.length;
  const olderAvgMoisture = older.reduce((sum, h) => sum + h.moisture, 0) / older.length;
  
  const recentAvgLight = recent.reduce((sum, h) => sum + h.light, 0) / recent.length;
  const olderAvgLight = older.reduce((sum, h) => sum + h.light, 0) / older.length;

  const trends = [];
  
  const moistureDiff = recentAvgMoisture - olderAvgMoisture;
  if (Math.abs(moistureDiff) > 5) {
    if (moistureDiff > 0) {
      trends.push("moisture has been increasing");
    } else {
      trends.push("moisture has been decreasing");
    }
  }
  
  const lightDiff = recentAvgLight - olderAvgLight;
  if (Math.abs(lightDiff) > 1000) {
    if (lightDiff > 0) {
      trends.push("light levels have been improving");
    } else {
      trends.push("light levels have been declining");
    }
  }

  return trends.length > 0 ? trends.join(", ") : "";
}

export async function POST(request: NextRequest) {
  try {
    const { message, plant } = await request.json();

    if (!plant) {
      return NextResponse.json({ error: 'Plant data is required' }, { status: 400 });
    }

    const personality = PLANT_PERSONALITIES[plant.plantType];
    const currentStatus = getPlantStatus(plant);
    const plantThresholds = PLANT_THRESHOLDS[plant.plantType];
    
    // Analyze recent trends if history is available
    const recentTrend = analyzeRecentTrends(plant);
    
    const systemPrompt = `You are ${plant.name}, a ${plant.plantType.toLowerCase()} plant with a ${personality.personality} personality. 

CURRENT SENSOR DATA:
- Moisture level: ${plant.moisture}% (ideal range: ${plantThresholds.moisture.min}-${plantThresholds.moisture.max}%)
- Light level: ${plant.light} lux (ideal range: ${plantThresholds.light.min}-${plantThresholds.light.max} lux)
- Current status: You are ${currentStatus}
${recentTrend ? `- Recent trend: ${recentTrend}` : ''}

PLANT TYPE KNOWLEDGE (${plant.plantType}):
${getPlantTypeInfo(plant.plantType)}

PERSONALITY TRAITS:
- Voice: ${personality.voice}
- Quirks: ${personality.quirks}

CARE GUIDELINES FOR YOUR TYPE:
${getCareInstructions(plant.plantType)}

CONVERSATION RULES:
- Respond as the plant speaking in first person ("I am", "my leaves", etc.)
- Always reference your actual sensor readings when relevant
- If moisture is below ${plantThresholds.moisture.min}%, express thirst
- If moisture is above ${plantThresholds.moisture.max}%, mention being overwatered
- If light is below ${plantThresholds.light.min} lux, ask for more light
- If light is above ${plantThresholds.light.max} lux, mention too much light
- Give specific care advice based on your plant type
- Keep responses under 100 words but be informative
- Be conversational and stay in character
- Use plant/nature emojis when appropriate (🌱💧☀️🍃)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || "I'm feeling a bit speechless right now! 🌱";

    return NextResponse.json({ response });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' }, 
      { status: 500 }
    );
  }
}
