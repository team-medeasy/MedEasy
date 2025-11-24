package com.medeasy.alarm.domain.notification.converter;

import com.medeasy.alarm.common.annotation.Converter;
import com.medeasy.alarm.domain.notification.db.NotificationEntity;
import com.medeasy.alarm.domain.notification.dto.NotificationResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Converter
public class NotificationConverter {

    public NotificationResponse toResponse(NotificationEntity notificationEntity) {
        return NotificationResponse.builder()
                .routineUserId(notificationEntity.getRoutineUserId())
                .notificationId(notificationEntity.getId())
                .title(notificationEntity.getTitle())
                .content(notificationEntity.getContent())
                .sentAt(notificationEntity.getSentAt())
                .isRead(notificationEntity.getIsRead())
                .build()
                ;
    }
}
