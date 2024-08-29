import { StationList, RouteList } from "./interfaces";

export const fetchSubwayApi = async (): Promise < string | void > => {
  return await fetch("/")
    .then(res => res.text())
    .catch(error => console.error(error));
}

export const fetchNearestStations = async (latitude: number, longitude: number): Promise < StationList | void > => {
  return await fetch(`/by-location?lat=${latitude}&lon=${longitude}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchRoute = async (route: string): Promise < StationList | void > => {
  return await fetch(`/by-route/${route}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchRoutes = async (): Promise < RouteList | void > => {
  return await fetch("/routes")
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchStations = async (ids: string[]): Promise < StationList | void > => {
  const idString = ids.join(",");
  return await fetch(`/by-id/${idString}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}
