import Joi from "joi"

export const postPutDto = Joi.object({
    instNum: Joi.string().required(),
    instName: Joi.string().required(),
    instAddress: Joi.string().required(),
    instCity: Joi.string().required(),
    instState: Joi.string().required(),
    instMICR: Joi.string().required(),
    instZip: Joi.string().required(),
})
