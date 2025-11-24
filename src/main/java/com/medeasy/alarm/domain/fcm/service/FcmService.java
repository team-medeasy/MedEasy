package com.medeasy.alarm.domain.fcm.service;

import com.google.firebase.messaging.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class FcmService {

    private final StringRedisTemplate redisTemplate;
    private final FirebaseMessaging firebaseMessaging;

    public FcmService(
            @Qualifier("jwtRedisTemplate") StringRedisTemplate redisTemplate,
            FirebaseMessaging firebaseMessaging
    ){
        this.redisTemplate = redisTemplate;
        this.firebaseMessaging = firebaseMessaging;
    }

    public boolean sendMessage(Message message) {
        if (message == null) {
            log.info("전송할 메시지가 없습니다.");
            return false;
        }

        try {
            // 단일 메시지 전송
            String messageId = firebaseMessaging.send(message);
            log.info("알림 전송 성공: messageId={}", messageId);
            return true;
        } catch (FirebaseMessagingException e) {
            // 오류 코드 및 메시지 로깅
            log.error("FCM 전송 실패 - errorCode: {}, message: {}",
                    e.getErrorCode(), e.getMessage(), e);
            return false;
        }
    }

    public void sendMessages(List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            log.info("전송할 메시지가 없습니다.");
            return;
        }

        try {
            BatchResponse response=firebaseMessaging.sendEach(messages);
            List<SendResponse> responses = response.getResponses();
            for (int i = 0; i < responses.size(); i++) {
                SendResponse res = responses.get(i);
                if (!res.isSuccessful()) {
                    FirebaseMessagingException ex = (FirebaseMessagingException) res.getException();
                    log.error("FCM 전송 실패 - index: {}, errorCode: {}, message: {}",
                            i, ex.getErrorCode(), ex.getMessage());
                }
            }
            log.info("알림 전송 성공: {}개 성공, {}개 실패", response.getSuccessCount(), response.getFailureCount());
        }catch (FirebaseMessagingException e) {
            log.error("FCM 배치 전송 실패", e);
        }
    }

    public String getFcmClientToken(Long userId) {
        String tokenRedisKey="fcm_tokens:"+userId;
        String fcmClientToken=redisTemplate.opsForValue().get(tokenRedisKey);

        if(fcmClientToken==null){
            redisTemplate.delete(userId.toString());
            log.info("fcm token 존재하지 않음: 사용자 {}의 refresh token 삭제",userId);
        }

        return fcmClientToken;
    }

    public Message buildFcmMessage(String title, String body, String fcmClientToken) {
        Notification notification=Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build()
                ;

        return Message.builder()
                .setToken(fcmClientToken)
                .setNotification(notification)
                .build()
                ;
    }
}
