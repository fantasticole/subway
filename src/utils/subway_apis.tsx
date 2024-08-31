import { StationList, RouteList, AllStationsResponse, ArrivalList, Train } from "./interfaces";

export const fetchNearestStations = async (latitude: number, longitude: number): Promise < StationList | void > => {
  return await fetch(`by-location?lat=${latitude}&lon=${longitude}`)
    .then(res => res.json())
    .then((response) => {
      return { ...response, updated: new Date(response.updated) };
    })
    .catch(error => console.error(error));
}

export const fetchRoute = async (route: string): Promise < StationList | void > => {
  return await fetch(`route/${route}`)
    .then(res => res.json())
    .then((response) => {
      return { ...response, updated: new Date(response.updated) };
    })
    .catch(error => console.error(error));
}

export const fetchCurrentRoutes = async (): Promise < RouteList | void > => {
  return await fetch('routes')
    .then(res => res.json())
    .then((response) => {
      return { ...response, updated: new Date(response.updated) };
    })
    .catch(error => console.error(error));
}

export const fetchStations = async (ids ? : string[]): Promise < StationList | void > => {
  const idString = ids && ids.length ? ids.join(",") : '';
  return await fetch(`by-id/${idString}`)
    .then(res => res.json())
    .then((response) => {
      return { ...response, updated: new Date(response.updated) };
    })
    .catch(error => console.error(error));
}

export const fetchAllStations = async (): Promise < AllStationsResponse | void > => {
  return await fetch('stations')
    .then(res => res.json())
    .then((response) => {
      return { ...response, updated: new Date(response.updated) };
    })
    .catch(error => console.error(error));
}

export const fetchArrivals = async (): Promise < ArrivalList | void > => {
  return await fetch('arrivals')
    .then(res => res.json())
    .then((response) => {
      return { ...response, updated: new Date(response.updated) };
    })
    .catch(error => console.error(error));
}

export const fetchTrain = async (train: string): Promise < Train | void > => {
  return await fetch(`train/${train}`)
    .then(res => res.json())
    .catch(error => console.error(error));
}
