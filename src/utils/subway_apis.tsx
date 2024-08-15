const SUBWAY_API_URL = "http://127.0.0.1:5000";

export const fetchSubwayApi = async (): Promise<string|void> => {
  return await fetch(SUBWAY_API_URL)
      .then(res => res.text())
      .catch(error => console.error(error));
}

export const fetchNearestStations = async (latitude: number, longitude: number): Promise<string|void> => {
  return await fetch(`${SUBWAY_API_URL}/by-location?lat=${latitude}&lon=${longitude}`)
      .then(res => res.text())
      .catch(error => console.error(error));
}
