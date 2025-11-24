package com.medeasy.alarm.domain.user_care_mapping.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareReceiverResponse {

    private Long receiverId;

    private String receiverName;
}
