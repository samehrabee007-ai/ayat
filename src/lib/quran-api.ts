// Fetch Quran ayah text + audio. Audio from everyayah.com (folder = reciter id).
export interface AyahData {
  number: number;
  numberInSurah: number;
  text: string;
  audioUrl: string;
}

function pad(n: number, width: number) {
  return n.toString().padStart(width, "0");
}

function buildAudioUrl(reciterFolder: string, surahId: number, ayahInSurah: number): string {
  // reciterFolder is the everyayah subfolder path (may include slashes for nested e.g. warsh/...)
  return `https://everyayah.com/data/${reciterFolder}/${pad(surahId, 3)}${pad(ayahInSurah, 3)}.mp3`;
}

const textCache = new Map<number, { numberInSurah: number; text: string }[]>();

async function fetchSurahText(surahId: number) {
  let all = textCache.get(surahId);
  if (all) return all;
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`);
  if (!res.ok) throw new Error("فشل جلب نص السورة");
  const json = await res.json();
  all = (json.data.ayahs as any[]).map((a) => ({
    numberInSurah: a.numberInSurah,
    text: a.text,
  }));
  textCache.set(surahId, all);
  return all;
}

export async function fetchAyahs(
  surahId: number,
  ayahStart: number,
  ayahEnd: number,
  reciterFolder: string
): Promise<AyahData[]> {
  const text = await fetchSurahText(surahId);
  return text
    .filter((a) => a.numberInSurah >= ayahStart && a.numberInSurah <= ayahEnd)
    .map((a) => ({
      number: a.numberInSurah,
      numberInSurah: a.numberInSurah,
      text: a.text,
      audioUrl: buildAudioUrl(reciterFolder, surahId, a.numberInSurah),
    }));
}

export async function fetchAndDecodeAudio(
  ayahs: AyahData[],
  audioCtx: AudioContext
): Promise<{ buffer: AudioBuffer; segments: { start: number; end: number; text: string; numberInSurah: number }[] }> {
  const buffers = await Promise.all(
    ayahs.map(async (a) => {
      const res = await fetch(a.audioUrl, { mode: "cors" });
      if (!res.ok) throw new Error(`فشل تنزيل صوت آية ${a.numberInSurah} (HTTP ${res.status})`);
      const arr = await res.arrayBuffer();
      try {
        return await new Promise<AudioBuffer>((resolve, reject) => {
          audioCtx.decodeAudioData(arr.slice(0), resolve, reject);
        });
      } catch {
        throw new Error(`فشل فك ترميز صوت آية ${a.numberInSurah}`);
      }
    })
  );

  const sampleRate = buffers[0].sampleRate;
  const channels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const totalLength = buffers.reduce((s, b) => s + b.length, 0);
  const out = audioCtx.createBuffer(channels, totalLength, sampleRate);

  const segments: { start: number; end: number; text: string; numberInSurah: number }[] = [];
  let offset = 0;
  buffers.forEach((b, i) => {
    for (let ch = 0; ch < channels; ch++) {
      const src = b.getChannelData(Math.min(ch, b.numberOfChannels - 1));
      out.getChannelData(ch).set(src, offset);
    }
    const startSec = offset / sampleRate;
    offset += b.length;
    const endSec = offset / sampleRate;
    segments.push({
      start: startSec,
      end: endSec,
      text: ayahs[i].text,
      numberInSurah: ayahs[i].numberInSurah,
    });
  });

  return { buffer: out, segments };
}
