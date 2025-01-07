import React, { useState } from 'react';
import axios from 'axios';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleListen = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
    }

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Error occurred:', event.error);
      setIsListening(false);
    };
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/speech-to-text', { transcript });
      console.log('Backend response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleListen}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <textarea value={transcript} readOnly />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default SpeechToText;
