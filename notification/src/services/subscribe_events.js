const { userRepository } = require('../database');
const { formatResponse } = require('../helpers/formators');
const { logDetails } = require('../helpers/logDetails');

const subscribeEvents = async (req, res) => {
  let payload = req?.body;

  const { event, data } = payload;

  logDetails({ message: event, data: JSON.stringify(payload) });

  let response = null;

  switch (event) {
    case 'CHECK_USER_EXIST':
      response = await userRepository.checkUserExist(data?.email);
      break;

    case 'CREATE_USER':
      response = await userRepository.createUser(data?.user);
      break;

    default:
      break;
  }

  const responseData = formatResponse({
    action: event,
    code: 1,
    data: response,
  });

  logDetails({ message: event, responseData: JSON.stringify(responseData) });

  return res.status(200).json(responseData);
};

module.exports = { subscribeEvents };
