module.exports = {
  databaseConnection: require('./connection'),

  NotificationModel: require('./models/notification.model'),
  NotificationRepository: require('./repository/notification.repository'),
};
