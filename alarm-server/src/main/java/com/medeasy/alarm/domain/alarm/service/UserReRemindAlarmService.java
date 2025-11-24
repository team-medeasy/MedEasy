package com.medeasy.alarm.domain.alarm.service;
import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("userReRemindAlarmService")
public class UserReRemindAlarmService extends AlarmService {

    public UserReRemindAlarmService(FcmService fcmService) {
        super(fcmService);
    }


    @Override
    protected String generateTitle(List<RoutineEntity> userRoutineEntities) {
        return userRoutineEntities.getFirst().getUserSchedule().getName()+"약 복용 시간이 많이 지났어요. 가능하면 지금 복용해주세요.";
    }
}
