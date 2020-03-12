import React, { useEffect, useState, useRef } from 'react';
import { DateTime } from 'luxon';

import { getEpisodes } from './utils/api';

function Player(props) {
  const { episode } = props;
  const audioRef = useRef();

  const { audio } = episode;

  useEffect(() => {
    if (!audio) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.load();
    audioRef.current.play();
  }, [audio]);

  if (!audio) {
    return null;
  }

  return (
    <div className="flex items-center justify-center flex-col fixed bottom-0 h-48 w-screen bg-blue-600">
      <h2 className="max-w-sm truncate text-2xl text-gray-200">{episode.title_original}</h2>
      <p className="text-lg text-white">
        <strong>{episode.podcast_title_original}</strong>
      </p>
      <p className="max-w-sm truncate text-gray-300">{episode.description_original}</p>
      <audio controls autoPlay ref={audioRef} className="mt-4">
        <source src={audio}></source>
      </audio>
    </div>
  );
}

function Playlist(props) {
  const { onEpisodeSelect } = props;
  const [stateEpisodes, setStateEpisodes] = useState({
    status: 'idle',
    data: [],
  });

  useEffect(() => {
    getEpisodes().then(data => {
      setStateEpisodes({
        status: 'success',
        data: data.results,
      });
    });
  }, []);

  return (
    <section>
      <h2 className="text-lg ml-6 mt-2 text-gray-400">Top podcasts this week.</h2>
      <ul className="mt-1">
        {stateEpisodes.data.map(episode => (
          <li
            key={episode.id}
            className="flex items-center justify-evenly px-5 py-2 hover:bg-black"
            onClick={() => onEpisodeSelect(episode)}
          >
            <img src={episode.image} className="rounded-full w-12 h-12" />
            <div className="">
              <h3 className="max-w-xs truncate text-lg text-gray-200">{episode.title_original}</h3>
              <p className="max-w-xs truncate text-sm text-gray-400">{episode.description_original}</p>
              <div className="text-xs text-gray-400">
                <span>{DateTime.fromSeconds(episode.audio_length_sec).toFormat("H 'hrs and' mm 'mins'")}</span>
                <span className="pl-2">Published {DateTime.fromMillis(episode.pub_date_ms).toRelativeCalendar()}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const [stateCurrentEpisode, setStateCurrentEpisode] = useState({});
  return (
    <div className="bg-blue-900 min-h-screen relative">
      <h1 className="text-2xl py-3 text-center font-bold font-serif text-gray-300">Panster</h1>
      <Playlist onEpisodeSelect={setStateCurrentEpisode} />
      <Player episode={stateCurrentEpisode} />
    </div>
  );
}
