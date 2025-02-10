/**
 * Import function triggers from their respective submodules.
 */
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");
const cors = require("cors")({ origin: true }); // Enable CORS for all origins

// Retrieve the OpenAI API key from environment variables or Firebase Functions config.
const openaiApiKey = process.env.OPENAI_API_KEY || functions.config().openai.api_key;

// Initialize the OpenAI client with the API key.
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

/**
 * HTTPS Cloud Function: compareCode
 * 
 * This function accepts POST requests containing:
 *   - user_code: The code provided by the user.
 *   - original_code: The expected reference code.
 * 
 * It calls the GPT-4o-mini model to compare the two pieces of code and returns a JSON result:
 *   {
 *     "user_code": string,
 *     "original_code": string,
 *     "score": number,        // Score out of 3
 *     "suggestions": string[]   // Empty if score is 3; otherwise, suggestions to improve the code.
 *   }
 */
exports.compareCode = onRequest((req, res) => {
  // Wrap the function with CORS middleware.
  cors(req, res, async () => {
    // Only allow POST requests.
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method not allowed" });
    }

    // Destructure and validate the request body.
    const { user_code, original_code } = req.body;
    if (!user_code || !original_code) {
      return res.status(400).send({ error: "Missing parameters: user_code and original_code are required" });
    }

    try {
      // Prepare messages for the chat completion request.
      const promptMessages = [
        {
          role: "system",
          content:
            "You are an expert coding mentor. Compare the user's code with the original expected code, score it on a scale of 0 to 3 (where 3 indicates a perfect match), and if the score is less than 3, provide specific suggestions to improve the user's code. Return the result as a JSON object following the schema: { \"user_code\": string, \"original_code\": string, \"score\": number, \"suggestions\": string[] }.",
        },
        {
          role: "user",
          content: `User Code:\n${user_code}\n\nOriginal Code:\n${original_code}`,
        },
      ];

      // Call the OpenAI GPT-4o-mini model with the provided JSON schema.
      const responseFromOpenAI = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: promptMessages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "code_comparison",
            schema: {
              type: "object",
              required: ["user_code", "original_code", "score", "suggestions"],
              properties: {
                score: {
                  type: "number",
                  description: "A score out of 3 indicating how closely the user code matches the original code.",
                },
                user_code: {
                  type: "string",
                  description: "The code written by the user.",
                },
                suggestions: {
                  type: "array",
                  items: {
                    type: "string",
                    description: "A specific suggestion to improve the user's code.",
                  },
                  description: "Suggestions to improve the user code if the score is not 3.",
                },
                original_code: {
                  type: "string",
                  description: "The reference original code to compare with.",
                },
              },
              additionalProperties: false,
            },
          },
          strict: true,
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      // Extract the JSON string from the model's response.
      const resultContent = responseFromOpenAI.choices[0].message.content;
      const result = JSON.parse(resultContent);

      // If the score is a perfect match (3), clear any suggestions.
      if (result.score === 3) {
        result.suggestions = [];
      }

      return res.status(200).send(result);
    } catch (error) {
      logger.error("Error in compareCode function:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  });
});
