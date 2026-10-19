import { proxy } from "valtio/vanilla";
import "./style.css";
import initI18next from "./i18n.js";
import validateUrl from "./validator.js";
import getFeedContents from "./http.js";
import parseFeed from "./parser.js";
import makeUid from "./utils.js";
import initView from "./view.js";
import startPolling from "./poller.js";

initI18next()
  .then(() => {
    const state = proxy({
      form: { state: "filling", error: null },
      feeds: [],
      posts: [],
    });

    const form = document.querySelector("[data-rss-form]");
    const input = form.querySelector("[name=url]");
    const feedback = document.querySelector("[data-feedback]");
    const button = form.querySelector("[type=submit]");
    const feedsTitle = document.querySelector("[data-feeds-title]");
    const postsTitle = document.querySelector("[data-posts-title]");
    const feedsList = document.querySelector("[data-feeds-list]");
    const postsList = document.querySelector("[data-posts-list]");
    const modal = document.querySelector("[data-modal]");
    const modalTitle = document.querySelector("[data-modal-title]");
    const modalDescription = document.querySelector("[data-modal-description]");
    const modalLink = document.querySelector("[data-modal-link]");
    const modalClose = document.querySelector("[data-modal-close]");

    initView(state, {
      input,
      feedback,
      button,
      feedsTitle,
      postsTitle,
      feedsList,
      postsList,
    });

    startPolling(state);

    postsList.addEventListener("click", (event) => {
      const previewButton = event.target.closest("[data-post-id]");
      if (!previewButton) {
        return;
      }

      const post = state.posts.find((item) => item.id === previewButton.dataset.postId);
      if (!post) {
        console.error("preview: post not found for id", previewButton.dataset.postId);
        return;
      }

      if (modal.open) {
        return;
      }

      modalTitle.textContent = post.title;
      modalDescription.textContent = post.description;
      if (/^https?:/i.test(post.link)) {
        modalLink.href = post.link;
        modalLink.classList.remove("hidden");
      } else {
        modalLink.href = "";
        modalLink.classList.add("hidden");
      }

      post.seen = true;
      modal.showModal();
    });

    modalClose.addEventListener("click", () => {
      modal.close();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.form.state === "processing") {
        return;
      }

      const url = input.value.trim();
      state.form.state = "processing";
      state.form.error = null;

      validateUrl(
        url,
        state.feeds.map((feed) => feed.url),
      )
        .then((validUrl) => getFeedContents(validUrl))
        .then((contents) => parseFeed(contents))
        .then(({ feed, posts }) => {
          const feedId = makeUid("feed");
          state.feeds.push({
            id: feedId,
            url,
            title: feed.title,
            description: feed.description,
          });
          posts.forEach((post) => {
            state.posts.push({
              id: makeUid("post"),
              feedId,
              title: post.title,
              link: post.link,
              description: post.description,
              seen: false,
            });
          });
          state.form.state = "finished";
          input.value = "";
          input.focus();
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : String(err);
          if (!message.startsWith("errors.")) {
            console.error(err);
          }
          state.form.state = "failed";
          state.form.error = message;
        });
    });
  })
  .catch((err) => {
    console.error("App bootstrap failed:", err);
  });
