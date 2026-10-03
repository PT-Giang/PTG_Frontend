
import { useEffect, useRef, useState } from "react";
import styles from "./ReadAloud.module.css";

interface ReadAloudProps { text: string }
type PlaybackState = "idle" | "playing" | "paused";

export default function ReadAloud({ text }: ReadAloudProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [playback, setPlayback] = useState<PlaybackState>("idle");
  const [message, setMessage] = useState("");
  const playbackVersion = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const available = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSupported(available);
    if (!available) return;
    const synth = window.speechSynthesis;
    const refreshVoices = () => setVoices(synth.getVoices().filter(voice => voice.localService));
    refreshVoices();
    synth.addEventListener("voiceschanged", refreshVoices);
    return () => {
      playbackVersion.current += 1;
      synth.cancel();
      synth.removeEventListener("voiceschanged", refreshVoices);
    };
  }, []);

  function stop() {
    playbackVersion.current += 1;
    window.speechSynthesis.cancel();
    utterance.current = null;
    setPlayback("idle");
  }

  function start() {
    const voice = voices.find(item => item.voiceURI === voiceUri) || voices.find(item => item.lang.startsWith("vi")) || voices[0];
    if (!voice || !text.trim()) return;
    stop();
    const version = playbackVersion.current;
    const chunks: string[] = [];
    let remaining = text.replace(/^#{1,3}\s/gm, "").trim();
    while (remaining.length) {
      const limit = remaining.length > 600 ? Math.max(remaining.lastIndexOf(" ", 600), 1) : remaining.length;
      const end = limit === 1 ? Math.min(600, remaining.length) : limit;
      chunks.push(remaining.slice(0, end));
      remaining = remaining.slice(end).trimStart();
    }
    setPlayback("playing");
    setMessage("");
    function readChunk(index: number) {
      if (version !== playbackVersion.current) return;
      if (index >= chunks.length) { setPlayback("idle"); setMessage("Đã đọc xong tài liệu."); return; }
      const speech = new SpeechSynthesisUtterance(chunks[index]);
      utterance.current = speech;
      speech.voice = voice;
      speech.lang = voice.lang;
      speech.onend = () => readChunk(index + 1);
      speech.onerror = event => {
        if (version !== playbackVersion.current) return;
        setPlayback("idle");
        setMessage(`Không thể phát giọng đọc (${event.error}). Hãy thử lại hoặc chọn giọng khác.`);
      };
      window.speechSynthesis.speak(speech);
    }
    readChunk(0);
  }

  function togglePause() {
    if (playback === "playing") { window.speechSynthesis.pause(); setPlayback("paused"); }
    else { window.speechSynthesis.resume(); setPlayback("playing"); }
  }

  return <div className={styles.container}>
    <h1>Đọc tài liệu bằng giọng nói trên thiết bị</h1>
    <p>Phát nội dung hướng dẫn học tập bằng giọng đọc có sẵn trên thiết bị. Đây là chức năng đọc văn bản cục bộ, chưa phải podcast do AI tạo.</p>
    {supported === null ? <p role="status">Đang kiểm tra giọng đọc…</p> : !supported ? <p role="status">Trình duyệt này chưa hỗ trợ đọc văn bản bằng giọng nói.</p> : !voices.length ? <p role="status">Thiết bị chưa cung cấp giọng đọc cục bộ. Hãy bật hoặc cài giọng đọc trong cài đặt hệ điều hành rồi tải lại trang.</p> : <>
      <label htmlFor="local-voice">Giọng đọc trên thiết bị</label>
      <select id="local-voice" value={voiceUri || (voices.find(voice => voice.lang.startsWith("vi")) || voices[0]).voiceURI}
        onChange={event => setVoiceUri(event.target.value)} disabled={playback !== "idle"}>
        {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
      </select>
      <div className={styles.actions}>
        <button type="button" onClick={start} disabled={playback !== "idle" || !text.trim()}>Bắt đầu đọc</button>
        <button type="button" onClick={togglePause} disabled={playback === "idle"}>{playback === "paused" ? "Tiếp tục" : "Tạm dừng"}</button>
        <button type="button" onClick={stop} disabled={playback === "idle"}>Dừng</button>
      </div>
      <p role="status">{message || (playback === "playing" ? "Đang đọc tài liệu…" : playback === "paused" ? "Đã tạm dừng." : "Sẵn sàng đọc.")}</p>
    </>}
  </div>;
}
