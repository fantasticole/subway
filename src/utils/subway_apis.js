const SUBWAY_API_URL = "http://127.0.0.1:5000";

export const fetchSubwayApi = async () => {
  return await fetch(SUBWAY_API_URL)
      .then(res => res.text())
      .catch(error => console.error(error));
}