import getFeedContents from "./http.js";
import parseFeed from "./parser.js";
import makeUid from "./utils.js";

const refreshFeed = (state, feed) =>
  getFeedContents(feed.url)
    .then((contents) => parseFeed(contents))
    .then(({ posts }) => {
      const existingLinks = new Set(state.posts.map((post) => post.link));
      posts
        .filter((post) => !existingLinks.has(post.link))
        .forEach((post) => {
          state.posts.push({
            id: makeUid("post"),
            feedId: feed.id,
            title: post.title,
            link: post.link,
            description: post.description,
            seen: false,
          });
        });
    })
    .catch((err) => {
      // Background polling: a temporarily unavailable feed must not spam
      // the UI or console every 5 seconds; unexpected (non-"errors.*")
      // failures stay loud.
      const message = err instanceof Error ? err.message : String(err);
      if (!message.startsWith("errors.")) {
        console.error(err);
      }
    });

const startPolling = (state, interval = 5000) => {
  const tick = () => {
    try {
      Promise.all(state.feeds.map((feed) => refreshFeed(state, feed))).finally(() => {
        setTimeout(tick, interval);
      });
    } catch (err) {
      console.error("Poll tick crashed; rescheduling", err);
      setTimeout(tick, interval);
    }
  };

  setTimeout(tick, interval);
};

export default startPolling;
