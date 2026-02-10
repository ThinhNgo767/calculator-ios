import axios from "axios";
const URI = "https://6853c0b9a2a37a1d6f49bb4d.mockapi.io/video/calculator";
const historyAPI = {
  get: async () => {
    const response = await axios.get(URI);
    return response;
  },
  post: async (item) => {
    await axios.post(URI, item);
  },
  put: async (id, item) => {
    await axios.put(`${URI}/${id}`, item);
  },
};

export default historyAPI;
