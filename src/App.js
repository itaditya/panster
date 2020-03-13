import React, { useEffect, useState, useRef, Fragment } from 'react';
import { DateTime } from 'luxon';

import { getEpisodes } from './utils/api';

function Audio(props) {
  const { src, ...restProps } = props;
  const audioRef = useRef();

  useEffect(() => {
    if (!src) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.load();
    audioRef.current.play();
  }, [src]);

  if (!src) {
    return null;
  }

  return (
    <audio controls autoPlay ref={audioRef} {...restProps}>
      <source src={src}></source>
    </audio>
  );
}

function Player(props) {
  const { size, episode } = props;

  if (size === 'small') {
    if(!episode) {
      return null;
    }

    return (
      <section className="flex items-center justify-center flex-col fixed bottom-0 h-48 w-screen bg-blue-600 border-t-gray-300 border-t-2">
        <h2 className="max-w-sm truncate text-xl text-white">{episode.title_original}</h2>
        <p className="text-md text-gray-200">
          <strong>{episode.podcast_title_original}</strong>
        </p>
        <p className="max-w-sm truncate text-gray-300">{episode.description_original}</p>
        <Audio src={episode.audio} className="mt-4" key="audio-player" />
      </section>
    );
  }

  return (
    <section className="order-first absolute top-0 h-screen flex flex-col items-center justify-center w-5/12 px-4 relative">
      {episode && (
        <Fragment>
          <img src={episode.image} className="rounded-md w-64 h-64 shadow-2xl" />
          <h2 className="max-w-sm mt-4 text-3xl text-center text-white leading-tight">{episode.title_original}</h2>
          <p className="text-lg text-white mt-3">
            <strong>{episode.podcast_title_original}</strong>
          </p>
          <p className="max-w-sm text-center text-gray-300">{episode.description_original.substring(0, 140) + '...'}</p>
          <Audio src={episode.audio} className="mt-5" key="audio-player" />
        </Fragment>
      )}
    </section>
  );
}

function Playlist(props) {
  const { viewportSize, onEpisodeSelect } = props;
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
    <section className="flex-1">
      <h2 className="text-lg ml-6 mt-2 text-gray-400">Top podcasts this week.</h2>
      <ul className="mt-1">
        {stateEpisodes.data.map(episode => (
          <li
            key={episode.id}
            className="flex items-center justify-start px-5 md:px-8 py-2 md:py-4 hover:bg-overlay-300 md:rounded-lg transition-colors duration-100 ease-in"
            onClick={() => onEpisodeSelect(episode)}
          >
            <img src={episode.image} className="rounded-full w-12 h-12 md:w-20 md:h-20 border-gray-400 border-2 shadow-lg" />
            <div className="ml-4">
              <h3 className="max-w-sm md:max-w-lg xl:max-w-2xl truncate text-lg md:text-xl text-gray-200">{episode.title_original}</h3>
              {
                viewportSize !== 'xs' && (
                  <p className="max-w-sm md:max-w-lg xl:max-w-2xl truncate text-sm text-gray-400">{episode.description_original}</p>
                )
              }
              <div className="text-xs text-gray-400">
                <span>{DateTime.fromSeconds(episode.audio_length_sec).toFormat("H 'hrs and' mm 'mins'")}</span>
                <span className="pl-2">Published {DateTime.fromMillis(episode.pub_date_ms).toRelativeCalendar()}</span>
              </div>
            </div>
          </li>
        ))}
        {
          viewportSize === 'xs' && (
            <li className="h-56">
              {/* This item is there to add extra space at bottom so that the fixed media player on mobile doesn't hide the end items in playlist */}
            </li>
          )
        }
      </ul>
    </section>
  );
}

export default function App() {
  const [stateCurrentEpisode, setStateCurrentEpisode] = useState();
  const [stateViewportSize, setStateViewportSize] = useState('xs');
  useEffect(() => {
    var observer = new ResizeObserver(function(entries) {
      const entry = entries[0];

      // sm width from tailwind
      if (entry.contentRect.width >= 640) {
        setStateViewportSize('sm');
        return;
      }
      setStateViewportSize('xs');
    });
    observer.observe(document.body);
    return () => observer.unobserve(document.body);
  }, []);
  return (
    <div className="bg-blue-900 min-h-screen relative">
      <h1 className="text-2xl py-3 pl-8 text-center md:text-left font-bold font-serif text-gray-300 bg-overlay-300">Panster</h1>
      <div className="flex">
        <Playlist viewportSize={stateViewportSize} onEpisodeSelect={setStateCurrentEpisode} />
        <Player size={stateViewportSize === 'xs' ? 'small' : 'big'} episode={stateCurrentEpisode} />
      </div>
    </div>
  );
}
