const Band = require('../models/band');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    const band = await Band.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    band.reviews.push(review);  //push is used to append the review rather than replacing others.
    await review.save();
    await band.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/bands/${band._id}`);
};

module.exports.deleteReview = async (req, res,) => {
    const {id, reviewId } = req.params;
    await Band.findByIdAndUpdate(id, { $pull: {reivews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/bands/${id}`);
};

