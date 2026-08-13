export interface TmdbMovie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  original_language?: string;
  adult?: boolean;
  video?: boolean;
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
}

export interface TmdbTvShow {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
}

export interface TmdbPerson {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string;
  popularity: number;
  known_for?: (TmdbMovie | TmdbTvShow)[];
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string | null;
}

export interface TmdbCredits {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
}

export interface TmdbReview {
  id: string;
  author: string;
  content: string;
  created_at: string;
  url: string;
}

export interface TmdbWatchProviderInfo {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TmdbWatchProvidersResult {
  link?: string;
  flatrate?: TmdbWatchProviderInfo[];
  rent?: TmdbWatchProviderInfo[];
  buy?: TmdbWatchProviderInfo[];
}

export interface TmdbWatchProvidersResponse {
  id: number;
  results: Record<string, TmdbWatchProvidersResult>;
}

export interface TmdbCollection {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  parts?: TmdbMovie[];
}

export interface TmdbKeyword {
  id: number;
  name: string;
}

export interface TmdbCertification {
  certification: string;
  meaning: string;
  order: number;
}

export interface TmdbLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface TmdbCountry {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}
