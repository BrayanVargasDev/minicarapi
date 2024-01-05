const Joi = require('joi');

const id = Joi.number();
const document = Joi.number();
const name = Joi.string().pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ]*$/).min(3).max(15);
const lastName = Joi.string().pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ]*$/).min(3).max(15);
const phone = Joi.string().allow('', null).optional();
const email = Joi.string().email();
const password = Joi.number();
const photo = Joi.string().allow('', null).optional();
const status = Joi.string().min(1).max(2).default('A');
const roleId = Joi.number().integer().default(2);
const createdAt = Joi.date().default(Date.now());
const updatedAt = Joi.date().default(Date.now());


const createPeopleSchema = Joi.object({
  name: name.required(),
  lastName: lastName.required(),
  phone,
  document,
  email: email.required(),
  password: password.required(),
  photo,
  status,
  createdAt,
  updatedAt,
  roleId,
})

const updatePeopleSchema = Joi.object({
  name,
  lastName,
  phone,
  document,
  email,
  password,
  status,
  photo,
  roleId,
  updatedAt
})

const getPeopleSchema = Joi.object({
  id: id.required(),
})

module.exports = {
  createPeopleSchema,
  updatePeopleSchema,
  getPeopleSchema
}
