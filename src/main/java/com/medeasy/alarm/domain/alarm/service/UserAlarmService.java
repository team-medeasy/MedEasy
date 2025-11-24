package com.medeasy.alarm.domain.alarm.service;
import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("userAlarmService")
public class UserAlarmService extends AlarmService {

    public UserAlarmService(FcmService fcmService) {
        super(fcmService);
    }


    @Override
    protected String generateTitle(List<RoutineEntity> userRoutineEntities) {
        return userRoutineEntities.getFirst().getUserSchedule().getName()+"에 복용해야 하는 약이 있어요.";
    }
}
