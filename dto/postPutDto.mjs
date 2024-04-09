import Joi from "joi"

export const postPutDto = Joi.object({
    instNum: Joi.string().required(),
    instName: Joi.string().required(),
})
