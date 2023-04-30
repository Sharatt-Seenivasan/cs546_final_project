export async function saveLastPage(req,res,next){
    req.session.lastPage = req.originalUrl;
    next()
}

export async function loginRedirect(req, res, next){
    if(req.session.user) {
        return res.redirect('/');
    }
    next();
}

export async function registerRedirect(req, res, next){
    if(req.session.user) {
        return res.redirect('/');
    }
    next();
}

export async function logoutRedirect(req, res, next){
    if(!req.session.user) {
        return res.redirect('/users/login');
    }
    next();
}


export async function gameplayRedirect(req, res, next){
    if(req.session.lastPage !== '/users/gamestart'){
        return res.redirect('/');
    }
}

export async function gameResultRedirect(req, res, next){
    if(req.session.lastPage !== '/users/gameplay'){
        return res.redirect('/');
    }
}