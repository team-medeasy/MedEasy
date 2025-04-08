import notificationApi from "./notificationAPI";

export const getNotificationList = ({ page = 0, size = 10 } = {}) =>
  notificationApi.get('/notification/list', {
    params: { page, size },
  });
  
  export const markNotificationAsRead = notificationId =>
    notificationApi.patch(`/notification/${notificationId}`);