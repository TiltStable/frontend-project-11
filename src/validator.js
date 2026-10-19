import { setLocale, string } from "yup";

setLocale({
  mixed: { required: "errors.validation.required" },
  string: { url: "errors.validation.validUrl" },
});

const schema = string().required().url();

const assertNotDuplicate = (url, addedUrls) => {
  if (addedUrls.includes(url)) {
    throw new Error("errors.validation.duplicateUrl");
  }
};

const validateUrl = (url, addedUrls) =>
  schema.validate(url).then(() => {
    assertNotDuplicate(url, addedUrls);
    return url;
  });

export default validateUrl;
