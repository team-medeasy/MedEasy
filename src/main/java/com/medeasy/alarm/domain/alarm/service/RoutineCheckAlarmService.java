package com.medeasy.alarm.domain.alarm.service;

import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoutineCheckAlarmService extends AlarmService{
    protected RoutineCheckAlarmService(FcmService fcmService) {
        super(fcmService);
    }

    @Override
    protected String generateTitle(List<RoutineEntity> routineEntities) {
        return "";
    }


    protected String generatedBody() {
        return "";
    }
}
