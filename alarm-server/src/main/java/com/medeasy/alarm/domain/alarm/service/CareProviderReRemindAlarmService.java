package com.medeasy.alarm.domain.alarm.service;

import com.medeasy.alarm.domain.fcm.service.FcmService;
import com.medeasy.alarm.domain.routine.db.RoutineEntity;
import com.medeasy.alarm.domain.user.db.UserEntity;
import com.medeasy.alarm.domain.user_schedule.db.UserScheduleEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("careProviderReRemindAlarmService")
public class CareProviderReRemindAlarmService extends AlarmService{

    public CareProviderReRemindAlarmService(FcmService fcmService) {
        super(fcmService);
    }

    @Override
    protected String generateTitle(List<RoutineEntity> userRoutineEntities) {
        RoutineEntity firstRoutine = userRoutineEntities.getFirst();
        UserScheduleEntity userSchedule = firstRoutine.getUserSchedule();
        UserEntity userEntity = firstRoutine.getRoutineGroup().getUser();
        String receiverName=userEntity.getName();

        return receiverName+"님이 " +userSchedule.getName()+"약을 복용하지 않고 있어요.";
    }

    @Override
    public String generateBody(List<RoutineEntity> routineEntities) {
        return "예정된 약 복용 시간이 많이 지났어요. 서둘러 확인해주세요.";
    }
}
