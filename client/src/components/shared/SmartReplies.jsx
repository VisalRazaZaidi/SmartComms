import React, { useState } from "react";
import axios from "axios";

const SmartReplies = ({ conversationHistory, onReplySelect }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSmartReplies = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/smart-reply", { conversationHistory });
      setReplies(response.data.replies);
    } catch (error) {
      console.error("Error fetching smart replies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-replies">
      <button onClick={fetchSmartReplies} disabled={loading}>
        {loading ? "Loading..." : "Get Smart Replies"}
      </button>
      <div className="reply-buttons">
        {replies.map((reply, index) => (
          <button key={index} onClick={() => onReplySelect(reply)}>
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartReplies;
