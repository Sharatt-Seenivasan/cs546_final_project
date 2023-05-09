export async function saveLastPage(req, res, next) {
  req.session.lastPage = req.originalUrl;
  next();
}

export async function loginRedirect(req, res, next) {
  if (req.session.user) {
    return res.redirect("/");
  }
  next();
}

export async function registerRedirect(req, res, next) {
  if (req.session.user) {
    return res.redirect("/");
  }
  next();
}

export async function logoutRedirect(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/user/login");
  }
  next();
}

export async function gameplayRedirect(req, res, next) {
  if (
    req.session.lastPage !== "/game/gamestart" &&
    req.session.lastPage !== "/game/gameplay"
  ) {
    return res.redirect("/");
  } else {
    next();
  }
}

export async function gameResultRedirect(req, res, next) {
  if (
    req.session.lastPage !== "/game/gameplay" &&
    req.session.lastPage !== "/game/gameresult"
  ) {
    return res.redirect("/");
  } else {
    next();
  }
}

export async function logging(req, res, next) {
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} \t${
      req.session.user ? `Authenticated User: ${req.session.user.username}` : "Non-Authenticated User"
    }`
  );
  next();
}
