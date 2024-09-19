import {
  MOCK_ARRIVAL_LIST,
  MOCK_LINE_LIST,
  MOCK_ROUTE_LIST,
  MOCK_STATION_LIST,
  MOCK_STATIONS_RESPONSE,
  MOCK_TRAIN,
} from './mock_data';

const mockSubwayApis = (inputUrl: string | URL | Request) => {
  const url = inputUrl as string;
  let response = "base api text";
  if (url.includes("by-location") || url.includes("route/") || url.includes("by-id")) {
    response = JSON.stringify(MOCK_STATION_LIST);
  } else if (url.includes("routes")) {
    response = JSON.stringify(MOCK_ROUTE_LIST);
  } else if (url.includes("stations")) {
    response = JSON.stringify(MOCK_STATIONS_RESPONSE);
  } else if (url.includes("arrivals")) {
    response = JSON.stringify(MOCK_ARRIVAL_LIST);
  } else if (url.includes("train")) {
    response = JSON.stringify(MOCK_TRAIN);
  } else if (url.includes("line")) {
    response = JSON.stringify(MOCK_LINE_LIST);
  }
  return Promise.resolve(new Response(response));
};

export default mockSubwayApis;
