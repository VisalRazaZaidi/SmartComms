import axios from "axios";

const GEMINI_API_URL = "https://api.gemini.ai/nlp/smart-reply";
const GEMINI_API_KEY = "AIzaSyBWOqhQjyNzwKFpUbaIpuT2lD-05lo8g0g"; // Replace with your API key

export const generateSmartReplies = async (message) => {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        text: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEMINI_API_KEY}`,
        },
      }
    );

    // Assuming the API returns a list of suggested replies
    const { replies } = response.data;
    return replies; // Return smart replies as an array
  } catch (error) {
    console.error("Error generating smart replies:", error.message);
    return []; // Return an empty array in case of an error
  }
};
