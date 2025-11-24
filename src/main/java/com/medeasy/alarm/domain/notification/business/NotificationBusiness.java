package com.medeasy.alarm.domain.notification.business;

import com.google.firebase.messaging.Message;
import com.medeasy.alarm.common.annotation.Business;
import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.notification.converter.NotificationConverter;
import com.medeasy.alarm.domain.notification.db.NotificationEntity;
import com.medeasy.alarm.domain.notification.dto.NotificationAgreementRequest;
import com.medeasy.alarm.domain.notification.dto.NotificationIsUnreadResponse;
import com.medeasy.alarm.domain.notification.dto.NotificationResponse;
import com.medeasy.alarm.domain.notification.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;

import com.medeasy.alarm.domain.user.db.UserEntity;
import com.medeasy.alarm.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Business
@RequiredArgsConstructor
public class NotificationBusiness {

    private final NotificationService notificationService;
    private final NotificationConverter notificationConverter;
    private final UserService userService;
    private final FcmService fcmService;

    public List<NotificationResponse> getNotifications(Long userId, int page, int size) {
        List<NotificationEntity> notificationEntities=notificationService.getNotifications(userId, page, size);

        return notificationEntities.stream().map(notificationConverter::toResponse).toList();
    }

    @Transactional
    public NotificationResponse readNotification(Long userId, Long notificationId) {
        NotificationEntity notificationEntity=notificationService.getNotificationWithUserId(userId, notificationId);
        notificationEntity.setIsRead(true);
        return notificationConverter.toResponse(notificationEntity);
    }

    public NotificationIsUnreadResponse getIsUnReadNotifications(Long userId) {
        boolean isUnread=notificationService.hasUnreadNotifications(userId);

        return new NotificationIsUnreadResponse(isUnread);
    }

    @Transactional
    public void readAllNotification(Long userId) {
        List<NotificationEntity> notificationEntities=notificationService.getAllUnreadNotifications(userId);
        notificationEntities.forEach(notificationEntity -> notificationEntity.setIsRead(true));
    }

    @Transactional
    public void editNotificationAgreed(NotificationAgreementRequest request, Long userId) {
        UserEntity userEntity = userService.getUserById(userId);

        userEntity.setIsNotificationAgreed(request.isAgree());
    }

    @Transactional
    public void pushAlarmCustomMessage(Long userId, String title, String content) {
        String userFcmToken = fcmService.getFcmClientToken(userId);
        Message message=fcmService.buildFcmMessage(title, content, userFcmToken);

        NotificationEntity notificationEntity=NotificationEntity.builder()
                .sentAt(LocalDateTime.now())
                .title(title)
                .content(content)
                .isRead(false)
                .userId(userId)
                .build();

        fcmService.sendMessage(message);
        notificationService.saveNotification(notificationEntity);
    }
}
