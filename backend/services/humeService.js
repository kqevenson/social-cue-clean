import { HumeClient } from "hume";
import { ENV } from "../config/env.js";

const hume = new HumeClient({
  apiKey: ENV.HUME_API_KEY
});

export async function analyzeEmotion(videoUrl) {
  const resp = await hume.emotions.predictUrl({
    url: videoUrl,
    models: { face: {}, prosody: {} }
  });
  return resp;
}

