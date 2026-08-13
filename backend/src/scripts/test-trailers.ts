import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("TMDB_API_KEY is not defined in backend/.env!");
  process.exit(1);
}

interface TmdbVideoItem {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

const moviesToTest = [
  { title: "Inception", id: 27205 },
  { title: "Parasite", id: 496243 },
  { title: "Kantara", id: 960704 },
  { title: "RRR", id: 579974 },
  { title: "Spirited Away", id: 129 },
  { title: "The Dark Knight", id: 155 },
  { title: "Interstellar", id: 157336 },
  { title: "Amélie", id: 194 },
  { title: "Spider-Man: Into the Spider-Verse", id: 324857 },
  { title: "Minari", id: 641501 },
];

function getSortedTrailerKeys(videos: TmdbVideoItem[]): { key: string; type: string; official: boolean }[] {
  if (!videos || videos.length === 0) return [];

  const youtubeVideos = videos.filter((v) => v.site === 'YouTube' && v.key);
  if (youtubeVideos.length === 0) return [];

  const officialTrailers = youtubeVideos.filter((v) => v.type === 'Trailer' && v.official).map(v => ({ key: v.key, type: v.type, official: v.official }));
  const anyTrailers = youtubeVideos.filter((v) => v.type === 'Trailer' && !v.official).map(v => ({ key: v.key, type: v.type, official: v.official }));
  const officialTeasers = youtubeVideos.filter((v) => v.type === 'Teaser' && v.official).map(v => ({ key: v.key, type: v.type, official: v.official }));
  const anyTeasers = youtubeVideos.filter((v) => v.type === 'Teaser' && !v.official).map(v => ({ key: v.key, type: v.type, official: v.official }));
  const others = youtubeVideos.filter((v) => v.type !== 'Trailer' && v.type !== 'Teaser').map(v => ({ key: v.key, type: v.type, official: v.official }));

  const allCandidates = [
    ...officialTrailers,
    ...anyTrailers,
    ...officialTeasers,
    ...anyTeasers,
    ...others
  ];

  const seen = new Set<string>();
  const uniqueCandidates: { key: string; type: string; official: boolean }[] = [];
  for (const item of allCandidates) {
    if (!seen.has(item.key)) {
      seen.add(item.key);
      uniqueCandidates.push(item);
    }
  }

  return uniqueCandidates;
}

async function runTest() {
  console.log("=== Testing Trailer Key Prioritization & Fallback Candidates ===");
  console.log("| Title | ID | Candidate Keys Count | Top Key | Type | Official? | Playable Url |");
  console.log("|---|---|---|---|---|---|---|");

  for (const movie of moviesToTest) {
    try {
      const url = `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`;
      const res = await axios.get(url);
      const videos: TmdbVideoItem[] = res.data.results || [];
      const candidates = getSortedTrailerKeys(videos);

      if (candidates.length > 0) {
        const top = candidates[0];
        console.log(`| ${movie.title} | ${movie.id} | ${candidates.length} | ${top.key} | ${top.type} | ${top.official} | https://www.youtube.com/embed/${top.key} |`);
      } else {
        console.log(`| ${movie.title} | ${movie.id} | 0 | None | N/A | N/A | UNAVAILABLE |`);
      }
    } catch (err: any) {
      console.error(`Failed to fetch for ${movie.title}: ${err.message}`);
    }
  }
}

runTest();
