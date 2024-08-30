import { StationList, RouteList } from "./interfaces";

export const fetchNearestStations = async (latitude: number, longitude: number): Promise < StationList | void > => {
  return await fetch(`by-location?lat=${latitude}&lon=${longitude}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchRoute = async (route: string): Promise < StationList | void > => {
  return await fetch(`route/${route}`)
    .then(res => res.json())
    .then(({ data, updated }) => {
      return { data: JSON.parse(data), updated: new Date(updated) };
    })
    .catch(error => console.error(error));
}

export const fetchStations = async (ids: string[]): Promise < StationList | void > => {
  const idString = ids.join(",");
  return await fetch(`by-id/${idString}`)
    .then(res => res.text())
    .then(text => (JSON.parse(text)))
    .catch(error => console.error(error));
}

export const fetchArrivals = async (): Promise < StationList | void > => {
  return await fetch('arrivals')
    .then(res => res.json())
    .catch(error => console.error(error));
}
