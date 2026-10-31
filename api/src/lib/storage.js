import env from "./env.js";
import cloudinaryStorage from "./storage-cloudinary.js";
import localStorage from "./storage-local.js";

const drivers = {
  local: localStorage,
  cloudinary: cloudinaryStorage,
};

const saveDriverName = env("STORAGE_DRIVER", "local").trim().toLowerCase();
const saveDriver = drivers[saveDriverName];

if (!saveDriver) {
  throw new Error(`Unknown STORAGE_DRIVER: ${saveDriverName}`);
}

if (saveDriverName === "cloudinary") cloudinaryStorage.assertConfigured();

const driverFor = (file) => {
  const provider = file.storageProvider ?? "local";
  const driver = drivers[provider];

  if (!driver) throw new Error(`Unknown storage provider: ${provider}`);

  return driver;
};

const save = (file, options) => saveDriver.save(file, options);

const remove = (file) => driverFor(file).remove(file);

const open = (file) => driverFor(file).open(file);

export default { save, remove, open };
