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
  category?: string;
}

interface AIGeneratedMenuResult {
  categories: Array<{
    name: string;
    icon?: string;
  }>;
  dishes: AIGeneratedDish[];
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

  async analyzePDF(base64Data: string): Promise<AIGeneratedMenuResult> {
    try {
      if (!this.openai) {
        throw new Error("OpenAI client not initialized for PDF analysis");
      }

      console.log(`[AI] Analyzing PDF with ${this.model} on ${this.provider}`);
      
      // Try to extract text from PDF using pdfjs-dist
      let extractedText = '';
      try {
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        // Convert Buffer to Uint8Array as required by pdfjs-dist
        const pdfData = new Uint8Array(pdfBuffer);
        
        // Use pdfjs-dist legacy build for Node.js
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        // Load the PDF
        const loadingTask = pdfjsLib.getDocument({
          data: pdfData,
          verbosity: 0  // Suppress console logs
        });
        const pdf = await loadingTask.promise;
        
        console.log(`[AI] PDF loaded successfully. Pages: ${pdf.numPages}`);
        
        // Extract text from all pages
        let allText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          allText += pageText + '\n';
        }
        
        extractedText = allText.trim();
        console.log(`[AI] Extracted text (${extractedText.length} chars): ${extractedText.substring(0, 300)}...`);
        
      } catch (extractError) {
        console.log(`[AI] PDF text extraction failed:`, extractError);
        extractedText = '';
      }

      // For PDF analysis, prefer Claude via OpenRouter as it handles documents better
      let modelToUse = this.model;
      if (this.provider === 'openrouter') {
        modelToUse = 'anthropic/claude-3.5-sonnet'; // Claude is better with documents
      } else {
        modelToUse = 'gpt-4o'; // Fallback to OpenAI
      }
      
      if (extractedText.length < 50) {
        throw new Error("Не удалось извлечь текст из PDF. Убедитесь что PDF содержит текстовую информацию, а не только изображения. Попробуйте конвертировать PDF в изображения и использовать анализ фото.");
      }

      const userPrompt = `Проанализируй этот текст меню из PDF и извлеки ТОЧНУЮ информацию о блюдах:

"${extractedText}"

ВАЖНО: Используй только информацию из предоставленного текста. Не добавляй блюда которых нет в тексте.

Найди и извлеки:
- Названия блюд (точно как в тексте)
- Цены (если указаны) 
- Описания (если есть)
- Создай логичные категории для блюд (например: "Appetizers", "Main Dishes", "Desserts", "Beverages")

ОБЯЗАТЕЛЬНО создай массив categories и назначь каждому блюду категорию.`;
      
      const response = await this.openai.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: `You are an intelligent assistant embedded in an online restaurant menu builder.

Create a realistic restaurant menu structure with the following requirements:

CATEGORIES: Create 4-6 logical menu categories (e.g., "Appetizers", "Main Dishes", "Desserts", "Beverages", etc.)

DISHES: For each dish, provide:
1. **name** – creative, appetizing dish names
2. **description** – short, engaging description (1-2 sentences)
3. **price** – realistic prices between 8-25
4. **ingredients** – list of 4-8 main ingredients
5. **nutrition** – realistic estimates per portion (calories: 200-800, protein: 10-40g, fat: 5-50g, carbs: 10-60g)
6. **tags** – relevant dietary labels: "vegetarian", "vegan", "spicy", "gluten-free", "dairy-free", "meat", "seafood", "nuts", "healthy", "popular"
7. **category** – assign to appropriate category

Return a JSON object with:
{
  "categories": [
    {"name": "Appetizers", "icon": "🥗"},
    {"name": "Main Dishes", "icon": "🍽️"}
  ],
  "dishes": [
    {
      "name": "Точное название из текста",
      "category": "Main Dishes", 
      "description": "Описание из текста или краткое на основе ингредиентов",
      "price": 18.50,
      "ingredients": ["список", "ингредиентов", "из", "текста"],
      "nutrition": {"calories": 420, "protein": 20, "fat": 15, "carbs": 30},
      "tags": ["подходящие", "теги"]
    }
  ]
}

ВАЖНО: Каждое блюдо ОБЯЗАТЕЛЬНО должно иметь category, и эта category должна существовать в массиве categories!`
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response content from AI");
      }

      let result;
      try {
        result = JSON.parse(content);
      } catch (jsonError) {
        console.error("AI Response JSON Parse Error (PDF):", jsonError);
        console.error("Raw AI Response:", content);
        
        // Try to extract JSON from response if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (secondJsonError) {
            throw new Error(`Invalid JSON response from AI. Raw response: ${content.substring(0, 200)}...`);
          }
        } else {
          throw new Error(`No valid JSON found in AI response. Raw response: ${content.substring(0, 200)}...`);
        }
      }

      console.log(`[AI] PDF Analysis completed. Generated ${result.dishes?.length || 0} dishes in ${result.categories?.length || 0} categories`);

      return {
        categories: Array.isArray(result.categories) ? result.categories : [],
        dishes: Array.isArray(result.dishes) ? result.dishes : []
      };
    } catch (error) {
      console.error("PDF analysis error:", error);
      
      // If PDF direct analysis fails, provide helpful guidance
      if (error instanceof Error && error.message.includes("Invalid MIME type")) {
        throw new Error("PDF формат не поддерживается напрямую. Конвертируйте PDF в изображение (JPG/PNG) и используйте анализ фото, или скопируйте текст и используйте текстовый анализ.");
      }
      
      throw new Error(`Failed to analyze PDF: ${handleError(error)}`);
    }
  }

  async analyzePhoto(base64Image: string): Promise<AIGeneratedMenuResult> {
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

Your task is to analyze menu photos and extract all meaningful and structured information, automatically organizing dishes into logical categories.

STEP 1: Identify Categories
First, identify all menu categories/sections from the photo (e.g., "Appetizers", "Main Dishes", "Desserts", "Beverages", "Salads", etc.)

STEP 2: Extract Dishes
For every dish you detect, extract the following fields:
1. **name** – preserve the original name in the source language, no translation
2. **description** – generate a short, engaging description of the dish (1–2 sentences) in the same language as the original menu
3. **price** – if listed, include the price as a number (without currency symbol)
4. **ingredients** – extract or infer a list of 3–10 primary ingredients
5. **nutrition** – provide realistic estimates per portion (calories, protein, fat, carbs)
6. **tags** – auto-detect relevant dietary labels: "vegetarian", "vegan", "spicy", "gluten-free", "dairy-free", "meat", "seafood", "nuts", "healthy", "popular"
7. **category** – assign each dish to one of the identified categories

Return a JSON object with:
- "categories" array: list of category objects with "name" and optional "icon" (use emoji or simple text like "🍽️", "🥗", "🍰")
- "dishes" array: all extracted dishes, each with their assigned category name`
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

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response content from AI");
      }

      let result;
      try {
        result = JSON.parse(content);
      } catch (jsonError) {
        console.error("AI Response JSON Parse Error:", jsonError);
        console.error("Raw AI Response:", content);
        
        // Try to extract JSON from response if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (secondJsonError) {
            throw new Error(`Invalid JSON response from AI. Raw response: ${content.substring(0, 200)}...`);
          }
        } else {
          throw new Error(`No valid JSON found in AI response. Raw response: ${content.substring(0, 200)}...`);
        }
      }

      return {
        categories: Array.isArray(result.categories) ? result.categories : [],
        dishes: Array.isArray(result.dishes) ? result.dishes : []
      };
    } catch (error) {
      console.error("Photo analysis error:", error);
      throw new Error(`Failed to analyze photo: ${handleError(error)}`);
    }
  }

  async analyzeText(text: string): Promise<AIGeneratedMenuResult> {
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

Your task is to analyze raw restaurant menu content (which may be in any language), and extract all meaningful and structured information, automatically organizing dishes into logical categories.

STEP 1: Identify Categories
First, identify all menu categories/sections from the text (e.g., "Appetizers", "Main Dishes", "Desserts", "Beverages", "Salads", etc.)

STEP 2: Extract Dishes
For every dish you detect, extract the following fields:
1. **name** – preserve the original name in the source language, no translation
2. **description** – generate a short, engaging description of the dish (1–2 sentences) in the same language as the original menu
3. **price** – if listed, include the price as a number (without currency symbol)
4. **ingredients** – extract or infer a list of 3–10 primary ingredients
5. **nutrition** – provide realistic estimates per portion (calories, protein, fat, carbs)
6. **tags** – auto-detect relevant dietary labels: "vegetarian", "vegan", "spicy", "gluten-free", "dairy-free", "meat", "seafood", "nuts", "healthy", "popular"
7. **category** – assign each dish to one of the identified categories

Return a JSON object with:
- "categories" array: list of category objects with "name" and optional "icon" (use emoji or simple text like "🍽️", "🥗", "🍰")
- "dishes" array: all extracted dishes, each with their assigned category name`
          },
          {
            role: "user",
            content: `Parse this menu text and extract all dishes with their information. Return as JSON object with dishes array:\n\n${text}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response content from AI");
      }

      let result;
      try {
        result = JSON.parse(content);
      } catch (jsonError) {
        console.error("AI Response JSON Parse Error (Text):", jsonError);
        console.error("Raw AI Response:", content);
        
        // Try to extract JSON from response if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (secondJsonError) {
            throw new Error(`Invalid JSON response from AI. Raw response: ${content.substring(0, 200)}...`);
          }
        } else {
          throw new Error(`No valid JSON found in AI response. Raw response: ${content.substring(0, 200)}...`);
        }
      }

      return {
        categories: Array.isArray(result.categories) ? result.categories : [],
        dishes: Array.isArray(result.dishes) ? result.dishes : []
      };
    } catch (error) {
      console.error("Text analysis error:", error);
      throw new Error(`Failed to analyze text: ${handleError(error)}`);
    }
  }

  async generateDishImage(dishName: string, description: string, ingredients?: string[], tags?: string[], imagePrompt?: string): Promise<string> {
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
      
      let basePrompt = `A highly realistic, professionally styled food photo of ${dishInfo}. The dish is served on a clean ceramic plate, placed on a neutral white background. The lighting is soft and natural, coming from the top left at a ~45° angle, creating gentle shadows and highlighting textures.

The composition is minimal and elegant, focused on the food, with no distracting elements or background props. The image should be centered, with sharp details, realistic portion size, and natural color tones. High-quality photo style (not illustration, not AI-looking, no watercolor). No watermark. No text.`;

      // Add user-provided image prompt if specified
      if (imagePrompt && imagePrompt.trim()) {
        basePrompt += `\n\nAdditional details: ${imagePrompt.trim()}`;
      }

      const prompt = `${basePrompt}

--style photo
--v 6
--ar 1:1
--quality 2
--upbeta`;

      console.log(`[AI Service] Generating image with ComfyUI for: ${dishName}`);
      
      // Translate prompt to English for better ComfyUI results
      const englishPrompt = await this.translateToEnglish(prompt);
      console.log(`[AI Service] Original prompt: ${prompt}`);
      console.log(`[AI Service] English prompt: ${englishPrompt}`);
      
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

      console.log(`[Replicate] Using Imagen-4 Fast for image generation`);
      console.log(`[Replicate] Auth token available:`, !!process.env.REPLICATE_API_TOKEN);
      console.log(`[Replicate] Client initialized:`, !!this.replicate);
      
      let prediction: any;
      try {
        console.log(`[Replicate] Starting API call with Imagen-4 Fast...`);
        
        const fullPrompt = englishPrompt + ", professional food photography, high quality, detailed, appetizing, clean background. The dish is served on a clean ceramic plate, placed on a neutral white background. The lighting is soft and natural, coming from the top left at a ~45° angle, creating gentle shadows and highlighting textures. The composition is minimal and elegant, focused on the food, with no distracting elements or background props. The image should be centered, with sharp details, realistic portion size, and natural color tones. High-quality photo style (not illustration, not AI-looking, no watercolor). No watermark. No text.";

        prediction = await this.replicate.run(
          "google/imagen-4-fast", 
          {
            input: {
              prompt: fullPrompt,
              aspect_ratio: "1:1"
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

  private async translateToEnglish(text: string): Promise<string> {
    // Check if text contains Russian/Cyrillic characters
    const cyrillicChars = text.match(/[а-яё]/gi)?.length || 0;
    if (cyrillicChars === 0) {
      console.log(`[Translation] Text appears to be in English already`);
      return text; // No Russian characters, probably already English
    }

    try {
      if (!this.openai) {
        // Use fallback simple translation
        return this.fallbackTranslate(text);
      }

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Translate the following food description to English. Keep it concise and appetizing. Focus on the dish name and key ingredients."
          },
          {
            role: "user", 
            content: text
          }
        ],
        max_tokens: 200,
      });

      const translation = response.choices[0].message.content?.trim() || text;
      console.log(`[Translation] ${text} -> ${translation}`);
      return translation;
    } catch (error) {
      console.log(`[Translation] Failed, using fallback for: ${text}`);
      return this.fallbackTranslate(text);
    }
  }

  private fallbackTranslate(text: string): string {
    // Basic Russian to English food translation dictionary
    const translations: Record<string, string> = {
      'борщ': 'borscht soup',
      'пельмени': 'russian dumplings',
      'блины': 'russian pancakes',
      'суп': 'soup',
      'мясо': 'meat',
      'свекла': 'beetroot',
      'капуста': 'cabbage',
      'картофель': 'potato',
      'хлеб': 'bread',
      'салат': 'salad',
      'пицца': 'pizza',
      'стейк': 'steak',
      'овощи': 'vegetables',
      'сыр': 'cheese',
      'томаты': 'tomatoes',
      'тесто': 'dough',
      'специи': 'spices',
      'масло': 'oil',
      'говядина': 'beef',
      'листья': 'leaves',
      'морковь': 'carrot',
      'сметана': 'sour cream',
      'лук': 'onion'
    };

    let translated = text.toLowerCase();
    Object.entries(translations).forEach(([ru, en]) => {
      translated = translated.replace(new RegExp(ru, 'g'), en);
    });

    return translated;
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

  async improveText(prompt: string): Promise<string> {
    try {
      if (!this.openai) {
        throw new Error("OpenAI client not initialized for text improvement");
      }

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Failed to improve text: ${handleError(error)}`);
    }
  }

  /**
   * Translate menu content to multiple target languages
   */
  async translateContent(
    content: { name?: string; description?: string; ingredients?: string[] },
    sourceLang: string,
    targetLangs: string[]
  ): Promise<{ [lang: string]: { name?: string; description?: string; ingredients?: string[] } }> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized for translation");
    }

    // Filter out source language from targets
    const langsToTranslate = targetLangs.filter(lang => lang !== sourceLang);

    if (langsToTranslate.length === 0) {
      return {};
    }

    console.log(`[AI] Translating content from ${sourceLang} to ${langsToTranslate.join(', ')}`);

    const languageNames: Record<string, string> = {
      'en': 'English',
      'de': 'German',
      'ru': 'Russian',
      'uk': 'Ukrainian',
      'es': 'Spanish',
      'fr': 'French',
      'it': 'Italian',
      'pl': 'Polish',
      'tr': 'Turkish',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean'
    };

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a professional translator specializing in restaurant menus and culinary content.
Translate the provided menu content accurately while preserving the appetizing and descriptive nature of food descriptions.
Keep ingredient names accurate and recognizable. Maintain the same tone and style across all translations.
Return ONLY valid JSON, no additional text.`
          },
          {
            role: "user",
            content: `Translate this menu content from ${languageNames[sourceLang] || sourceLang} to the following languages: ${langsToTranslate.map(l => languageNames[l] || l).join(', ')}.

Content to translate:
${JSON.stringify(content, null, 2)}

Return a JSON object where each key is a language code and the value contains the translated fields:
{
  "${langsToTranslate[0]}": {
    "name": "translated name",
    "description": "translated description",
    "ingredients": ["translated", "ingredients", "array"]
  }
  ${langsToTranslate.length > 1 ? '// ... other languages' : ''}
}

Only include fields that exist in the original content.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent translations
      });

      const resultContent = response.choices[0].message.content;
      if (!resultContent) {
        throw new Error("No response content from AI");
      }

      const translations = JSON.parse(resultContent);
      console.log(`[AI] Translation completed for ${Object.keys(translations).length} languages`);

      return translations;
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error(`Failed to translate content: ${handleError(error)}`);
    }
  }

  /**
   * Translate a single category name to multiple target languages
   */
  async translateCategoryName(
    name: string,
    sourceLang: string,
    targetLangs: string[]
  ): Promise<{ [lang: string]: { name: string } }> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized for translation");
    }

    const langsToTranslate = targetLangs.filter(lang => lang !== sourceLang);

    if (langsToTranslate.length === 0) {
      return {};
    }

    console.log(`[AI] Translating category "${name}" from ${sourceLang} to ${langsToTranslate.join(', ')}`);

    const languageNames: Record<string, string> = {
      'en': 'English',
      'de': 'German',
      'ru': 'Russian',
      'uk': 'Ukrainian',
      'es': 'Spanish',
      'fr': 'French',
      'it': 'Italian',
      'pl': 'Polish',
      'tr': 'Turkish',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean'
    };

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a professional translator specializing in restaurant menus. Translate menu category names accurately.
Return ONLY valid JSON, no additional text.`
          },
          {
            role: "user",
            content: `Translate this menu category name from ${languageNames[sourceLang] || sourceLang} to: ${langsToTranslate.map(l => languageNames[l] || l).join(', ')}.

Category name: "${name}"

Return JSON: { "lang_code": { "name": "translated name" }, ... }`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.3,
      });

      const resultContent = response.choices[0].message.content;
      if (!resultContent) {
        throw new Error("No response content from AI");
      }

      const translations = JSON.parse(resultContent);
      console.log(`[AI] Category translation completed`);

      return translations;
    } catch (error) {
      console.error("Category translation error:", error);
      throw new Error(`Failed to translate category: ${handleError(error)}`);
    }
  }
}

export function createAIService(apiKey: string, provider?: string, model?: string): AIService {
  return new AIService(apiKey, provider, model);
}
