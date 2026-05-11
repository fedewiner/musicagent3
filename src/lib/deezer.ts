export interface DeezerArtist {
  id: number;
  name: string;
  picture: string;
  nb_fan: number;
  nb_album: number;
  link: string;
}

export interface PillarMappingResult {
  visibility: number;
  visibilityAnswer: 'none' | 'small' | 'growing';
  release: number;
  releaseAnswer: 'never' | 'over6weeks' | 'within6weeks';
}

const DEEZER_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?deezer\.com\/artist\/(\d+)/;

export function extractArtistIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(DEEZER_URL_REGEX);
  return match?.[1] ?? null;
}

export function validateDeezerUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return DEEZER_URL_REGEX.test(url.trim());
}

export function mapDeezerDataToPillars(artist: DeezerArtist): PillarMappingResult {
  const nbFan = artist.nb_fan ?? 0;
  const nbAlbum = artist.nb_album ?? 0;

  // Visibility: Map fan count to pillar score
  let visibility = 0;
  let visibilityAnswer: 'none' | 'small' | 'growing' = 'none';
  if (nbFan === 0) {
    visibility = 0;
    visibilityAnswer = 'none';
  } else if (nbFan < 1000) {
    visibility = 5;
    visibilityAnswer = 'small';
  } else {
    visibility = 10;
    visibilityAnswer = 'growing';
  }

  // Release: Map album count to pillar score
  let release = 0;
  let releaseAnswer: 'never' | 'over6weeks' | 'within6weeks' = 'never';
  if (nbAlbum === 0) {
    release = 0;
    releaseAnswer = 'never';
  } else if (nbAlbum < 3) {
    release = 5;
    releaseAnswer = 'over6weeks';
  } else {
    release = 10;
    releaseAnswer = 'within6weeks';
  }

  return {
    visibility,
    visibilityAnswer,
    release,
    releaseAnswer,
  };
}
