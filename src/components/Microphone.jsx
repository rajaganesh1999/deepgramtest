"use client"; // Add this line at the top

import React, { useState, useEffect } from 'react';
import './Microphone.css'; // Import the external CSS file

const Microphone = ({ handleTranscription }) => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState('');
    const [audioStream, setAudioStream] = useState(null);

    useEffect(() => {
        console.log('Microphone component mounted');

        return () => {
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
            console.log('Microphone component unmounted');
        };
    }, [audioStream]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);

            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm' // Set the correct audio format supported by MediaRecorder
            });

            recorder.ondataavailable = async (event) => {
                const audioBlob = event.data;
                await transcribeAudio(audioBlob); // Call transcription after data is available
            };

            recorder.onstop = () => {
                console.log('Recording stopped');
                setIsRecording(false);
            };

            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            setError('');
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError('Failed to access the microphone. Please check your permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                setAudioStream(null);
            }
        }
    };

    const transcribeAudio = async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm'); // Append the audio file with a proper name

        try {
            const response = await fetch(`https://api.deepgram.com/v1/listen?language=en&model=nova`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token YOUR_SECRET`, // Replace with your actual Deepgram API key
                },
                body: formData,
            });

            const data = await response.json();
            if (data && data.channel && data.channel.alternatives) {
                const transcription = data.channel.alternatives[0].transcript; // Get the transcription text
                handleTranscription(transcription);
            } else {
                console.error('Transcription alternatives not found:', data);
                setError('Transcription failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during transcription:', error);
            setError('Transcription failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center">
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="flex flex-col items-center">
                <button
                    className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                    onClick={startRecording}
                    disabled={isRecording}
                >
                    Start Recording
                </button>
                <button
                    className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 mt-4"
                    onClick={stopRecording}
                    disabled={!isRecording}
                >
                    Stop Recording
                </button>
            </div>
            <div className="mt-4 recording-status bg-white p-4 rounded-lg shadow-md flex items-center">
                {isRecording ? (
                    <>
                        <video
                            className="recording-icon"
                            src="https://cdn-icons-mp4.flaticon.com/512/13319/13319699.mp4"
                            autoPlay
                            loop
                            muted
                            width="30" // Adjust width as needed
                            height="30" // Adjust height as needed
                        />
                        <span className="ml-2">🟢 Recording...</span>
                    </>
                ) : (
                    <>
                        <video
                            className="recording-icon stopped-icon"
                            src="https://cdn-icons-mp4.flaticon.com/512/13319/13319754.mp4"
                            autoPlay
                            loop
                            muted
                            width="30" // Adjust width as needed
                            height="30" // Adjust height as needed
                        />
                        <span className="ml-2">🛑 Stopped</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default Microphone;
