package com.medeasy.alarm.domain.alarm.service;

import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("careProviderAlarmService")
public class CareProviderAlarmService extends AlarmService{

    public CareProviderAlarmService(FcmService fcmService) {
        super(fcmService);
    }

    @Override
    protected String generateTitle(List<RoutineEntity> userRoutineEntities) {
        String receiverName=userRoutineEntities.getFirst().getRoutineGroup().getUser().getName();

        return receiverName+"님이 약을 복용할 시간이에요.";
    }
}
