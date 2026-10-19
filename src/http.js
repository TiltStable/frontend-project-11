import axios from "axios";

const getFeedContents = (url) =>
  axios
    .get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`, {
      timeout: 10000,
    })
    .then((response) => {
      if (!response.data.contents) {
        throw new Error("errors.network");
      }
      return response.data.contents;
    })
    .catch((err) => {
      throw new Error("errors.network", { cause: err });
    });

export default getFeedContents;
