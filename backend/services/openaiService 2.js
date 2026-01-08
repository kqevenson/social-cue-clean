import OpenAI from "openai";
import { ENV } from "../config/env.js";

export const openaiClient = new OpenAI({
  apiKey: ENV.OPENAI_KEY
});


