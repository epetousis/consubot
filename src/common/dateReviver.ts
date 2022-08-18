// Adapted from: https://stackoverflow.com/a/29971466

const isoDateRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/; // startswith: 2015-04-29T22:06:55

/** A JSON.parse reviver that parses dates. */
export default function dateReviver(key: unknown, value: unknown) {
  if (typeof value === 'string' && (isoDateRegex.exec(value))) {
    return new Date(value);
  }
  return value;
}
