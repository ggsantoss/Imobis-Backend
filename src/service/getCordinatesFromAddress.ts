import { envConfig } from '../config/envConfig';

type Coordinates = {
  lat: number;
  lon: number;
};

export class GetCordinatesFromAddress {
  public static async getCoordinatesFromAddress(
    address: string,
  ): Promise<Coordinates | null> {
    const encoded = encodeURIComponent(address);

    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': `ImobisBackend/1.0 (${envConfig.EMAIL})`,
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`Address not found for: ${address}`);
      return null;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    console.log(address + ' ' + data);

    return { lat, lon };
  }
}
