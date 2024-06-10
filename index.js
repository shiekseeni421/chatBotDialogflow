const express = require("express");
const cors = require("cors");
const { SessionsClient } = require("@google-cloud/dialogflow");
const path = require("path");

const app = express();
const port = 8086;

// Enable CORS for all requests
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper function to create a session client
function createSessionClient(keyFilename) {
  return new SessionsClient({ keyFilename });
}

app.post("/api/echarken", async (req, res) => {
  const sessionClient = createSessionClient(
    "/home/indg/Desktop/ChatBot/echarakboten-fqkl-d45f1902256d.json"
  );

  async function detectIntent(projectId, sessionId, query, languageCode) {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    try {
      const responses = await sessionClient.detectIntent(request);
      return responses[0].queryResult;
    } catch (error) {
      console.error(`Error detecting intent for project ${projectId}:`, error);
      throw error;
    }
  }

  try {
    const { query, sessionId } = req.body;
    const projectId = "echarakboten-fqkl";
    const result = await detectIntent(projectId, sessionId, query, "en-US");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/echarkhi", async (req, res) => {
  const sessionClient = createSessionClient(
    "/home/indg/Desktop/ChatBot/echarkbothilan-nr9x-f987ae79045d.json"
  );

  async function detectIntent(projectId, sessionId, query, languageCode) {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    try {
      const responses = await sessionClient.detectIntent(request);
      return responses[0].queryResult;
    } catch (error) {
      console.error(`Error detecting intent for project ${projectId}:`, error);
      throw error;
    }
  }

  try {
    const { query, sessionId } = req.body;
    const projectId = "echarkbothilan-nr9x";
    const result = await detectIntent(projectId, sessionId, query, "hi-IN");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
