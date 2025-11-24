package com.medeasy.alarm.domain.notification.service;

import com.medeasy.alarm.common.error.NotificationError;
import com.medeasy.alarm.common.exception.ApiException;
import com.medeasy.alarm.domain.notification.db.NotificationEntity;
import com.medeasy.alarm.domain.notification.db.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public void saveAllEntities(List<NotificationEntity> notificationEntities) {
        notificationRepository.saveAll(notificationEntities);
    }

    public void saveNotification(NotificationEntity notificationEntity) {
        notificationRepository.save(notificationEntity);
    }

    public List<NotificationEntity> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return notificationRepository.findByUserIdOrderBySentAtDesc(userId, pageable);
    }


    public NotificationEntity getNotification(Long id) {
        return notificationRepository.findById(id).orElseThrow(() -> new ApiException(NotificationError.NOT_FOUND_NOTIFICATION));
    }

    public NotificationEntity getNotificationWithUserId(Long userId, Long notificationId) {
        return notificationRepository.findNotificationByIdAndUserID(notificationId, userId)
                .orElseThrow(() -> new ApiException(NotificationError.NOT_FOUND_NOTIFICATION));
    }

    public boolean hasUnreadNotifications(Long userId) {
        return notificationRepository.existsByUserIdAndIsReadFalse(userId);
    }

    public List<NotificationEntity> getAllUnreadNotifications(Long userId) {
        return notificationRepository.findAllByUserIdAndIsReadFalse(userId);
    }
}
