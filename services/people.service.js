const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const boom = require('@hapi/boom');
const { encryption } = require('../utils/helpers/encryption');

const ROLES = {
  'admin': 1,
  'cliente': 2,
  'empleado': 3,
  'gerente': 4,
}

class PeopleService {

  async create(data) {
    const hash = await encryption(data.password);
    const response = await models.People.create({
      ...data,
      password: hash
    });
    const obj = await this.findOne(response.id);

    return obj;
  }

  async find(limit, offset, discardId) {
    const response = await models.People.findAll({
      limit,
      offset,
      include: ['role'],
      where: {
        id: { [Op.ne]: discardId },

      }
    });
    return response;
  }

  async findWholeCustomers() {
    const response = await models.People.findAll({
      include: ['role'],
      where: {
        roleId: 2,
      }
    });
    return response;
  }

  async findWholeEmployees() {
    const response = await models.People.findAll({
      include: ['role'],
      where: {
        roleId: 3,
      }
    });
    return response;
  }

  async findOne(id) {
    const obj = await models.People.findByPk(id, {
      include: [{
        association: 'role',
        include: [{
          association: 'permissions',
          include: ['menu']
        }]
      }]
    });
    if (!obj) {
      throw boom.notFound('Person Not Found');
    }
    return obj;
  }

  async findByEmail(email) {
    const obj = await models.People.findOne({
      where: { email },
      include: [{
        association: 'role',
        include: [{
          association: 'permissions',
          include: ['menu']
        }]
      }]
    });
    return obj;
  }

  async update(id, changes) {
    const obj = await this.findOne(id);
    const response = await obj.update(changes);
    return response;
  }

  async delete(id) {
    const obj = await this.findOne(id);
    await obj.destroy(id);
    return { id };
  }

  async findByRole(limit, offset, role, discardId) {
    const response = await models.People.findAll({
      limit,
      offset,
      include: ['role'],
      where: {
        roleId: ROLES[role],
        id: {
          [Op.ne]: discardId
        }
      }
    });
    return response;
  }

  async createFromRegister(data) {
    const hash = await encryption(data.password);
    const fullName = data.name ? data.name.trim().split(' ') : ['', ''];

    const response = await models.People.create({
      name: fullName[0],
      lastName: fullName[1],
      email: data.email,
      password: hash,
      roleId: 2,
      status: 'A',
    });

    const obj = await this.findOne(response.id);

    return obj;
  }

  async changePassword(email, newPassword) {
    const hash = await encryption(newPassword);
    const user = await this.findByEmail(email);

    await user.update({ password: hash });

    return user;
  }

  async verifyDocument(document) {
    const person = await models.People.findOne({
      where: { document }
    });
    return person ? { existe: true } : { existe: false };
  }

  async verifyEmail(email) {
    const person = await models.People.findOne({
      where: { email }
    });
    return person ? { existe: true } : { existe: false };
  }

}

module.exports = PeopleService;
