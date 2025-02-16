const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const OpenAI = require("openai");
const cors = require("cors")({origin: true});

const openaiApiKey = defineSecret("OPENAI_API_KEY");

exports.getCodeSuggestions = onRequest(
    {secrets: [openaiApiKey]},
    (req, res) => {
      cors(req, res, async () => {
        try {
          const apiKey = openaiApiKey.value();

          if (!apiKey) {
            console.error("OpenAI API key not set.");
            res.status(500).send("Error: OpenAI API key not configured.");
            return;
          }

          const openai = new OpenAI({
            apiKey: apiKey,
          });

          const {userCode, originalCode} = req.body;

          if (!userCode || !originalCode) {
            return res
                .status(400)
                .send(
                    "Error: 'userCode' and 'originalCode' are required in the" +
              "request body.",
                );
          }

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // or "gpt-4o-mini" if available // Consider using a more robust model if needed.
            messages: [
              {
                role: "system",
                content: // MODIFIED: Updated system prompt for Python
                "You are a Python code analysis assistant. You will receive two code" +
                "snippets: user code and original code. Compare the " +
                "'user_code' to the 'original_code'. If the user code is " +
                "exactly the same as the original code, respond with the " +
                "single word: 'Congratulations!'. If the user code is not " +
                "correct, provide a list of suggestions on separate lines " +
                "to improve the user code specifically for Python 'Hello, World!' program.", // More specific instruction
              },
              {
                role: "user",
                content: // MODIFIED: Updated user prompt context
                "Compare the following Python code snippets:\n\nUser Code:\n" + // Mention Python in prompt
                `${userCode}\n\nOriginal Code:\n${originalCode}`,
              },
            ],
            temperature: 1,
            max_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });

          const completion = response.choices[0].message.content;
          res.send(completion);
        } catch (error) {
          console.error("Error calling OpenAI API:", error);
          res.status(500).send(`Error: ${error.message}`);
        }
      });
    },
);