const hasBytes = (buffer, bytes) =>
  buffer.length >= bytes.length &&
  bytes.every((byte, index) => buffer[index] === byte);

const hasAscii = (buffer, offset, value) =>
  buffer.length >= offset + value.length &&
  buffer.toString("latin1", offset, offset + value.length) === value;

const isUtf8Text = (buffer) => {
  if (buffer.includes(0)) return false;

  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return true;
  } catch {
    return false;
  }
};

const detectMimeType = (buffer) => {
  if (hasBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  if (hasBytes(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";

  if (hasAscii(buffer, 0, "GIF87a") || hasAscii(buffer, 0, "GIF89a")) {
    return "image/gif";
  }

  if (hasAscii(buffer, 0, "RIFF") && hasAscii(buffer, 8, "WEBP")) {
    return "image/webp";
  }

  if (hasAscii(buffer, 0, "%PDF-")) return "application/pdf";

  if (isUtf8Text(buffer)) return "text/plain";

  return null;
};

export default detectMimeType;
