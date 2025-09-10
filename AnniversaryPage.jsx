import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function AnniversaryPage() {
  const [dedication, setDedication] = useState("");
  const [videos, setVideos] = useState([]);
  const [musicFile, setMusicFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState(new Uint8Array(0));
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const STORAGE_KEY = "aniv_page_data_v4";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDedication(parsed.dedication || "");
        setVideos(parsed.videos || []);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const toSave = { dedication, videos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [dedication, videos]);

  useEffect(() => {
    if (musicFile && audioRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      function tick() {
        analyser.getByteFrequencyData(dataArray);
        setAudioData(new Uint8Array(dataArray));
        requestAnimationFrame(tick);
      }
      tick();

      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [musicFile]);

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const newVideos = files.map((file) => {
      const url = URL.createObjectURL(file);
      return { id: Math.random().toString(36).slice(2), url, name: file.name };
    });
    setVideos((s) => [...s, ...newVideos]);
    e.target.value = null;
  }

  function removeVideo(id) {
    setVideos((s) => s.filter((v) => v.id !== id));
  }

  function handleMusicUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMusicFile({ name: file.name, url });
    }
  }

  function toggleMusic() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-yellow-100 via-white to-yellow-100 p-6 overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-400 text-2xl pointer-events-none select-none"
          initial={{ opacity: 0, y: "100vh", x: Math.random() * window.innerWidth }}
          animate={{ opacity: [0, 1, 0], y: ["100vh", "-10vh"] }}
          transition={{ duration: 10 + Math.random() * 5, repeat: Infinity, delay: i * 1 }}
        >
          ❤️
        </motion.div>
      ))}

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <header className="flex items-center gap-4">
            <motion.div
              className="text-4xl"
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
            >
              🌻
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">Nuestra Historia 💛</h1>
              <p className="text-sm text-gray-600">Una página interactiva y romántica para celebrar 15 meses juntos.</p>
            </div>
          </header>

          <section className="mt-6">
            <label className="block text-sm font-medium">Tu dedicatoria</label>
            <textarea
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              placeholder="Escribe aquí lo que quieras decirle..."
              className="w-full border rounded-lg p-3 mt-2 min-h-[140px] resize-vertical bg-yellow-50 focus:ring-2 focus:ring-yellow-300"
            />
          </section>

          <section className="mt-6">
            <h3 className="font-semibold">🎶 Música de fondo</h3>
            <input
              type="file"
              accept="audio/*"
              onChange={handleMusicUpload}
              className="mt-2"
            />
            {musicFile && (
              <div className="mt-3 flex flex-col items-center gap-3">
                <audio id="bg-music" ref={audioRef} src={musicFile.url} loop />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMusic}
                  className="px-4 py-2 bg-yellow-400 rounded-lg shadow font-medium"
                >
                  {isPlaying ? "⏸️ Pausar" : "▶️ Reproducir"} - {musicFile.name}
                </motion.button>

                <div className="flex gap-1 h-20 items-end">
                  {audioData.length > 0 &&
                    audioData.slice(0, 20).map((value, idx) => (
                      <motion.div
                        key={idx}
                        className="w-2 bg-pink-400 rounded"
                        animate={{ height: [5, value] }}
                        transition={{ duration: 0.2 }}
                      />
                    ))}
                </div>
              </div>
            )}
          </section>

          <section className="mt-6">
            <h3 className="font-semibold">🎥 Nuestros videos</h3>
            <input onChange={handleFiles} accept="video/*" multiple className="mt-2" type="file" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {videos.length === 0 && <div className="text-gray-500">No hay videos aún.</div>}
              {videos.map((v) => (
                <motion.div
                  key={v.id}
                  className="border rounded-lg p-3 bg-gray-50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm truncate">{v.name}</p>
                    <button onClick={() => removeVideo(v.id)} className="text-red-600 text-sm">Eliminar</button>
                  </div>
                  <video src={v.url} controls className="mt-2 rounded-lg w-full" />
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-6 bg-yellow-100 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">💡 Actividades divertidas</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Escribir juntos una promesa y guardarla aquí ✍️</li>
              <li>Ver un video y contar qué recuerdas de ese momento 🎥</li>
              <li>Pausar la música y cantarla juntos 🎶</li>
              <li>Buscar tu foto favorita y pegarla en la dedicatoria 📸</li>
            </ul>
          </section>

          <footer className="mt-8 text-center text-gray-600 text-sm">
            <p>✨ Esta página siempre estará aquí para recordarnos lo especial que es nuestro amor ✨</p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}