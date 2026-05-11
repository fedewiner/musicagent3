import type { NextApiRequest, NextApiResponse } from 'next';
import { extractArtistIdFromUrl } from '@/lib/deezer';

interface DeezerResponse {
  id: number;
  name: string;
  picture: string;
  nb_fan: number;
  nb_album: number;
  link: string;
}

interface SuccessResponse {
  success: true;
  artist: DeezerResponse;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ResponseData = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { url, artistId } = req.body as { url?: string; artistId?: string };

  // Extract artist ID from URL or use provided ID
  let id = artistId;
  if (!id && url) {
    id = extractArtistIdFromUrl(url) || undefined;
  }

  if (!id) {
    return res.status(400).json({ success: false, error: 'Invalid URL or artist ID' });
  }

  try {
    const response = await fetch(`https://api.deezer.com/artist/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ success: false, error: 'Artist not found on Deezer' });
      }
      return res.status(response.status).json({ success: false, error: 'Failed to fetch from Deezer API' });
    }

    const artist = (await response.json()) as DeezerResponse;
    return res.status(200).json({ success: true, artist });
  } catch (error) {
    console.error('Deezer API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
