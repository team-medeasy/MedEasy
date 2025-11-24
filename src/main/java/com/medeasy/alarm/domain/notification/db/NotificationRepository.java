package com.medeasy.alarm.domain.notification.db;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    /**
     * 사용자의 Notification Entity List 반환
     * FETCH JOIN의 경우 Pageable 지원 x -> EntityGraph로 구현
     * */
    @Query("SELECT n FROM NotificationEntity n " +
            "WHERE n.userId = :userId " +
            "ORDER BY n.sentAt DESC")
    List<NotificationEntity> findNotificationsByUserIdWithPageable(@Param("userId") Long userId, Pageable pageable);

    List<NotificationEntity> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);


    /**
     * 인가 요청을 포함한 로직
     *
     * 사용자가 가지고 있는 알림 중에서만 조회
     * */
    @Query(value = "SELECT n from NotificationEntity n " +
            "WHERE n.userId = :userId " +
            "AND n.id= :notificationId")
    Optional<NotificationEntity> findNotificationByIdAndUserID(
            @Param("notificationId") Long notificationId,
            @Param("userId") Long userId
    );

    boolean existsByUserIdAndIsReadFalse(Long userId);

    List<NotificationEntity> findAllByUserIdAndIsReadFalse(Long userId);
}
