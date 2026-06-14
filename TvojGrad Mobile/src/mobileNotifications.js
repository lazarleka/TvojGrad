import { Capacitor, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const BackgroundNotifications = registerPlugin("BackgroundNotifications");

let permissionRequested = false;
let notificationsReady = false;
let notificationOpenHandler = null;
let notificationActionListenerReady = false;
const deliveredMessageKeys = new Set();
const deliveredRequestKeys = new Set();

const notificationIdFor = (key) =>
  Math.abs(String(key).split("").reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)) ||
  Date.now() % 2147483647;

const rememberDeliveredRequest = (key) => {
  if (deliveredRequestKeys.has(key)) return false;
  deliveredRequestKeys.add(key);
  try {
    const storageKey = "deliveredPsmRequestNotifications";
    const delivered = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (delivered[key]) return false;
    delivered[key] = Date.now();
    localStorage.setItem(storageKey, JSON.stringify(delivered));
  } catch {
    // In-memory dedupe is enough if local storage is unavailable.
  }
  return true;
};

const loadLocalNotifications = () => {
  console.log("[Notif] isNative:", Capacitor.isNativePlatform());
  if (!Capacitor.isNativePlatform()) return null;
  return LocalNotifications;
};

const ensureNotificationActionListener = async () => {
  const LocalNotifications = loadLocalNotifications();
  if (!LocalNotifications || notificationActionListenerReady) return;
  notificationActionListenerReady = true;

  await LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
    const extra = event?.notification?.extra || {};
    if (notificationOpenHandler) {
      notificationOpenHandler(extra, event);
    }
  });
};

export const setMobileNotificationOpenHandler = async (handler) => {
  notificationOpenHandler = handler;
  if (handler) {
    await ensureNotificationActionListener();
  }
};
export const initMobileNotifications = async () => {
  console.log("[Notif] loadLocalNotifications...");
  const LocalNotifications = loadLocalNotifications();
  console.log("[Notif] isNative:", Capacitor.isNativePlatform());
  console.log("[Notif] LocalNotifications:", !!LocalNotifications);
  if (!LocalNotifications) return false;
  if (permissionRequested) {
    console.log("[Notif] Already requested, ready:", notificationsReady);
    return notificationsReady;
  }

  console.log("[Notif] Checking permissions...");
  const current = await LocalNotifications.checkPermissions();
  console.log("[Notif] Current permissions:", JSON.stringify(current));
  
  if (current.display !== "granted") {
    console.log("[Notif] Requesting permissions...");
    const requested = await LocalNotifications.requestPermissions();
    console.log("[Notif] Requested permissions:", JSON.stringify(requested));
    if (requested.display !== "granted") {
      notificationsReady = false;
      console.log("[Notif] Permission DENIED");
      return false;
    }
  }
  
  permissionRequested = true;
  console.log("[Notif] Creating channels...");
  
  await LocalNotifications.createChannel?.({
    id: "chat", name: "Chat poruke",
    description: "Obavjestenja za nove poruke", importance: 4, visibility: 1,
  });
  await LocalNotifications.createChannel?.({
    id: "requests", name: "Zahtjevi",
    description: "Obavjestenja za zahtjeve i prihvatanja", importance: 4, visibility: 1,
  });

  notificationsReady = true;
  console.log("[Notif] Ready! Ensuring action listener...");
  await ensureNotificationActionListener();
  console.log("[Notif] DONE - notificationsReady:", notificationsReady);
  return true;
};

export const startMobileBackgroundNotifications = async ({ userId, apiBaseUrl }) => {
  if (!Capacitor.isNativePlatform() || !userId || !apiBaseUrl) return false;
  const ready = await initMobileNotifications();
  if (!ready) return false;

  try {
    await BackgroundNotifications.start({ userId: String(userId), apiBaseUrl });
    console.log("[Notif] Background service started");
    return true;
  } catch (error) {
    console.warn("[Notif] Background service start failed:", error);
    return false;
  }
};

export const stopMobileBackgroundNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    await BackgroundNotifications.stop();
    console.log("[Notif] Background service stopped");
    return true;
  } catch (error) {
    console.warn("[Notif] Background service stop failed:", error);
    return false;
  }
};

const senderNameFor = (message) => {
  const sender = message?.Posiljalac || message?.posiljalac;
  const fullName = `${sender?.Ime || sender?.ime || ""} ${sender?.Prezime || sender?.prezime || ""}`.trim();
  return fullName || sender?.Email || sender?.email || "TvojGrad";
};

const requestSenderNameFor = (request) => {
  const sender = request?.PosloZahtev || request?.posloZahtev;
  const fullName = `${sender?.Ime || sender?.ime || ""} ${sender?.Prezime || sender?.prezime || ""}`.trim();
  return fullName || sender?.Email || sender?.email || "Korisnik";
};

const requestReceiverNameFor = (request) => {
  const receiver = request?.PrimioZahtevKorisnik || request?.primioZahtevKorisnik;
  const fullName = `${receiver?.Ime || receiver?.ime || ""} ${receiver?.Prezime || receiver?.prezime || ""}`.trim();
  return fullName || receiver?.Email || receiver?.email || "Korisnik";
};

export const notifyNewChatMessage = async ({ cetId, message }) => {
  const messageId = message?.ID || message?.id || `${cetId}:${message?.Vrijeme || message?.vrijeme || message?.Tekst || Date.now()}`;
  const key = `${cetId}:${messageId}`;
  if (deliveredMessageKeys.has(key)) return;
  deliveredMessageKeys.add(key);

  const ready = await initMobileNotifications();
  if (!ready) return;

  const LocalNotifications = loadLocalNotifications();
  if (!LocalNotifications) return;

  const body = String(message?.Tekst || message?.tekst || "Imate novu poruku").slice(0, 120);
  await LocalNotifications.schedule({
    notifications: [{
      id: notificationIdFor(key),
      title: senderNameFor(message),
      body,
      channelId: "chat",
      schedule: { at: new Date(Date.now() + 100) },
      extra: { type: "chat", cetId },
    }],
  });
};

export const notifyPsmRequestReceived = async ({ request }) => {
  const requestId = request?.ID || request?.id;
  const senderId = request?.PosloZahtev?.ID || request?.posloZahtev?.ID || request?.posloZahtev?.id;
  const receiverId = request?.PrimioZahtev || request?.primioZahtev;
  const key = `psm-received:${requestId || `${senderId || "sender"}:${receiverId || "receiver"}`}`;
  if (!rememberDeliveredRequest(key)) return;

  const ready = await initMobileNotifications();
  if (!ready) return;

  const LocalNotifications = loadLocalNotifications();
  if (!LocalNotifications) return;

  await LocalNotifications.schedule({
    notifications: [{
      id: notificationIdFor(key),
      title: "Novi zahtjev",
      body: `${requestSenderNameFor(request)} vam je poslao/la zahtjev.`,
      channelId: "requests",
      schedule: { at: new Date(Date.now() + 100) },
      extra: { type: "psm-request", requestId },
    }],
  });
};

export const notifyPsmRequestAccepted = async ({ request }) => {
  const requestId = request?.ID || request?.id;
  const senderId = request?.PosloZahtev?.ID || request?.posloZahtev?.ID || request?.posloZahtev?.id;
  const receiverId = request?.PrimioZahtev || request?.primioZahtev;
  const key = `psm-accepted:${requestId || `${senderId || "sender"}:${receiverId || "receiver"}`}`;
  if (!rememberDeliveredRequest(key)) return;

  const ready = await initMobileNotifications();
  if (!ready) return;

  const LocalNotifications = loadLocalNotifications();
  if (!LocalNotifications) return;

  await LocalNotifications.schedule({
    notifications: [{
      id: notificationIdFor(key),
      title: "Zahtjev prihvacen",
      body: `${requestReceiverNameFor(request)} je prihvatio/la vas zahtjev.`,
      channelId: "requests",
      schedule: { at: new Date(Date.now() + 100) },
      extra: { type: "psm-request", requestId },
    }],
  });
};

export const notifyPsmRequestRejected = async ({ request }) => {
  const requestId = request?.ID || request?.id;
  const senderId = request?.PosloZahtev?.ID || request?.posloZahtev?.ID || request?.posloZahtev?.id;
  const receiverId = request?.PrimioZahtev || request?.primioZahtev;
  const key = `psm-rejected:${requestId || `${senderId || "sender"}:${receiverId || "receiver"}`}`;
  if (!rememberDeliveredRequest(key)) return;

  const ready = await initMobileNotifications();
  if (!ready) return;

  const LocalNotifications = loadLocalNotifications();
  if (!LocalNotifications) return;

  await LocalNotifications.schedule({
    notifications: [{
      id: notificationIdFor(key),
      title: "Zahtjev odbijen",
      body: `${requestReceiverNameFor(request)} je odbio/la vas zahtjev.`,
      channelId: "requests",
      schedule: { at: new Date(Date.now() + 100) },
      extra: { type: "psm-request", requestId },
    }],
  });
};
