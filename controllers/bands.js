const Band = require('../models/band');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const band = await Band.find({}).populate('popupText');//populate will append the whole popup text to a
    res.render('bands/index', {band});    //band because in band we are storing just the objectId's.
};

module.exports.renderNewForm = (req, res) => {
    res.render('bands/new');
};

module.exports.createband = async(req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.band.location,   //used to set the location in a map.
        limit: 1
    }).send()
    const band = new Band(req.body.band);
    band.geometry = geoData.body.features[0].geometry;
    band.images = req.files.map(f => ({ url: f.path, filename: f.filename }));//used to set multiple images in band.
    band.author = req.user._id;                       //we are storing the userId coming through passport(from sessionId).
    await band.save();
    req.flash('success', 'Successfully added a new band!');
    res.redirect(`bands/${band._id}`);
};

module.exports.showband = async(req, res) => {
    const band = await Band.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!band) {
        req.flash('error', 'Cannot find that Band!');
        return res.redirect('/bands');
    }
    res.render('bands/show', {band});
};

module.exports.renderEditForm = async (req, res) => {
    const band = await Band.findById(req.params.id);
    if(!band) {
        req.flash('error', 'Cannot find that Band!');
        return res.redirect('/bands');
    }
    res.render('bands/edit', { band });
};

module.exports.updateband = async(req, res) => {
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.band.location,
        limit: 1
    }).send()
    const band = await Band.findByIdAndUpdate(id, { ...req.body.band });//req.body.band returns an object and 
    band.geometry = geoData.body.features[0].geometry;               //'...' is used to spread the properties of the object.
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    band.images.push(...imgs);
    await band.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await band.updateOne({ $pull: {images: {filename: { $in: req.body.deleteImages } } } } );
    }
    req.flash('success', 'Successfully updated band!');
    res.redirect(`/bands/${band._id}`);
};

module.exports.deleteband = async(req, res) => {
    const { id } = req.params;
    await Band.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Band');
    res.redirect('/bands');
};

