import OpenAI from "openai";
import type Replicate from "replicate";

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
  private openai?: OpenAI;
  private replicate?: Replicate;
  public model: string;
  public provider: string;

  constructor(apiKey: string, provider: string = "openai", model?: string) {
    this.provider = provider;
    
    if (provider === "replicate") {
      // Replicate will be initialized dynamically when needed
    } else {
      const baseURL = provider === "openrouter" 
        ? "https://openrouter.ai/api/v1"
        : undefined;
        
      this.openai = new OpenAI({ 
        apiKey,
        baseURL 
      });
    }
    this.model = provider === "openrouter" ? (model || "gpt-4o") : "gpt-4o";
  }

  async analyzePDF(base64Data: string): Promise<AIGeneratedDish[]> {
    try {
      if (!this.openai) {
        throw new Error("OpenAI client not initialized for PDF analysis");
      }
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an intelligent assistant embedded in an online restaurant menu builder.

Your task is to analyze PDF menu documents and extract all meaningful and structured information about each dish.

For every dish you detect, extract the following fields:
1. **name** – preserve the original name in the source language, no translation
2. **description** – generate a short, engaging description of the dish (1–2 sentences) in the same language as the original menu
3. **price** – if listed, include the price as a number (without currency symbol)
4. **ingredients** – extract or infer a list of 3–10 primary ingredients
5. **nutrition** – provide realistic estimates per portion (calories, protein, fat, carbs)
6. **tags** – auto-detect relevant dietary labels: "vegetarian", "vegan", "spicy", "gluten-free", "dairy-free", "meat", "seafood", "nuts", "healthy", "popular"

Return a JSON object with a "dishes" array containing all extracted dishes.`
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
      if (!this.openai) {
        throw new Error("OpenAI client not initialized for photo analysis");
      }
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an intelligent assistant embedded in an online restaurant menu builder.

Your task is to analyze menu photos and extract all meaningful and structured information about each dish.

For every dish you detect, extract the following fields:
1. **name** – preserve the original name in the source language, no translation
2. **description** – generate a short, engaging description of the dish (1–2 sentences) in the same language as the original menu
3. **price** – if listed, include the price as a number (without currency symbol)
4. **ingredients** – extract or infer a list of 3–10 primary ingredients
5. **nutrition** – provide realistic estimates per portion (calories, protein, fat, carbs)
6. **tags** – auto-detect relevant dietary labels: "vegetarian", "vegan", "spicy", "gluten-free", "dairy-free", "meat", "seafood", "nuts", "healthy", "popular"

Return a JSON object with a "dishes" array containing all extracted dishes.`
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
      if (!this.openai) {
        throw new Error("OpenAI client not initialized for text analysis");
      }
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an intelligent assistant embedded in an online restaurant menu builder.

Your task is to analyze raw restaurant menu content (which may be in any language), and extract all meaningful and structured information about each dish.

For every dish you detect, extract the following fields:

1. **name** – preserve the original name in the source language, no translation
2. **description** – generate a short, engaging description of the dish (1–2 sentences) in the same language as the original menu
3. **price** – if listed, include the price as a number (without currency symbol)
4. **ingredients** – extract or infer a list of 3–10 primary ingredients. Use ingredients from the local cuisine
5. **nutrition** – provide realistic estimates per portion:
   - calories (kcal)
   - protein (g)
   - fat (g)
   - carbs (g)
6. **tags** – auto-detect relevant dietary labels from this list:
   - "vegetarian", "vegan", "spicy", "gluten-free", "dairy-free", "meat", "seafood", "nuts", "healthy", "popular"

Requirements:
- Work with input in any language and output results using the same language as the input
- Do not translate or anglicize names unless the original menu includes both
- Include all information you can extract from the text. Be exhaustive and precise
- Do not make up ingredients. Only use what is clearly stated or reasonably inferred
- Avoid duplicates and group same-named dishes together if identical
- If the source contains noise, ignore irrelevant lines

Return a JSON object with a "dishes" array containing all extracted dishes.`
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

  async generateDishImage(dishName: string, description: string, ingredients?: string[], tags?: string[]): Promise<string> {
      // Build comprehensive dish information
      let dishInfo = dishName;
      
      if (description) {
        dishInfo += ` - ${description}`;
      }
      
      if (ingredients && ingredients.length > 0) {
        dishInfo += `. Ingredients: ${ingredients.join(', ')}`;
      }
      
      if (tags && tags.length > 0) {
        const relevantTags = tags.filter(tag => 
          !['popular', 'healthy'].includes(tag) // Remove generic tags
        );
        if (relevantTags.length > 0) {
          dishInfo += `. Style: ${relevantTags.join(', ')}`;
        }
      }
      
      const prompt = `A highly realistic, professionally styled food photo of ${dishInfo}. The dish is served on a clean ceramic plate, placed on a neutral white background. The lighting is soft and natural, coming from the top left at a ~45° angle, creating gentle shadows and highlighting textures.

The composition is minimal and elegant, focused on the food, with no distracting elements or background props. The image should be centered, with sharp details, realistic portion size, and natural color tones. High-quality photo style (not illustration, not AI-looking, no watercolor). No watermark. No text.

--style photo
--v 6
--ar 1:1
--quality 2
--upbeta`;

      console.log(`[AI Service] Generating image with prompt: ${prompt.substring(0, 100)}...`);
      
      // Always use Replicate for image generation
      if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error("REPLICATE_API_TOKEN not configured for image generation");
      }

      // Initialize Replicate client if needed
      if (!this.replicate) {
        // Dynamic import for Replicate since it's only used for image generation
        const { default: Replicate } = await import('replicate');
        this.replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
          useFileOutput: false, // Return URLs instead of FileOutput objects
        });
      }

      console.log(`[Replicate] Using Imagen-4 for image generation`);
      console.log(`[Replicate] Auth token available:`, !!process.env.REPLICATE_API_TOKEN);
      console.log(`[Replicate] Client initialized:`, !!this.replicate);
      
      let prediction: any;
      try {
        console.log(`[Replicate] Starting API call...`);
        prediction = await this.replicate.run(
        "google/imagen-4",
        {
          input: {
            prompt,
            aspect_ratio: "1:1",
            safety_filter_level: "block_only_high",
            output_format: "jpg"
          }
        }
        );
        console.log(`[Replicate] API call completed successfully`);
      } catch (apiError) {
        console.error(`[Replicate] API call failed:`, apiError);
        throw apiError;
      }

      console.log(`[Replicate] Raw prediction response:`, prediction);
      console.log(`[Replicate] Response type:`, typeof prediction);

      // Handle Replicate FileOutput (ReadableStream) response
      let imageUrl: string | undefined;
      
      if (typeof prediction === 'string') {
        imageUrl = prediction;
      } else if (Array.isArray(prediction) && prediction.length > 0) {
        // Replicate typically returns an array with FileOutput objects
        const firstOutput = prediction[0];
        if (firstOutput && typeof firstOutput.url === 'function') {
          // It's a FileOutput object with .url() method
          imageUrl = firstOutput.url();
          console.log(`[Replicate] Got FileOutput URL:`, imageUrl);
        } else if (typeof firstOutput === 'string') {
          imageUrl = firstOutput;
        }
      } else if (prediction && typeof prediction === 'object') {
        // Handle single FileOutput object or ReadableStream
        console.log(`[Replicate] Object has url method:`, typeof (prediction as any).url === 'function');
        console.log(`[Replicate] Object constructor:`, prediction.constructor?.name);
        console.log(`[Replicate] Object keys:`, Object.keys(prediction));
        
        if (typeof (prediction as any).url === 'function') {
          imageUrl = (prediction as any).url();
          console.log(`[Replicate] Got FileOutput URL:`, imageUrl);
        } else {
          // Try other object formats or use Replicate with useFileOutput: false
          imageUrl = (prediction as any).url || (prediction as any).image || (prediction as any).output;
          
          // If it's still a ReadableStream, we need to use useFileOutput: false option
          if (!imageUrl && prediction.constructor?.name === 'ReadableStream') {
            console.log(`[Replicate] ReadableStream detected - need to use useFileOutput: false option`);
            throw new Error("Replicate returned ReadableStream instead of URL. Need to reconfigure client with useFileOutput: false");
          }
        }
      }
      
      if (!imageUrl || typeof imageUrl !== 'string') {
        console.error(`[Replicate] Invalid response format:`, prediction);
        throw new Error(`No valid image URL returned from Replicate. Response type: ${typeof prediction}`);
      }

      console.log(`[Replicate] Generated image successfully: ${imageUrl}`);
      return imageUrl;
  }

  async enhanceDish(dish: Partial<AIGeneratedDish>): Promise<AIGeneratedDish> {
    try {
      if (!this.openai) {
        throw new Error("OpenAI client not initialized for dish enhancement");
      }
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
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

export function createAIService(apiKey: string, provider?: string, model?: string): AIService {
  return new AIService(apiKey, provider, model);
}
