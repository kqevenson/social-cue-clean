// Maps topics to scene types the video generator will use.
// "classroom" = OpenAI Video
// "realworld" = Runway Gen-4 Turbo

const TOPIC_SCENE_MAP = {
  // Initiating Connections
  "start-a-conversation": "classroom",

  // Managing Emotions
  "handle-rejection": "realworld",

  // You will expand this as your curriculum grows.
};

export function mapTopicToSceneType(topicId) {
  return (
    TOPIC_SCENE_MAP[topicId] ||
    "classroom" // default if unknown
  );
}



