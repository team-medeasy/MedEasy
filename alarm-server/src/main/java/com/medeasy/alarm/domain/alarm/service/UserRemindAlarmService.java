package com.medeasy.alarm.domain.alarm.service;
import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("userRemindAlarmService")
public class UserRemindAlarmService extends AlarmService {

    public UserRemindAlarmService(FcmService fcmService) {
        super(fcmService);
    }


    @Override
    protected String generateTitle(List<RoutineEntity> userRoutineEntities) {
        return userRoutineEntities.getFirst().getUserSchedule().getName()+"에 아직 복용하지 않은 약이 있어요.";
    }
}
