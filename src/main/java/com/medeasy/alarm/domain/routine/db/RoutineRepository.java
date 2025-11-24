package com.medeasy.alarm.domain.routine.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface RoutineRepository extends JpaRepository<RoutineEntity, Long> {
    @Query("SELECT r FROM RoutineEntity r " +
            "JOIN FETCH r.userSchedule us " +
            "JOIN FETCH r.routineGroup rg " +
            "JOIN FETCH rg.user u " +
            "WHERE r.takeDate = :date " +
            "AND r.isTaken = false " +
            "AND us.takeTime BETWEEN :startTime AND :endTime")
    List<RoutineEntity> findAllByTakeDateAndTakeTimeBetweenWithMedicine(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
