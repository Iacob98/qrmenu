import OpenAI from "openai";

// Helper function for error handling
const handleError = (error: unknown): string => {
  return error instanceof Error ? error.message : "An unexpected error occurred";
};

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
interface AIGeneratedDish {
  name: string;
  description: string;
  price: number;
  ingredients: string[];
  nutrition?: {
    protein: number;
    fat: number;
    carbs: number;
    calories: number;
  };
  tags: string[];
}

export class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzePDF(base64Data: string): Promise<AIGeneratedDish[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a menu analysis expert. Extract dish information from the provided PDF image and return a JSON array of dishes. Each dish should have: name, description, price (as number), ingredients (array), nutrition (optional object with protein, fat, carbs, calories), and tags (array of dietary tags like "vegetarian", "spicy", "gluten-free", etc.).`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this menu PDF and extract all dishes with their information. Return as JSON array."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Data}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"dishes": []}');
      return result.dishes || [];
    } catch (error) {
      throw new Error(`Failed to analyze PDF: ${handleError(error)}`);
    }
  }

  async analyzePhoto(base64Image: string): Promise<AIGeneratedDish[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a menu analysis expert. Extract dish information from the provided menu photo and return a JSON object with a "dishes" array. Each dish should have: name, description, price (as number), ingredients (array), nutrition (optional object with protein, fat, carbs, calories), and tags (array of dietary tags like "vegetarian", "spicy", "gluten-free", etc.).`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this menu photo and extract all visible dishes with their information. Return as JSON object with dishes array."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"dishes": []}');
      return result.dishes || [];
    } catch (error) {
      throw new Error(`Failed to analyze photo: ${handleError(error)}`);
    }
  }

  async analyzeText(text: string): Promise<AIGeneratedDish[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a menu analysis expert. Parse the provided text and extract dish information. Return a JSON object with a "dishes" array. Each dish should have: name, description, price (as number), ingredients (array), nutrition (optional object with protein, fat, carbs, calories), and tags (array of dietary tags like "vegetarian", "spicy", "gluten-free", etc.).`
          },
          {
            role: "user",
            content: `Parse this menu text and extract all dishes with their information. Return as JSON object with dishes array:\n\n${text}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"dishes": []}');
      return result.dishes || [];
    } catch (error) {
      throw new Error(`Failed to analyze text: ${handleError(error)}`);
    }
  }

  async generateDishImage(dishName: string, description: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional food photography of ${dishName}: ${description}. High quality, appetizing, restaurant-style presentation, well-lit, neutral background`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return response.data?.[0]?.url || "";
    } catch (error) {
      throw new Error(`Failed to generate image: ${handleError(error)}`);
    }
  }

  async enhanceDish(dish: Partial<AIGeneratedDish>): Promise<AIGeneratedDish> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a culinary expert. Enhance the provided dish information by filling in missing details. Return a complete JSON object with: name, description, price (as number), ingredients (array), nutrition (object with protein, fat, carbs, calories), and tags (array of dietary tags).`
          },
          {
            role: "user",
            content: `Enhance this dish information with missing details and return complete JSON object: ${JSON.stringify(dish)}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      throw new Error(`Failed to enhance dish: ${handleError(error)}`);
    }
  }
}

export function createAIService(apiKey: string): AIService {
  return new AIService(apiKey);
}
