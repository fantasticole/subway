import { StationList, RouteList } from "./interfaces";

const SUBWAY_API_URL = "http://127.0.0.1:5000";

export const fetchSubwayApi = async (): Promise < string | void > => {
  return await fetch(SUBWAY_API_URL)
    .then(res => res.text())
    .catch(error => console.error(error));
}

export const fetchNearestStations = async (latitude: number, longitude: number): Promise < StationList | void > => {
  return await fetch(`${SUBWAY_API_URL}/by-location?lat=${latitude}&lon=${longitude}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchRoute = async (route: string): Promise < StationList | void > => {
  return await fetch(`${SUBWAY_API_URL}/by-route/${route}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchRoutes = async (): Promise < RouteList | void > => {
  return await fetch(`${SUBWAY_API_URL}/routes`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchStations = async (ids: string[]): Promise < StationList | void > => {
  const idString = ids.join(",");
  return await fetch(`${SUBWAY_API_URL}/by-id/${idString}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}
