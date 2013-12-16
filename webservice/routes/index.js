module.exports = function (app) {
    app.get('/', index);
    app.get('/tests/:test', gumTests);
    app.get('/service/:type', service);
};

var index = function (req, res) {
    res.render('index', { title: 'Cloud Rendering' });
};

var gumTests = function (req, res) {
    res.render( 'test' + req.params.test );
}

var service = function (req, res) {
    if (req.params.type == 'receiver'){
        res.render( 'serviceReceiver' );
    } else if ( req.params.type == 'server'){
        res.render( 'serviceSender' );
    } else {
        res.render( '' );
    }
}

