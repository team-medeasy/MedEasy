package com.medeasy.alarm.domain.notification.controller;

import java.util.List;

import com.medeasy.alarm.common.annotation.UserSession;
import com.medeasy.alarm.common.api.Api;
import com.medeasy.alarm.domain.notification.business.NotificationBusiness;
import com.medeasy.alarm.domain.notification.dto.NotificationAgreementRequest;
import com.medeasy.alarm.domain.notification.dto.NotificationIsUnreadResponse;
import com.medeasy.alarm.domain.notification.dto.NotificationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notification")
public class NotificationController {

    private final NotificationBusiness notificationBusiness;

    @Operation(summary = "사용자 알림 리스트 조회", description =
            """
                알림 리스트 조회 API:
                
                사용자의 알림들을 조회 
            
            응답 값 설명: 
            
            is_read: false 일시 아직 읽지 않은 알림, true는 이전에 읽은 알림  
            """)
    @GetMapping("/list")
    public Api<List<NotificationResponse>> getNotifications(
            @Parameter(hidden = true) @UserSession Long userId,
            @RequestParam(value = "page", defaultValue = "0", required = false)
            @Parameter(description = "페이지 번호(default: 0)", required = false)
            int page,

            @RequestParam(value = "size", defaultValue = "10", required = false)
            @Parameter(description = "불러올 알림 개수 (default: 10)", required = false)
            int size
    ) {
        var response=notificationBusiness.getNotifications(userId, page, size);

        return Api.OK(response);
    }

    @Operation(summary = "알림 읽기 체크 API", description =
            """
                알림 읽기 체크 API:
                
                사용자의 알림들을 조회 
            
            사용자 알림 읽기 표시 및 알림 관련 응답 값 반환 
            """)
    @PatchMapping("/{notification_id}")
    public Api<NotificationResponse> readNotification(
            @Parameter(hidden = true) @UserSession Long userId,
            @PathVariable(name = "notification_id") Long notificationId
    ) {
        NotificationResponse response=notificationBusiness.readNotification(userId, notificationId);
        return Api.OK(response);
    }


    @Operation(summary = "안읽은 알림 여부 확인 api", description =
            """
                안읽은 알림 여부 확인 api
                
            """)
    @GetMapping("/is_unread")
    public Api<NotificationIsUnreadResponse> isUnReadNotifications(
            @Parameter(hidden = true) @UserSession Long userId
    ) {
        var response=notificationBusiness.getIsUnReadNotifications(userId);

        return Api.OK(response);
    }

    @Operation(summary = "알림 전체 체크 API", description =
            """
                알림 전체 체크 API:
                
                사용자의 안읽은 알림 전체 읽음 상태로 변경   
            
            """)
    @PatchMapping("/read/all")
    public Api<NotificationResponse> readAllNotification(
            @Parameter(hidden = true) @UserSession Long userId
    ) {
        notificationBusiness.readAllNotification(userId);
        return Api.OK(null);
    }

    @Operation(summary = "알림 허용 여부 변경 API", description =
            """
                알림 허용 여부 변경 API:
                
                사용자의 알림 허용 여부를 변경한다. 
                
                is_notification_agreed = true -> 알림 허용 
                
                is_notification_agreed = false -> 알림 거절    
            
            """)
    @PatchMapping("/user/agree")
    public Api<Object> editNotificationAgreed(
            @Parameter(hidden = true) @UserSession Long userId,
            @Valid @RequestBody NotificationAgreementRequest request
            ) {
        notificationBusiness.editNotificationAgreed(request, userId);
        return Api.OK(null);
    }

    @PostMapping("/push")
    public Api<Object> pushAlarmCustomMessage(
            @Parameter(hidden = true) @UserSession Long userId,
            @RequestParam(name = "title") String title,
            @RequestParam(name = "content") String content
    ) {
        notificationBusiness.pushAlarmCustomMessage(userId, title, content);
        return Api.OK(null);
    }
}
