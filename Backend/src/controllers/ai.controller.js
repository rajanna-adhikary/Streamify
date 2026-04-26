import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const generateMetadata = asyncHandler(async (req, res) => {
    const { input } = req.body;

    if (!input) {
        throw new ApiError(400, "Input is required");
    }

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama2", // or mistral if installed
                prompt: `
Generate:
1. A catchy YouTube title
2. A detailed description

Topic: ${input}

Respond in JSON:
{
  "title": "...",
  "description": "..."
}
                `,
                stream: false
            })
        });

        const data = await response.json();

        // Ollama returns text → parse JSON
        let parsed;
        try {
            parsed = JSON.parse(data.response);
        } catch (err) {
            throw new ApiError(500, "AI response parsing failed");
        }

        return res.status(200).json(
            new ApiResponse(200, parsed, "AI metadata generated")
        );

    } catch (error) {
        throw new ApiError(500, "Error communicating with AI");
    }
});

export { generateMetadata };


/* 🚀 **AI Metadata Feature + Auth Flow (Interview Notes)**

When a user opens the video upload page, they are given an option to generate a title and description using AI. The user enters a basic idea (like “node backend jwt”) and clicks the “Generate with AI” button. This triggers a frontend API call to my backend endpoint (`/api/v1/ai/generate-metadata`). The frontend never directly communicates with the AI service.

The backend (Express server running on port 8000) receives this request and first passes it through authentication middleware (`verifyJWT`). This ensures that only logged-in and verified users can access the API, preventing unauthorized usage or abuse. If the token is invalid or missing, the request is rejected.

Once verified, the controller extracts the input and makes a server-to-server call (using `fetch`) to the locally running Ollama AI server on port 11434. Ollama processes the prompt and returns a generated response (title and description). The backend then parses and formats this response into a clean JSON structure using a standardized API response format.

Finally, the backend sends this data back to the frontend, where the UI automatically fills the title and description fields. The user can optionally edit them and proceed with uploading the video.

This design follows a clean architecture where:

* Frontend handles UI only
* Backend manages logic, validation, and security
* AI service (Ollama) acts as a separate processing layer

Using `verifyJWT` is crucial because it ensures that only authenticated users can hit protected routes. Without it, anyone could spam the API, misuse the AI feature, or perform unauthorized actions, which would be a major security issue in a real-world application.

*/ 