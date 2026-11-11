import React, { useState, useRef, useEffect } from 'react';

// Shade themes for table gingham patterns, ribbons, and button accents
const SHADE_THEMES = [
  {
    id: 'blush',
    name: 'Strawberry Milk',
    deskBg: '#fff0f3',
    deskPattern: '#ffccd5',
    cover: '#ff85a1',
    accent: '#e04b73',
    ribbon: '#ff4d6d',
  },
  {
    id: 'peach',
    name: 'Warm Apricot',
    deskBg: '#fff7ed',
    deskPattern: '#fed7aa',
    cover: '#fb923c',
    accent: '#ea580c',
    ribbon: '#f97316',
  },
  {
    id: 'matcha',
    name: 'Sweet Matcha',
    deskBg: '#f2f9f3',
    deskPattern: '#d1ead3',
    cover: '#86efac',
    accent: '#16a34a',
    ribbon: '#22c55e',
  },
  {
    id: 'lavender',
    name: 'Lilac Cloud',
    deskBg: '#fbf7ff',
    deskPattern: '#eedcfc',
    cover: '#c084fc',
    accent: '#9333ea',
    ribbon: '#a855f7',
  },
  {
    id: 'choco',
    name: 'Choco Cherry',
    deskBg: '#fbf3f2',
    deskPattern: '#ebd2cf',
    cover: '#a85365',
    accent: '#83283c',
    ribbon: '#9f1239',
  },
];

const STICKER_CHARMS = [
  { emoji: '🎀', label: 'Tender' },
  { emoji: '🍓', label: 'Sweet' },
  { emoji: '✨', label: 'Aura' },
  { emoji: '🩹', label: 'Healing' },
  { emoji: '🧸', label: 'Comfort' },
  { emoji: '🌧️', label: 'Crying' },
  { emoji: '🕯️', label: 'Quiet' },
  { emoji: '🌸', label: 'Soft' },
];

export default function App() {
  const [activeTheme, setActiveTheme] = useState(SHADE_THEMES[0]);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryBody, setDiaryBody] = useState('');
  const [selectedCharm, setSelectedCharm] = useState(STICKER_CHARMS[0].emoji);
  const [entries, setEntries] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--desk-bg', activeTheme.deskBg);
    document.documentElement.style.setProperty('--desk-pattern', activeTheme.deskPattern);
    document.documentElement.style.setProperty('--cover-color', activeTheme.cover);
    document.documentElement.style.setProperty('--accent-color', activeTheme.accent);
  }, [activeTheme]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerIntervalRef.current = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } catch (error) {
      alert('Microphone permission is required to record voice notes.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleDiscardAudio = () => {
    setRecordedAudioUrl(null);
    setRecordSeconds(0);
  };

  const handleSaveEntry = () => {
    if (!diaryBody.trim() && !recordedAudioUrl) {
      alert('Please write something down or record an audio vent before preserving.');
      return;
    }

    const newEntry = {
      id: Date.now(),
      title: diaryTitle.trim() || 'Midnight Thoughts',
      body: diaryBody.trim(),
      charm: selectedCharm,
      audioUrl: recordedAudioUrl,
      audioDuration: recordSeconds > 0 ? `${recordSeconds}s` : null,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      }),
      themeCover: activeTheme.cover,
      ribbonColor: activeTheme.ribbon,
    };

    setEntries([newEntry, ...entries]);
    setDiaryTitle('');
    setDiaryBody('');
    setRecordedAudioUrl(null);
    setRecordSeconds(0);
  };

  const handleDeleteEntry = (entryId) => {
    setEntries(entries.filter((entry) => entry.id !== entryId));
  };

  return (
    <div
      className="min-h-screen py-10 px-4 flex flex-col items-center select-none"
      style={{
        backgroundColor: activeTheme.deskBg,
        backgroundImage: `
          linear-gradient(45deg, ${activeTheme.deskPattern} 25%, transparent 25%),
          linear-gradient(-45deg, ${activeTheme.deskPattern} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${activeTheme.deskPattern} 75%),
          linear-gradient(-45deg, transparent 75%, ${activeTheme.deskPattern} 75%)
        `,
        backgroundSize: '32px 32px',
        backgroundPosition: '0 0, 0 16px, 16px -16px, -16px 0px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Top Header & Tactile Palette Bar */}
      <header className="max-w-2xl w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-md p-4 px-6 rounded-full border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: '#3d2b27', fontFamily: "'Shrikhand', cursive, serif" }}
          >
            Petal
          </h1>
          <p className="text-[11px] text-[#8b6e68] tracking-wide">
            YOUR SAFE SPACE 
          </p>
        </div>

        {/* Dynamic Shade Selector */}
        <div className="flex items-center gap-2.5 bg-[#fbf3ef] px-3 py-1.5 rounded-full border border-black/5 shadow-inner">
          <span className="text-[10px] font-bold text-[#8b6e68] uppercase tracking-wider">
            Palette
          </span>
          <div className="flex items-center gap-2">
            {SHADE_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                title={theme.name}
                className={`w-6 h-6 rounded-full transition-all duration-150 border-2 relative ${
                  activeTheme.id === theme.id
                    ? 'scale-125 border-[#3d2b27] shadow-sm'
                    : 'border-white hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: theme.cover }}
              >
                <span className="absolute top-0.5 left-1 w-1.5 h-1 bg-white/70 rounded-full" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Physical Notebook */}
      <main className="max-w-2xl w-full bg-[#fffefb] rounded-[38px] border-[7px] border-white relative overflow-hidden flex flex-col p-6 sm:p-10 mb-10 shadow-[0_20px_45px_rgba(61,43,39,0.07)]">
        {/* Physical Ribbon Bookmark */}
        <div
          className="absolute -top-1 right-12 w-6 h-28 shadow-md rounded-b-md transition-colors duration-300"
          style={{ backgroundColor: activeTheme.ribbon }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/10" />
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-2 w-16 bg-[#eaddd7] rounded-full" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#d6c1b8]" />
          <div className="h-2 w-16 bg-[#eaddd7] rounded-full" />
        </div>

        {/* Header Strip with Date moved safely away from ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3e8e2] pb-4 mb-4 pr-16">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8b6e68] uppercase tracking-wider">
              Mood Charm:
            </span>
            <div className="flex gap-1.5 bg-[#faf4f0] p-1 rounded-full border border-black/5">
              {STICKER_CHARMS.map((charm) => (
                <button
                  key={charm.emoji}
                  onClick={() => setSelectedCharm(charm.emoji)}
                  title={charm.label}
                  className={`text-base p-1 rounded-full transition-transform ${
                    selectedCharm === charm.emoji
                      ? 'scale-125 bg-white shadow-sm'
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                >
                  {charm.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Date styled in high-contrast solid black-brown */}
          <span className="text-xs font-bold text-[#3d2b27] bg-[#fbf3ef] px-3 py-1 rounded-full border border-[#ebd8d0]">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <input
          type="text"
          placeholder="Give this entry a thought or title..."
          value={diaryTitle}
          onChange={(e) => setDiaryTitle(e.target.value)}
          className="w-full text-xl font-bold bg-transparent border-none outline-none text-[#3d2b27] placeholder-[#d7c4be] mb-3"
        />

        <textarea
          rows={6}
          placeholder="Vent it all out... crying spells, overthinking, silent thoughts, or private secrets. Completely safe, completely yours."
          value={diaryBody}
          onChange={(e) => setDiaryBody(e.target.value)}
          className="w-full bg-transparent resize-none outline-none text-2xl leading-relaxed text-[#4a3531] placeholder-[#cabbb6]"
          style={{
            fontFamily: "'Caveat', cursive, sans-serif",
            lineHeight: '2.1rem',
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 31.5px, #f5ece7 31.5px, #f5ece7 33px)',
            backgroundAttachment: 'local',
          }}
        />

        <div className="mt-6 pt-4 border-t border-[#f3e7e2] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fbf5f2] p-4 rounded-3xl border border-[#ede0d9]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="w-12 h-12 rounded-full bg-white text-red-500 border border-red-200 flex items-center justify-center text-xl shadow-sm hover:scale-105 active:scale-95 transition-transform"
                title="Record Audio Breakdown"
              >
                🎙️
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="w-12 h-12 rounded-full bg-red-500 text-white animate-pulse flex items-center justify-center text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-transform"
                title="Stop Recording"
              >
                ⏹️
              </button>
            )}

            <div>
              <div className="text-xs font-bold text-[#5c4038]">
                {isRecording
                  ? 'Listening to your breakdown...'
                  : recordedAudioUrl
                  ? 'Voice breakdown ready'
                  : 'Record Audio Vent'}
              </div>
              <div className="text-[11px] text-[#9c817a]">
                {isRecording
                  ? `${recordSeconds}s in progress`
                  : recordedAudioUrl
                  ? 'Attached to current note'
                  : 'Tap to speak when typing feels too heavy'}
              </div>
            </div>
          </div>

          {recordedAudioUrl && !isRecording && (
            <div className="flex items-center gap-2">
              <audio src={recordedAudioUrl} controls className="h-8 max-w-[190px]" />
              <button
                onClick={handleDiscardAudio}
                className="text-xs text-red-500 hover:text-red-700 underline px-1"
              >
                Discard
              </button>
            </div>
          )}

          <button
            onClick={handleSaveEntry}
            style={{ backgroundColor: activeTheme.accent }}
            className="w-full sm:w-auto px-7 py-3 rounded-full text-white font-bold text-xs tracking-wider uppercase shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:opacity-95 active:scale-95 transition-all"
          >
            Preserve in Vault 🌸
          </button>
        </div>
      </main>

      {/* Keepsake Vault Timeline */}
      <section className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xs font-extrabold tracking-widest text-[#7c635d] uppercase flex items-center gap-2">
            <span>Your Keepsake Box</span>
            <span className="text-[11px] bg-white/90 px-2.5 py-0.5 rounded-full border border-black/5 font-mono text-[#4a3531]">
              {entries.length}
            </span>
          </h2>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#e6d3cc] rounded-[28px] p-10 text-center flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">🕊️</span>
            <div className="text-sm font-semibold text-[#6d514a]">
              The vault is quiet and empty.
            </div>
            <div className="text-xs text-[#9c817a] max-w-sm">
              No eyes, no judgment. Record your first voice breakdown or write a scribble above to preserve it here.
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#fffefc] rounded-3xl p-6 border border-[#ece0d8] shadow-sm relative overflow-hidden transition-shadow hover:shadow-md"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-3"
                  style={{ backgroundColor: entry.themeCover }}
                />

                <div className="pl-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3d2b27] flex items-center gap-2 text-base">
                      <span className="text-lg">{entry.charm}</span>
                      <span>{entry.title}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-[#a8908a]">
                        {entry.timestamp}
                      </span>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-[#baa39c] hover:text-red-500 text-sm transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {entry.body && (
                    <p
                      className="text-2xl text-[#5c4038] leading-relaxed whitespace-pre-wrap"
                      style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                    >
                      {entry.body}
                    </p>
                  )}

                  {entry.audioUrl && (
                    <div className="pt-2 flex items-center gap-3 bg-[#fbf5f2] p-2.5 rounded-2xl border border-[#efe2dc] w-fit">
                      <span className="text-sm">🎙️</span>
                      <audio src={entry.audioUrl} controls className="h-7 w-56" />
                      {entry.audioDuration && (
                        <span className="text-[10px] font-mono text-[#8b6e68]">
                          {entry.audioDuration}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}