// backend/routes/tavus.js
// Tavus Conversational Video Interface API endpoints
// Docs: https://docs.tavus.io

import express from "express";
import { ENV } from "../config/env.js";

const router = express.Router();
const TAVUS_API_BASE = "https://tavusapi.com/v2";

/**
 * Create a new conversation session
 * POST /api/tavus/conversations
 * Body: { replicaId, personaId, conversationName, customGreeting }
 */
router.post("/conversations", async (req, res) => {
  const { replicaId, personaId, conversationName, customGreeting } = req.body;

  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  if (!replicaId && !personaId) {
    return res.status(400).json({
      success: false,
      error: "Either replicaId or personaId is required"
    });
  }

  try {
    console.log("🎭 Creating Tavus conversation...");
    console.log("   Replica ID:", replicaId || "(from persona)");
    console.log("   Persona ID:", personaId || "(none)");

    const payload = {
      properties: {
        // Enable greenscreen for transparent background
        apply_greenscreen: true
      }
    };
    if (replicaId) payload.replica_id = replicaId;
    if (personaId) payload.persona_id = personaId;
    if (conversationName) payload.conversation_name = conversationName;
    if (customGreeting) payload.custom_greeting = customGreeting;

    console.log("   Full payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ENV.TAVUS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus conversation error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to create conversation: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Tavus conversation created:", data.conversation_id);

    return res.json({
      success: true,
      conversationId: data.conversation_id,
      conversationUrl: data.conversation_url,
      conversationName: data.conversation_name,
      status: data.status,
      createdAt: data.created_at
    });

  } catch (err) {
    console.error("❌ Tavus conversation error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * End a conversation
 * DELETE /api/tavus/conversations/:conversationId
 */
router.delete("/conversations/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  try {
    console.log("🛑 Ending Tavus conversation:", conversationId);

    const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}`, {
      method: "DELETE",
      headers: {
        "x-api-key": ENV.TAVUS_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus end conversation error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to end conversation: ${errorText}`
      });
    }

    console.log("✅ Tavus conversation ended");
    return res.json({ success: true });

  } catch (err) {
    console.error("❌ Tavus end conversation error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Get available replicas (avatars)
 * GET /api/tavus/replicas
 */
router.get("/replicas", async (req, res) => {
  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  try {
    console.log("🎭 Getting Tavus replicas...");

    const response = await fetch(`${TAVUS_API_BASE}/replicas`, {
      method: "GET",
      headers: {
        "x-api-key": ENV.TAVUS_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus replicas error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to get replicas: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Got", data.data?.length || 0, "Tavus replicas");

    return res.json({
      success: true,
      replicas: data.data || []
    });

  } catch (err) {
    console.error("❌ Tavus replicas error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Get available personas
 * GET /api/tavus/personas
 */
router.get("/personas", async (req, res) => {
  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  try {
    console.log("🎭 Getting Tavus personas...");

    const response = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: "GET",
      headers: {
        "x-api-key": ENV.TAVUS_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus personas error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to get personas: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Got", data.data?.length || 0, "Tavus personas");

    return res.json({
      success: true,
      personas: data.data || []
    });

  } catch (err) {
    console.error("❌ Tavus personas error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Create an Echo-mode persona
 * POST /api/tavus/personas/echo
 * Body: { personaName, replicaId }
 */
router.post("/personas/echo", async (req, res) => {
  const { personaName, replicaId } = req.body;

  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  if (!replicaId) {
    return res.status(400).json({
      success: false,
      error: "replicaId is required"
    });
  }

  try {
    console.log("🎭 Creating Echo-mode Tavus persona...");

    const payload = {
      persona_name: personaName || "Echo Coach",
      pipeline_mode: "echo",
      default_replica_id: replicaId
    };

    const response = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ENV.TAVUS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus create persona error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to create persona: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Tavus Echo persona created:", data.persona_id);

    return res.json({
      success: true,
      personaId: data.persona_id,
      personaName: data.persona_name,
      pipelineMode: data.pipeline_mode
    });

  } catch (err) {
    console.error("❌ Tavus create persona error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Create an Echo-mode persona WITH Perception enabled
 * POST /api/tavus/personas/echo-with-perception
 * Body: { personaName, replicaId }
 * Creates a persona that:
 * - Uses Echo mode (we control what it says)
 * - Has Perception enabled with emotion detection
 */
router.post("/personas/echo-with-perception", async (req, res) => {
  const { personaName, replicaId } = req.body;

  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  if (!replicaId) {
    return res.status(400).json({
      success: false,
      error: "replicaId is required"
    });
  }

  try {
    console.log("🎭 Creating Echo-mode Tavus persona WITH Perception...");

    const payload = {
      persona_name: personaName || "Coach Cue - Social Practice Partner",
      pipeline_mode: "echo",
      default_replica_id: replicaId,
      // Perception layer configuration
      layers: {
        perception: {
          perception_model: "raven-0",
          ambient_awareness_queries: [
            "What emotion is the user showing?",
            "Does the user look nervous or anxious?",
            "Does the user look confused?",
            "Does the user look happy or engaged?",
            "Does the user look shy or embarrassed?"
          ],
          perception_tool_prompt: "Observe the learner and detect their emotional state. When you notice emotions like nervous, happy, confused, frustrated, engaged, shy, excited, or calm, call the emotion_detected function.",
          perception_tools: [
            {
              type: "function",
              function: {
                name: "emotion_detected",
                description: "Report when a user emotion is detected",
                parameters: {
                  type: "object",
                  properties: {
                    emotion: {
                      type: "string",
                      description: "The detected emotion"
                    },
                    confidence: {
                      type: "string",
                      enum: ["low", "medium", "high"],
                      description: "Confidence level"
                    }
                  },
                  required: ["emotion"]
                }
              }
            }
          ]
        }
      }
    };

    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ENV.TAVUS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus create persona error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to create persona: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Tavus Echo+Perception persona created:", data.persona_id);

    return res.json({
      success: true,
      personaId: data.persona_id,
      personaName: data.persona_name,
      pipelineMode: data.pipeline_mode,
      message: "Persona created with Echo mode and Perception enabled. Update tavusService.js with this persona ID."
    });

  } catch (err) {
    console.error("❌ Tavus create persona error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Get conversation details with perception analysis
 * GET /api/tavus/conversations/:conversationId
 * Returns conversation data including transcript and perception analysis
 */
router.get("/conversations/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  try {
    console.log("📊 Getting Tavus conversation details:", conversationId);

    // Use verbose=true to get transcript and perception analysis
    const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}?verbose=true`, {
      method: "GET",
      headers: {
        "x-api-key": ENV.TAVUS_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus get conversation error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to get conversation: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Got Tavus conversation details");

    // Extract perception analysis from events if available
    let perceptionAnalysis = null;
    let transcript = [];
    let emotionalStates = [];

    if (data.events) {
      // Find perception analysis event
      const perceptionEvent = data.events.find(
        e => e.event_type === "application.perception_analysis"
      );
      if (perceptionEvent?.properties) {
        perceptionAnalysis = perceptionEvent.properties;
      }

      // Extract transcript events
      transcript = data.events
        .filter(e => e.event_type?.includes("transcript") || e.event_type?.includes("utterance"))
        .map(e => ({
          role: e.event_type?.includes("user") ? "user" : "assistant",
          text: e.properties?.text || e.properties?.transcript || "",
          timestamp: e.timestamp
        }))
        .filter(t => t.text);

      // Extract emotional state events if any
      emotionalStates = data.events
        .filter(e => e.event_type?.includes("emotion") || e.properties?.emotion)
        .map(e => ({
          emotion: e.properties?.emotion,
          confidence: e.properties?.confidence,
          timestamp: e.timestamp
        }));
    }

    return res.json({
      success: true,
      conversationId: data.conversation_id,
      status: data.status,
      replicaId: data.replica_id,
      personaId: data.persona_id,
      createdAt: data.created_at,
      endedAt: data.ended_at,
      shutdownReason: data.shutdown_reason,
      perceptionAnalysis,
      transcript,
      emotionalStates,
      // Include raw data for debugging
      raw: data
    });

  } catch (err) {
    console.error("❌ Tavus get conversation error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Update persona with perception settings
 * PATCH /api/tavus/personas/:personaId/perception
 * Configures emotion detection and ambient awareness
 */
router.patch("/personas/:personaId/perception", async (req, res) => {
  const { personaId } = req.params;

  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  try {
    console.log("🎭 Updating Tavus persona with perception:", personaId);

    // Perception configuration for emotion detection
    const patchOperations = [
      // Enable Raven perception model
      {
        op: "replace",
        path: "/layers/perception/perception_model",
        value: "raven-0"
      },
      // Ambient awareness queries - run continuously during call
      {
        op: "replace",
        path: "/layers/perception/ambient_awareness_queries",
        value: [
          "Does the user look nervous or anxious?",
          "Does the user look confused or uncertain?",
          "Does the user look happy or engaged?",
          "Does the user look tired or bored?",
          "Does the user look shy or embarrassed?",
          "Does the user look frustrated or upset?"
        ]
      },
      // End-of-call perception analysis queries
      {
        op: "replace",
        path: "/layers/perception/perception_analysis_queries",
        value: [
          "What was the user's overall emotional state throughout the conversation?",
          "Did the user appear more confident by the end compared to the beginning?",
          "On a scale of 1-100, how engaged was the user looking at the screen?",
          "Did the user show any signs of nervousness or anxiety?",
          "What emotions did you observe from the user's facial expressions?"
        ]
      },
      // Tool prompt for emotion detection events
      {
        op: "replace",
        path: "/layers/perception/perception_tool_prompt",
        value: "You MUST use the emotion_detected tool whenever you observe a clear emotional state in the user. Call it when you notice nervousness, shyness, confusion, happiness, frustration, tiredness, or any other notable emotion."
      },
      // Perception tools - these emit events we can receive
      {
        op: "replace",
        path: "/layers/perception/perception_tools",
        value: [
          {
            type: "function",
            function: {
              name: "emotion_detected",
              description: "Report when a user emotion is detected from their facial expression or demeanor",
              parameters: {
                type: "object",
                properties: {
                  emotion: {
                    type: "string",
                    description: "The detected emotion (e.g., nervous, shy, happy, confused, tired, frustrated, engaged)"
                  },
                  confidence: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Confidence level of the emotion detection"
                  },
                  observation: {
                    type: "string",
                    description: "Brief description of what was observed"
                  }
                },
                required: ["emotion", "confidence"]
              }
            }
          }
        ]
      }
    ];

    const response = await fetch(`${TAVUS_API_BASE}/personas/${personaId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ENV.TAVUS_API_KEY
      },
      body: JSON.stringify(patchOperations)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus update persona error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to update persona: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Tavus persona updated with perception settings");

    return res.json({
      success: true,
      personaId,
      message: "Perception settings configured"
    });

  } catch (err) {
    console.error("❌ Tavus update persona error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Health check for Tavus service
 * GET /api/tavus/health
 */
router.get("/health", async (req, res) => {
  const hasApiKey = !!ENV.TAVUS_API_KEY;

  return res.json({
    success: true,
    available: hasApiKey,
    message: hasApiKey ? "Tavus service configured" : "Tavus API key not configured"
  });
});

/**
 * List all conversations
 * GET /api/tavus/conversations
 */
router.get("/conversations", async (req, res) => {
  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  try {
    console.log("📋 Listing Tavus conversations...");

    const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
      method: "GET",
      headers: {
        "x-api-key": ENV.TAVUS_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavus list conversations error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Failed to list conversations: ${errorText}`
      });
    }

    const data = await response.json();
    console.log("✅ Got", data.data?.length || 0, "Tavus conversations");

    return res.json({
      success: true,
      conversations: data.data || []
    });

  } catch (err) {
    console.error("❌ Tavus list conversations error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * End all active conversations
 * POST /api/tavus/conversations/end-all
 */
router.post("/conversations/end-all", async (req, res) => {
  if (!ENV.TAVUS_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Tavus API key not configured"
    });
  }

  try {
    console.log("🛑 Ending all Tavus conversations...");

    // First, list all conversations
    const listResponse = await fetch(`${TAVUS_API_BASE}/conversations`, {
      method: "GET",
      headers: {
        "x-api-key": ENV.TAVUS_API_KEY
      }
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      return res.status(listResponse.status).json({
        success: false,
        error: `Failed to list conversations: ${errorText}`
      });
    }

    const listData = await listResponse.json();
    const conversations = listData.data || [];

    // Filter for active conversations (status === "active" or similar)
    const activeConversations = conversations.filter(c =>
      c.status === "active" || c.status === "in_progress" || !c.ended_at
    );

    console.log(`📋 Found ${activeConversations.length} active conversations to end`);

    // End each active conversation
    const results = [];
    for (const conv of activeConversations) {
      try {
        const endResponse = await fetch(`${TAVUS_API_BASE}/conversations/${conv.conversation_id}`, {
          method: "DELETE",
          headers: {
            "x-api-key": ENV.TAVUS_API_KEY
          }
        });

        if (endResponse.ok) {
          console.log(`✅ Ended conversation: ${conv.conversation_id}`);
          results.push({ id: conv.conversation_id, success: true });
        } else {
          const errorText = await endResponse.text();
          console.error(`❌ Failed to end ${conv.conversation_id}: ${errorText}`);
          results.push({ id: conv.conversation_id, success: false, error: errorText });
        }
      } catch (err) {
        console.error(`❌ Error ending ${conv.conversation_id}: ${err.message}`);
        results.push({ id: conv.conversation_id, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Ended ${successCount}/${activeConversations.length} conversations`);

    return res.json({
      success: true,
      ended: successCount,
      total: activeConversations.length,
      results
    });

  } catch (err) {
    console.error("❌ Tavus end all conversations error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
