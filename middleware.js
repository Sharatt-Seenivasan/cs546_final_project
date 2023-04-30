export function saveLastPage(req,res,next){
    req.session.lastPage = req.originalUrl;
    next()
}

export function loginRedirect(req, res, next){
    if(req.session.user) {
        return res.redirect('/');
    }
    next();
}

export function registerRedirect(req, res, next){
    if(req.session.user) {
        return res.redirect('/');
    }
    next();
}

export function logoutRedirect(req, res, next){
    if(!req.session.user) {
        return res.redirect('/users/login');
    }
    next();
}