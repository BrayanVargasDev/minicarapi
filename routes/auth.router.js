const express = require('express');
const passport = require('passport');
const PeopleService = require('../services/people.service');
const { signToken } = require('../utils/helpers/token');
const { userLogginMapper } = require('../utils/helpers/mappers/user.mapper');
const { checkStatus } = require('../middlewares/auth.handler');
const { getFirebaseAccessToken, sendPushNotification } = require('../services/firebase.service');

const router = express.Router();
const peopleService = new PeopleService;

// Create
router.post('/login',
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const payload = {
        sub: user.id,
        role: user.role.name
      }
      const token = signToken(payload);
      if (user.role.name == 'cliente' && req.body.firebaseToken) {
        const objs = await getFirebaseAccessToken();
        await sendPushNotification(objs, req.body.firebaseToken);
      }
      res.json(userLogginMapper({
        user,
        token
      }));
    } catch (error) {
      next(error);
    }
  }
)

router.get('/check-status',
  passport.authenticate('jwt', { session: false }),
  checkStatus,
  async (req, res, next) => {
    try {
      const user = await peopleService.findOne(req.user.sub);
      const payload = {
        sub: user.id,
        role: user.role.name
      }
      const token = signToken(payload);
      if (user.role.name == 'cliente' && req.query.firebaseToken) {
        const objs = await getFirebaseAccessToken();
        await sendPushNotification(objs, req.query.firebaseToken);
      }
      res.json(userLogginMapper({
        user,
        token
      }));
    } catch (error) {
      next(error);
    }
  }
)

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await peopleService.createFromRegister({ email, password, name });
    const payload = {
      sub: user.id,
      role: user.role.name
    }

    const token = signToken(payload);
    if (user.role.name == 'cliente' && req.body.firebaseToken) {
      const objs = await getFirebaseAccessToken();
      await sendPushNotification(objs, req.body.firebaseToken);
    }

    res.json(userLogginMapper({
      user,
      token
    }));
  } catch (error) {
    next(error);
  }
});

router.post('/verify-user', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await peopleService.findByEmail(email);
    let status;
    let isValid;
    let message;

    if (user && (user.roleId === 1 || user.roleId === 4)) {
      status = 409;
      isValid = false;
      message = 'No se puede cambiar la contraseña.';
    } else if (!user) {
      status = 404;
      isValid = false;
      message = 'Usuario no encontrado.';
    } else {
      status = 200;
      isValid = true;
      message = 'Se puede actualizar.';
    }

    res.status(status).json({
      isValid: isValid,
      message: message,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', async (req, res, next) => {
  try {
    const { password, email } = req.body;
    await peopleService.changePassword(email, password);

    res.status(200).json({
      message: 'Contraseña actualizada con éxito'
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
