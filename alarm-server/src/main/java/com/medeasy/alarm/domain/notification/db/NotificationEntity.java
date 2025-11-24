package com.medeasy.alarm.domain.notification.db;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification")
@SequenceGenerator(
        name = "notification_seq_generator",
        sequenceName = "notification_id_seq",
        allocationSize = 30
)
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notification_seq_generator")
    private Long id;

    private Long routineUserId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 250)
    private String content;

    @Column(nullable = false, columnDefinition = "boolean")
    private Boolean isRead;

    @CreationTimestamp
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private Long userId;
}
