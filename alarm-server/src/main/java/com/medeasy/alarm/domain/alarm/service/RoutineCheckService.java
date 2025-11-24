package com.medeasy.alarm.domain.alarm.service;

import com.medeasy.alarm.domain.alarm.dto.RoutineCheckEvent;
import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.user.db.UserEntity;
import com.medeasy.alarm.domain.user_care_mapping.db.UserCareMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoutineCheckService {

    private final AlarmService alarmService;
    private final UserCareMappingRepository userCareMappingRepository;
    private final FcmService fcmService;

    @Autowired
    public RoutineCheckService(
            @Qualifier("routineCheckAlarmService") AlarmService alarmService,
            UserCareMappingRepository userCareMappingRepository,
            FcmService fcmService
    ) {
        this.alarmService = alarmService;
        this.userCareMappingRepository = userCareMappingRepository;
        this.fcmService = fcmService;
    }

    public void processRoutineCheckEvent(RoutineCheckEvent event) {

    }

    private String generateTitle() {
        return "";
    }

    private String generateBody() {
        return "";
    }
}
