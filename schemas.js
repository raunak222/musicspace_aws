const Joi = require('joi');                //Joi is a middleware which is used to validate the inputs 
const { number } = require('joi');
                                           
module.exports.bandschema = Joi.object({
    band: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().max(200),
        //image: Joi.string().required(),
        youtubeUrl: Joi.string().required(),
        email: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});