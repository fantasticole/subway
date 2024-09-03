import { StationList, RouteList, Route, AllStationsResponse, ArrivalList, Train } from "./interfaces";

async function callAPI(url: string): Promise < any > {
  return await fetch(url)
    .then(res => res.json())
    .then((response) => ({
      ...response,
      updated: new Date(response.updated)
    }))
    .catch(error => console.error(error));
}

export const fetchNearestStations = async (latitude: number, longitude: number): Promise < StationList | void > => {
  return await callAPI(`by-location?lat=${latitude}&lon=${longitude}`)
}

export const fetchRoute = async (route: Route): Promise < StationList | void > => {
  return await callAPI(`route/${route}`)
}

export const fetchCurrentRoutes = async (): Promise < RouteList | void > => {
  return await callAPI('routes')
}

export const fetchStations = async (ids ? : string[]): Promise < StationList | void > => {
  const idString = ids && ids.length ? ids.join(",") : '';
  return await callAPI(`by-id/${idString}`)
}

export const fetchAllStations = async (): Promise < AllStationsResponse | void > => {
  return await callAPI('stations')
}

export const fetchArrivals = async (): Promise < ArrivalList | void > => {
  return await callAPI('arrivals')
}

export const fetchLine = async (line: Route): Promise < StationList | void > => {
  return await callAPI(`line/${line}`)
}

export const fetchTrain = async (train: string): Promise < Train | void > => {
  return await fetch(`train/${train}`)
    .then(res => res.json())
    .catch(error => console.error(error));
}
