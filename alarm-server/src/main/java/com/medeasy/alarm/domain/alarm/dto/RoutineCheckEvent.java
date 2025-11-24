package com.medeasy.alarm.domain.alarm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutineCheckEvent implements Serializable {
    private static final long serialVersionUID = 1L; // 클래스 버전 관리

    @JsonProperty("event_id")
    private String eventId;

    @JsonProperty("schedule_name")
    private String scheduleName;
    // 복약 체크 정보
    @JsonProperty("user_id")
    private Long userId;
    @JsonProperty("checked_at")
    private LocalDateTime checkedAt;
}
