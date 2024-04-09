import Joi from "joi";

export const deleteDto = Joi.object({
  instNum: Joi.string().required(),
})
