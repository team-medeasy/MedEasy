package com.medeasy.alarm.domain.user.db;

import com.medeasy.alarm.domain.notification.db.NotificationEntity;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import com.medeasy.alarm.domain.routine_group.db.RoutineGroupEntity;
import com.medeasy.alarm.domain.user_care_mapping.db.UserCareMappingEntity;
import com.medeasy.alarm.domain.user_schedule.db.UserScheduleEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "\"user\"")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 150)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Gender gender;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "registered_at")
    private Date registeredAt;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "logined_at")
    private LocalDateTime loginedAt;

    @Temporal(TemporalType.DATE)
    private Date birthday;

    @Column(name = "is_notification_agreed", nullable = false)
    @Builder.Default
    private Boolean isNotificationAgreed = true;

    @Builder.Default
    @OneToMany(mappedBy = "careProvider")
    private List<UserCareMappingEntity> careReceivers=new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "careReceiver")
    private List<UserCareMappingEntity> careProviders = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    private List<RoutineGroupEntity> routineGroups= new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    @OrderBy("takeTime ASC")
    private List<UserScheduleEntity> userSchedules = new ArrayList<>();
}
