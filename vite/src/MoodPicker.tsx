import React, { useState } from "react";
import "./MoodPicker.css";

const MoodPicker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [songUrl, setSongUrl] = useState("");

  const moodQueries: Record<string, string> = {
    happy: "Happy Music",
    upset: "Emotional Music",
    sad: "Depressed Music",
    flustered: "Chaotic Music",
    calm: "Relaxing Music",
    excited: "Upbeat Music",
  };

  const fetchSong = async (mood: string) => {
    if (!mood) return;

    const query = moodQueries[mood];
    const API_KEY = "apikey!!!!!!!!";

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
          query
        )}&type=video&videoEmbeddable=true&key=${API_KEY}`
      );
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        alert("No songs were found!");
        return;
      }

      const randomVideo=
        data.items[Math.floor(Math.random() * data.items.length)];
      const videoId = randomVideo.id.videoId; 

      setSongUrl(`https://www.youtube.com/embed/${videoId}`);
    } catch (err) {
      console.error(err);
      alert("Error fetching song. Check console for details.");
    }
  };


  return (
    <div className="MoodPicker">
      <h1 className="title">Welcome to Music Mood Picker</h1>
      <p className="description">Select your mood, and click on "Generate a song". This'll fetch a song from youtube accordingly to your set mood.</p>
      <label htmlFor="mood-select" className="label">
        Choose mood:
      </label>

      <select
        id="mood-select"
        className="select"
        value={selectedMood}
        onChange={(e) => setSelectedMood(e.target.value)}
      >
        <option value="">Select Mood</option>
        <option value="happy">Happy</option>
        <option value="upset">Upset</option>
        <option value="sad">Sad</option>
        <option value="flustered">Flustered</option>
        <option value="calm">Calm</option>
        <option value="excited">Excited</option>
      </select>

        <button
        onClick={() => fetchSong(selectedMood)}
        disabled={!selectedMood}
        className="pick-button"
      >Generate a song</button>

      {songUrl && (
        <iframe
          width="300"
          height="170"
          src={songUrl}
          title="Mood song"
          allow="autoplay; encrypted-media"
        />
      )}
    </div>
  );
};

export default MoodPicker;
