const parseFeed = (contents) => {
  const doc = new DOMParser().parseFromString(contents, "text/xml");

  if (doc.querySelector("parsererror")) {
    throw new Error("errors.parsing.invalidRss");
  }

  const channel = doc.querySelector("channel");
  const title = channel?.querySelector("title")?.textContent;

  if (!channel || !title) {
    throw new Error("errors.parsing.invalidRss");
  }

  const description = channel.querySelector("description")?.textContent ?? "";
  const posts = [...channel.querySelectorAll("item")].map((item) => ({
    title: item.querySelector("title")?.textContent ?? "",
    link: item.querySelector("link")?.textContent ?? "",
    description: item.querySelector("description")?.textContent ?? "",
  }));

  return { feed: { title, description }, posts };
};

export default parseFeed;
