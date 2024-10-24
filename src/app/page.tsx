"use client";

import { MeteorDemo } from '@/components/MeteorDemo';
import Microphone from '@/components/Microphone'; // Adjust this path as needed
import { useState } from 'react';
import './page.css'; // Import the external CSS file

export default function HomePage() {
  const [transcription, setTranscription] = useState('');

  const handleTranscription = (text: string) => {
    setTranscription(text);
  };

  return (
    <div className="homepage-container">
      <MeteorDemo />  {/* This now covers the full background */}
      <main className="main-content">
        <section className="section text-center">
          <h2 className="heading">Start Recording Your Audio</h2>
          <Microphone handleTranscription={handleTranscription} />
        </section>
        <section className={`transcription-box ${transcription ? "visible" : "hidden"}`}>
          <h3 className="font-semibold text-lg">Transcription:</h3>
          <p className="transcription-text">{transcription || "Transcribed text will appear here..."}</p>
        </section>
        <div className="mt-6 text-center">
          <button className="save-button">
            Save Past Transcription
          </button>
        </div>
      </main>
      <footer>
        <p>Powered by Deepgram API</p>
      </footer>
    </div>
  );
}
