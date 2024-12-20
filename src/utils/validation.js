const Joi = require('joi');

const schema = Joi.object({
    fipeCode: Joi.string().required(),
    year: Joi.string().required(),
});

function validateQuery(req, res, next) {
    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }
    next();
}

module.exports = { validateQuery };