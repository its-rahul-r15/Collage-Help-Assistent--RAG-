import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const History = [];

async function transformQuery(question) {
  History.push({
    role: 'user',
    parts: [{ text: question }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
Only output the rewritten question and nothing else.`
    },
  });

  History.pop();
  return response.text;
}

async function chatting(question) {
  const rewrittenQuery = await transformQuery(question);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });

  const queryVector = await embeddings.embedQuery(rewrittenQuery);

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  const searchResults = await pineconeIndex.query({
    topK: 10,
    vector: queryVector,
    includeMetadata: true,
  });

  const context = searchResults.matches
    .map(match => match.metadata.text)
    .join("\n\n---\n\n");

  History.push({
    role: 'user',
    parts: [{ text: rewrittenQuery }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
     systemInstruction: `You are a friendly and knowledgeable college admission assistant, like a real counselor helping students and parents.

You will be given official context from the college (e.g., courses, fees, hostel details, placements, admission process, syllabus). Your role is to answer the user's question using ONLY the provided context.

🎯 Guidelines:
- If the answer is not in the context, respond with: "I could not find the answer in the provided data."
- Give answers in a polite and professional tone.
- Structure your responses clearly using bullet points or numbering where appropriate.
- Avoid adding extra information not found in the context.
- Keep the answer simple, accurate, and easy to understand for both students and parents.



Context: ${context}`
    },
  });

  History.push({
    role: 'model',
    parts: [{ text: response.text }]
  });

  return response.text;
}

// =====================
// 🟢 Express Server Setup
// =====================
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://collage-help-assistent-rag.vercel.app', // ✅ your frontend URL
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// ⚙️ Serve static frontend from 'public' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 📡 POST endpoint for AI chat
app.post('/ask', async (req, res) => {
  const question = req.body.question;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const answer = await chatting(question);
    res.json({ answer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
