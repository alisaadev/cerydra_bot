export default function loadDatabase(m) {
  let isNumber = (x) => typeof x === "number" && !isNaN(x);
  let isBoolean = (x) => typeof x === "boolean" && Boolean(x);
  let user = db.users[m.sender],
    chat = db.chats[m.chat],
    sett = db.settings;

  if (typeof user !== "object") db.users[m.sender] = {};
  if (user) {
    if (!isNumber(user.afk)) user.afk = -1;
    if (!("afkReason" in user)) user.afkReason = "";
    if (!isBoolean(user.registered)) user.registered = false;

    if (!user.registered) {
      if (!isNumber(user.age)) user.age = 0;
      if (!("name" in user)) user.name = m.pushName;
      if (!isNumber(user.regTime)) user.regTime = -1;
    }
  } else {
    db.users[m.sender] = {
      afk: -1,
      afkReason: "",
      age: 0,
      name: m.pushName,
      registered: false,
      regTime: -1,
    };
  }

  if (m.isGroup) {
    if (typeof chat !== "object") db.chats[m.chat] = {};
    if (chat) {
      if (!isBoolean(chat.antilink)) chat.antilink = false;
      if (!isBoolean(chat.detect)) chat.detect = true;
      if (!isBoolean(chat.welcome)) chat.welcome = true;
    } else {
      db.chats[m.chat] = {
        antilink: false,
        detect: true,
        welcome: true,
      };
    }
  }

  if (typeof sett !== "object") db.settings = {};
  if (sett) {
    if (!isBoolean(sett.autoread)) sett.autoread = true;
    if (!isBoolean(sett.self)) sett.self = false;
  } else {
    db.settings = {
      autoread: true,
      self: false,
    };
  }
}
