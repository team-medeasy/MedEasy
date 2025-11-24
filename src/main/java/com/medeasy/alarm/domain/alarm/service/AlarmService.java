package com.medeasy.alarm.domain.alarm.service;

import com.google.firebase.messaging.Message;
import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.notification.db.NotificationEntity;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;

import java.time.LocalDateTime;
import java.util.List;

public abstract class AlarmService {
    protected final FcmService fcmService;

    protected AlarmService(FcmService fcmService) {
        this.fcmService = fcmService;
    }

    public void addMessage(
            String fcmClientToken,
            List<RoutineEntity> routineEntity,
            List<Message> messages
    ) {
        // Message 내용 생성
        String title=generateTitle(routineEntity);
        String notificationBody=generateBody(routineEntity);

        // FCM Message 생성
        if(fcmClientToken!=null) {
            Message message=fcmService.buildFcmMessage(title, notificationBody, fcmClientToken);
            messages.add(message);
        }
    }

    public void addNotification(
            Long userId,
            List<RoutineEntity> routineEntity,
            List<NotificationEntity> notificationEntities
    ) {
        // Message 내용 생성
        String title=generateTitle(routineEntity);
        String notificationBody=generateBody(routineEntity);

        // 알림 기록 저장 엔티티 생성
        NotificationEntity notificationEntity=NotificationEntity.builder()
                .routineUserId(userId)
                .sentAt(LocalDateTime.now())
                .title(title)
                .content(notificationBody)
                .isRead(false)
                .userId(userId)
                .build()
                ;

        notificationEntities.add(notificationEntity);
    }

    public void addNotification(
            Long userId,
            Long routineUserId,
            List<RoutineEntity> routineEntity,
            List<NotificationEntity> notificationEntities
    ) {
        // Message 내용 생성
        String title=generateTitle(routineEntity);
        String notificationBody=generateBody(routineEntity);

        // 알림 기록 저장 엔티티 생성
        NotificationEntity notificationEntity=NotificationEntity.builder()
                .routineUserId(routineUserId)
                .sentAt(LocalDateTime.now())
                .title(title)
                .content(notificationBody)
                .isRead(false)
                .userId(userId)
                .build()
                ;

        notificationEntities.add(notificationEntity);
    }

    // 하위 클래스가 구현
    protected abstract String generateTitle(List<RoutineEntity> routineEntities);
    public String generateBody(List<RoutineEntity> routineEntities){
        int total = routineEntities.size();

        List<String> medicineNames=routineEntities.stream()
                .map(routineEntity -> {
                    return routineEntity.getRoutineGroup().getNickname();
                }).toList();

        if (total == 0) {
            return "";
        } else if (total == 1) {
            return medicineNames.get(0);
        } else if (total == 2) {
            return medicineNames.get(0) + ", " + medicineNames.get(1);
        } else {
            return medicineNames.get(0) + ", " + medicineNames.get(1) + " 외 " + (total - 2) + "건";
        }
    }
}
