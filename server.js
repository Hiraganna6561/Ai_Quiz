require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
const PORT = 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));

app.post("/api/generate-quiz", async (req, res) => {

    try {
        const {
            topic,
            difficulty,
            numberOfQuestions
        } = req.body;

        if (!topic) {
            return res.status(400).json({
                error: "Please enter a topic."
            });
        }

        const prompt = `
Create a quiz about "${topic}".

Difficulty: ${difficulty}
Number of questions: ${numberOfQuestions}

Create multiple-choice questions.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0,
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- answer must be the index of the correct option.
- Index 0 = first option.
- Index 1 = second option.
- Index 2 = third option.
- Index 3 = fourth option.
- Do not add Markdown.
- Do not add text outside the JSON.
`;

        const response = await client.responses.create({
            model: "gpt-6-luna",
            input: prompt
        });

        const text = response.output_text;

        const quiz = JSON.parse(text);

        res.json(quiz);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to generate quiz."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Quiz Generator running at http://localhost:${PORT}`);
});