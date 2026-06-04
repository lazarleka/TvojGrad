import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

let permissionRequested = false;
let notificationsReady = false;
const deliveredMessageKeys = new Set();
const deliveredRequestKeys = new Set();

const loadLocalNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  return LocalNotifications;
};

export const initMobileNotifications = async () => {
  const LocalNotifications = await loadLocalNotifications();
  if (!LocalNotifications) return false;
  if (permissionRequested) return notificationsReady;
  permissionRequested = true;

  const current = await LocalNotifications.checkPermissions();
  if (current.display !== "granted") {
    const requested = await LocalNotifications.requestPermissions();
    if (requested.display !== "granted") {
      notificationsReady = false;
      return false;
    }
  }

  await LocalNotifications.createChannel?.({
    id: "chat",
    name: "Chat poruke",
    description: "Obavjestenja za nove poruke",
    importance: 4,
    visibility: 1,
  });
  await LocalNotifications.createChannel?.({
    id: "requests",
    name: "Pođi sa mnom zahtjevi",
    description: "Obavjestenja za Pođi sa mnom zahtjeve",
    importance: 4,
    visibility: 1,
  });

  notificationsReady = true;
  return true;
};

const senderNameFor = (message) => {
  const sender = message?.Posiljalac || message?.posiljalac;
  const fullName = `${sender?.Ime || sender?.ime || ""} ${sender?.Prezime || sender?.prezime || ""}`.trim();
  return fullName || sender?.Email || sender?.email || "TvojGrad";
};

export const notifyNewChatMessage = async ({ cetId, message }) => {
  const messageId = message?.ID || message?.id || `${cetId}:${message?.Vrijeme || message?.vrijeme || message?.Tekst || Date.now()}`;
  const key = `${cetId}:${messageId}`;
  if (deliveredMessageKeys.has(key)) return;
  deliveredMessageKeys.add(key);

  const ready = await initMobileNotifications();
  if (!ready) return;

  const LocalNotifications = await loadLocalNotifications();
  if (!LocalNotifications) return;

  const body = String(message?.Tekst || message?.tekst || "Imate novu poruku").slice(0, 120);
  await LocalNotifications.schedule({
    notifications: [{
      id: Math.abs(String(key).split("").reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)) || Date.now() % 2147483647,
      title: senderNameFor(message),
      body,
      channelId: "chat",
      schedule: { at: new Date(Date.now() + 100) },
      extra: { type: "chat", cetId },
    }],
  });
};

export const notifyPsmRequestRejected = async ({ request }) => {
  const requestId = request?.ID || request?.id;
  const key = `psm-rejected:${requestId || Date.now()}`;
  if (deliveredRequestKeys.has(key)) return;
  deliveredRequestKeys.add(key);

  const ready = await initMobileNotifications();
  if (!ready) return;

  const LocalNotifications = await loadLocalNotifications();
  if (!LocalNotifications) return;

  const receiver = request?.PrimioZahtevKorisnik || request?.primioZahtevKorisnik;
  const receiverName = `${receiver?.Ime || receiver?.ime || ""} ${receiver?.Prezime || receiver?.prezime || ""}`.trim() ||
    receiver?.Email ||
    receiver?.email ||
    "Korisnik";

  await LocalNotifications.schedule({
    notifications: [{
      id: Math.abs(String(key).split("").reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)) || Date.now() % 2147483647,
      title: "Pođi sa mnom zahtjev",
      body: `${receiverName} je odbio/la vaš zahtjev.`,
      channelId: "requests",
      schedule: { at: new Date(Date.now() + 100) },
      extra: { type: "psm-request", requestId },
    }],
  });
};
