package com.medeasy.alarm.domain.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long routineUserId;

    private Long notificationId; // 알림 id

    private String title;

    private String content;

    private LocalDateTime sentAt;

    private Boolean isRead;
}
