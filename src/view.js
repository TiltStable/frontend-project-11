import i18next from "i18next";
import { snapshot, subscribe } from "valtio/vanilla";

const INPUT_BASE_CLASSES = ["border-gray-300", "focus:border-indigo-500", "focus:ring-indigo-500"];
const INPUT_ERROR_CLASSES = ["border-red-500", "focus:border-red-500", "focus:ring-red-500"];
const FEEDBACK_ERROR_CLASSES = ["text-red-600"];
const FEEDBACK_SUCCESS_CLASSES = ["text-green-600"];

const swapClasses = (element, from, to) => {
  from.forEach((className) => element.classList.remove(className));
  to.forEach((className) => element.classList.add(className));
};

const renderFeeds = (feeds, list) => {
  const items = feeds.map((feed) => {
    const item = document.createElement("li");
    item.className = "border-b border-gray-100 pb-4 last:border-0 last:pb-0";

    const title = document.createElement("h3");
    title.className = "font-bold text-gray-900";
    title.textContent = feed.title;

    const description = document.createElement("p");
    description.className = "text-gray-600";
    description.textContent = feed.description;

    item.append(title, description);
    return item;
  });

  list.replaceChildren(...items);
};

const renderPosts = (posts, list) => {
  const items = posts.map((post) => {
    const item = document.createElement("li");
    item.setAttribute("data-seen", post.seen ? "true" : "false");
    item.className = "flex items-start justify-between gap-3";

    if (/^https?:/i.test(post.link)) {
      const link = document.createElement("a");
      link.textContent = post.title;
      link.href = post.link;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.className = post.seen
        ? "font-normal text-gray-700 hover:text-indigo-800 hover:underline"
        : "font-bold text-gray-900 hover:text-indigo-800 hover:underline";
      item.append(link);
    } else {
      const title = document.createElement("span");
      title.textContent = post.title;
      title.className = post.seen ? "font-normal text-gray-700" : "font-bold text-gray-900";
      item.append(title);
    }

    const previewButton = document.createElement("button");
    previewButton.type = "button";
    previewButton.dataset.postId = post.id;
    previewButton.textContent = i18next.t("preview");
    previewButton.className =
      "shrink-0 rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50";

    item.append(previewButton);
    return item;
  });

  list.replaceChildren(...items);
};

const initView = (state, elements) => {
  const { input, feedback, button, feedsTitle, postsTitle, feedsList, postsList } = elements;

  feedsTitle.textContent = i18next.t("feeds");
  postsTitle.textContent = i18next.t("posts");

  const render = () => {
    try {
      const snap = snapshot(state);
      const formState = snap.form.state;
      const { error } = snap.form;

      button.disabled = formState === "processing";

      if (formState === "failed") {
        feedback.textContent = i18next.t(error);
        swapClasses(feedback, FEEDBACK_SUCCESS_CLASSES, FEEDBACK_ERROR_CLASSES);
        swapClasses(input, INPUT_BASE_CLASSES, INPUT_ERROR_CLASSES);
      } else if (formState === "finished") {
        feedback.textContent = i18next.t("success");
        swapClasses(feedback, FEEDBACK_ERROR_CLASSES, FEEDBACK_SUCCESS_CLASSES);
        swapClasses(input, INPUT_ERROR_CLASSES, INPUT_BASE_CLASSES);
      } else {
        feedback.textContent = "";
        swapClasses(feedback, FEEDBACK_ERROR_CLASSES, []);
        swapClasses(feedback, FEEDBACK_SUCCESS_CLASSES, []);
        swapClasses(input, INPUT_ERROR_CLASSES, INPUT_BASE_CLASSES);
      }

      renderFeeds(snap.feeds, feedsList);
      renderPosts(snap.posts, postsList);
    } catch (err) {
      console.error("render failed: UI is frozen at last successful state", err);
    }
  };

  subscribe(state, render);
  render();
};

export default initView;
