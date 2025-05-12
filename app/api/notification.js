import notificationApi from "./notificationAPI";

export const getNotificationList = ({ page = 0, size = 10 } = {}) =>
  notificationApi.get('/notification/list', {
    params: { page, size },
  }
);
  
export const markNotificationAsRead = notificationId =>
  notificationApi.patch(`/notification/${notificationId}`);

export const markAllNotificationsAsRead = () =>
  notificationApi.patch('/notification/read/all');

export const getUnreadNotification = () =>
  notificationApi.get('/notification/is_unread');