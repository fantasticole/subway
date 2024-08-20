import { MOCK_STATION_LIST, MOCK_ROUTE_LIST } from './mock_data';

const mockSubwayApis = (inputUrl: string | URL | Request) => {
  const url = inputUrl as string;
  let response = "base api text";
  if (url.includes("/by-location") || url.includes("/by-route") || url.includes("/by-id")) {
    response = JSON.stringify(MOCK_STATION_LIST);
  } else if (url.includes("/routes")) {
    response = JSON.stringify(MOCK_ROUTE_LIST);
  }
  return Promise.resolve(new Response(response));
};

export default mockSubwayApis;
