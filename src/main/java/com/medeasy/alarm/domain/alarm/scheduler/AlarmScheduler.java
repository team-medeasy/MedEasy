package com.medeasy.alarm.domain.alarm.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.messaging.Message;
import com.medeasy.alarm.domain.alarm.dto.RoutineCheckEvent;
import com.medeasy.alarm.domain.alarm.service.AlarmService;
import com.medeasy.alarm.domain.alarm.service.RoutineCheckService;
import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.notification.db.NotificationEntity;
import com.medeasy.alarm.domain.notification.service.NotificationService;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import com.medeasy.alarm.domain.routine.db.RoutineRepository;
import com.medeasy.alarm.domain.user.db.UserEntity;
import com.medeasy.alarm.domain.user.service.UserService;
import com.medeasy.alarm.domain.user_care_mapping.db.UserCareMappingRepository;
import com.medeasy.alarm.domain.user_care_mapping.service.UserCareMappingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AlarmScheduler {

    private final RoutineRepository routineRepository;
    private final UserCareMappingRepository userCareMappingRepository;

    private final FcmService fcmService;
    private final NotificationService notificationService;
    private final AlarmService userAlarmService;
    private final AlarmService careProviderAlarmService;
    private final AlarmService userRemindAlarmService;
    private final AlarmService userReRemindAlarmservice;
    private final AlarmService careProviderRemindAlarmService;
    private final AlarmService careProviderReRemindAlarmservice;
    private final UserCareMappingService userCareMappingService;
    private final UserService userService;
    private final RedisTemplate redisAlarmTemplate;
    private static final String ROUTINE_CHECK_QUEUE = "routine:check:events";
    private final RoutineCheckService routineCheckService;
    private final ObjectMapper objectMapper;


    @Autowired
    public AlarmScheduler(
            RoutineRepository routineRepository,
            UserCareMappingRepository userCareMappingRepository,
            FcmService fcmService,
            NotificationService notificationService,
            @Qualifier("userAlarmService") AlarmService userAlarmService,
            @Qualifier("userRemindAlarmService") AlarmService userRemindAlarmService,
            @Qualifier("userReRemindAlarmService") AlarmService userReRemindAlarmservice,
            @Qualifier("careProviderAlarmService") AlarmService careProviderAlarmService,
            @Qualifier("careProviderRemindAlarmService") AlarmService careProviderRemindAlarmService,
            @Qualifier("careProviderReRemindAlarmService") AlarmService careProviderReRemindAlarmservice,
            UserCareMappingService userCareMappingService,
            @Qualifier("redisAlarmTemplate") RedisTemplate redisAlarmTemplate,
            UserService userService,
            RoutineCheckService routineCheckService,
            ObjectMapper objectMapper
    ) {
        this.routineRepository = routineRepository;
        this.userCareMappingRepository = userCareMappingRepository;
        this.userReRemindAlarmservice = userRemindAlarmService;
        this.fcmService = fcmService;
        this.notificationService = notificationService;
        this.userAlarmService = userAlarmService;
        this.careProviderAlarmService = careProviderAlarmService;
        this.userCareMappingService = userCareMappingService;
        this.userRemindAlarmService = userRemindAlarmService;
        this.careProviderRemindAlarmService = careProviderRemindAlarmService;
        this.careProviderReRemindAlarmservice = careProviderReRemindAlarmservice;
        this.redisAlarmTemplate = redisAlarmTemplate;
        this.userService = userService;
        this.routineCheckService = routineCheckService;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedRate = 60000)
    public void saveRoutineInAlarmDatabase() {
        LocalTime now = LocalTime.now();
        LocalTime endTimeCandidate = now.plusMinutes(1);
        LocalTime end = endTimeCandidate.isBefore(now) ? LocalTime.of(23, 59, 59):endTimeCandidate;

        // 알림 시간에 해당하는 루틴 조회
        List<RoutineEntity> routineEntities=routineRepository.findAllByTakeDateAndTakeTimeBetweenWithMedicine(
                LocalDate.now(),
                now,
                end
        );

        // userId로 루틴 그룹화
        Map<Long, List<RoutineEntity>> routinesGroupedByUserId =
                routineEntities.stream().collect(Collectors.groupingBy(r -> r.getRoutineGroup().getUser().getId()));

        // 알림을 보낼 루틴이 없는 경우 return
        if(routineEntities.isEmpty()) {
            log.info("알림 전송할 루틴이 존재하지 않습니다.");
            return;
        }

        log.info("알림 전송 시작: {}", routinesGroupedByUserId.size());

        List<Message> messages= new ArrayList<>();
        List<NotificationEntity> notificationEntities=new ArrayList<>();

        routinesGroupedByUserId.forEach((userId, routineList) -> {
            String userFcmToken = fcmService.getFcmClientToken(userId);
            UserEntity userEntity = userService.getUserById(userId);

            if (userEntity.getIsNotificationAgreed()) {
                userAlarmService.addMessage(userFcmToken, routineList, messages);

            }
            userAlarmService.addNotification(userId, userId, routineList, notificationEntities);

            // 보호자 ID 목록 조회
            List<Long> careProviderIds = userCareMappingRepository.findCareProviderIdsByCareReceiverId(userId);

            // 보호자에게도 동일 루틴 리스트로 알림 전송
            careProviderIds.forEach(careProviderId -> {
                String providerFcmToken = fcmService.getFcmClientToken(careProviderId);
                UserEntity careProviderEntity = userService.getUserById(careProviderId);

                if (careProviderEntity.getIsNotificationAgreed()) {
                    careProviderAlarmService.addMessage(providerFcmToken, routineList, messages);
                }
                careProviderAlarmService.addNotification(careProviderId, userId, routineList, notificationEntities);
            });
        });

        fcmService.sendMessages(messages);
        notificationService.saveAllEntities(notificationEntities);
    }

    /**
     * 루틴 복용 시간이 지난지 30분이 되었지만 is_taken이 false인 건에 대해서 알림 재전송
     * */
    @Scheduled(fixedRate = 60000)
    public void resendRoutineAlarm() {
        LocalTime now = LocalTime.now();
        LocalTime startTimeCandidate = now.minusMinutes(31);
        LocalTime endTimeCandidate = now.minusMinutes(30);
        LocalTime end = endTimeCandidate.isAfter(now) ? LocalTime.of(0, 0, 0):endTimeCandidate;

        List<RoutineEntity> routineEntities=routineRepository.findAllByTakeDateAndTakeTimeBetweenWithMedicine(
                LocalDate.now(),
                startTimeCandidate,
                end
        );

        // userId로 루틴 그룹화
        Map<Long, List<RoutineEntity>> routinesGroupedByUserId =
                routineEntities.stream().collect(Collectors.groupingBy(r -> r.getRoutineGroup().getUser().getId()));

        if(routineEntities.isEmpty()) {
            log.info("알림 재전송할 루틴이 존재하지 않습니다.");
            return;
        }

        log.info("알림 재전송 루틴 시작: {}", routineEntities.size());

        List<Message> messages= new ArrayList<>();
        List<NotificationEntity> notificationEntities=new ArrayList<>();

        routinesGroupedByUserId.forEach((userId, routineList) -> {
            UserEntity userEntity = userService.getUserById(userId);
            String userFcmToken = fcmService.getFcmClientToken(userId);

            if (userEntity.getIsNotificationAgreed()) {
                userRemindAlarmService.addMessage(userFcmToken, routineList, messages);

            }
            userRemindAlarmService.addNotification(userId, userId, routineList, notificationEntities);

            // 보호자 ID 목록 조회
            List<Long> careProviderIds = userCareMappingRepository.findCareProviderIdsByCareReceiverId(userId);

            // 보호자에게도 동일 루틴 리스트로 알림 전송
            careProviderIds.forEach(careProviderId -> {
                String providerFcmToken = fcmService.getFcmClientToken(careProviderId);
                UserEntity careProviderEntity = userService.getUserById(careProviderId);

                if (careProviderEntity.getIsNotificationAgreed()) {
                    careProviderRemindAlarmService.addMessage(providerFcmToken, routineList, messages);
                }
                careProviderRemindAlarmService.addNotification(careProviderId, userId, routineList, notificationEntities);
            });
        });

        // fcm 메시지 전송
        fcmService.sendMessages(messages);
        notificationService.saveAllEntities(notificationEntities);
    }


    /**
     * 루틴 복용 시간이 지난지 60분이 되었지만 is_taken이 false인 건에 대해서 알림 재전송
     * */
    @Scheduled(fixedRate = 120000)
    public void reresendRoutineAlarm() {
        LocalTime now = LocalTime.now();
        LocalTime startTimeCandidate = now.minusMinutes(61);
        LocalTime endTimeCandidate = now.minusMinutes(60);
        LocalTime end = endTimeCandidate.isAfter(now) ? LocalTime.of(0, 0, 0):endTimeCandidate;

        List<RoutineEntity> routineEntities=routineRepository.findAllByTakeDateAndTakeTimeBetweenWithMedicine(
                LocalDate.now(),
                startTimeCandidate,
                end
        );

        // userId로 루틴 그룹화
        Map<Long, List<RoutineEntity>> routinesGroupedByUserId =
                routineEntities.stream().collect(Collectors.groupingBy(r -> r.getRoutineGroup().getUser().getId()));

        if(routineEntities.isEmpty()) {
            log.info("알림 재재전송할 루틴이 존재하지 않습니다.");
            return;
        }

        log.info("알림 재재전송 루틴 시작: {}", routineEntities.size());

        List<Message> messages= new ArrayList<>();
        List<NotificationEntity> notificationEntities=new ArrayList<>();

        routinesGroupedByUserId.forEach((userId, routineList) -> {
            UserEntity userEntity = userService.getUserById(userId);
            String userFcmToken = fcmService.getFcmClientToken(userId);

            if (userEntity.getIsNotificationAgreed()) {
                userReRemindAlarmservice.addMessage(userFcmToken, routineList, messages);

            }
            userReRemindAlarmservice.addNotification(userId, userId, routineList, notificationEntities);

            // 보호자 ID 목록 조회
            List<Long> careProviderIds = userCareMappingRepository.findCareProviderIdsByCareReceiverId(userId);

            // 보호자에게도 동일 루틴 리스트로 알림 전송
            careProviderIds.forEach(careProviderId -> {
                String providerFcmToken = fcmService.getFcmClientToken(careProviderId);
                UserEntity careProviderEntity = userService.getUserById(careProviderId);

                if (careProviderEntity.getIsNotificationAgreed()) {
                    careProviderReRemindAlarmservice.addMessage(providerFcmToken, routineList, messages);
                }
                careProviderReRemindAlarmservice.addNotification(careProviderId, userId, routineList, notificationEntities);
            });
        });

        // fcm 메시지 전송
        fcmService.sendMessages(messages);
        notificationService.saveAllEntities(notificationEntities);
    }


    /**
     * Redis 큐에서 복약 체크 이벤트를 폴링하고 처리하는 스케줄러
     * - 5초마다 실행
     */
    @Scheduled(fixedDelay = 5000)
    public void pollRoutineCheckEvents() {
        log.info("복약 체크 이벤트 폴링 시작...");
        List<Message> messages= new ArrayList<>();
        List<NotificationEntity> notificationEntities=new ArrayList<>();

        try {
            // 1. Redis 큐에서 최대 10개 이벤트 가져오기
            List<Object> events = redisAlarmTemplate.opsForList().range(ROUTINE_CHECK_QUEUE, 0, 9);
            if (events == null || events.isEmpty()) return;

            // 2. 가져온 만큼 큐에서 제거
            redisAlarmTemplate.opsForList().trim(ROUTINE_CHECK_QUEUE, events.size(), -1);

            List<RoutineCheckEvent> validEvents = events.stream()
                    .map(event -> {
                        try {
                            return objectMapper.convertValue(event, RoutineCheckEvent.class);
                        } catch (Exception e) {
                            log.error("변환 오류: {}", e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .toList();

            log.info("validEvents : {}", validEvents.size());

            // 4. userId로 이벤트 그룹핑: Map<Long, List<RoutineCheckEvent>>
            Map<Long, List<RoutineCheckEvent>> eventsByUserId = validEvents.stream()
                    .collect(Collectors.groupingBy(RoutineCheckEvent::getUserId));

            // 5. userId별 보호자 ID 리스트 조회 후 매핑
            Map<Long, List<Long>> careProviderMap = new HashMap<>();
            for (Long userId : eventsByUserId.keySet()) {
                List<Long> careProviderIds = userCareMappingRepository.findCareProviderIdsByCareReceiverId(userId);
                careProviderMap.put(userId, careProviderIds);
            }

            validEvents.forEach(event -> {
                Long userId=event.getUserId();
                UserEntity userEntity = userService.getUserById(userId);

                List<Long> userCareProviderIds = careProviderMap.get(userId);

                userCareProviderIds.forEach(userCareProviderId -> {
                    String fcmToken=fcmService.getFcmClientToken(userCareProviderId);

                    String title = userEntity.getName() + "님이 " + event.getScheduleName() +"약을 복용했어요.";
                    String content =userEntity.getName()+"님의 "+event.getScheduleName()+" 복약 일정이 정상적으로 기록되었어요.";
                    Message message=fcmService.buildFcmMessage(title, content, fcmToken);
                    NotificationEntity notificationEntity = NotificationEntity.builder()
                                    .userId(userCareProviderId)
                                    .isRead(false)
                                    .content(content)
                                    .title(title)
                                    .build();

                    messages.add(message);
                    notificationEntities.add(notificationEntity);
                });
            });

            log.info("복용 알림 메시지 전송: {}", messages.size());
            fcmService.sendMessages(messages);
            log.info("복용 체크 알림 저장 : {}", notificationEntities.size());
            notificationService.saveAllEntities(notificationEntities);

        } catch (Exception e) {
            log.error("이벤트 폴링 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}