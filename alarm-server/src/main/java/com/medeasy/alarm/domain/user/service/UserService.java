package com.medeasy.alarm.domain.user.service;

import com.medeasy.alarm.common.error.ErrorCode;
import com.medeasy.alarm.common.error.UserErrorCode;
import com.medeasy.alarm.common.exception.ApiException;
import com.medeasy.alarm.domain.user.db.UserEntity;
import com.medeasy.alarm.domain.user.db.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserEntity registerUser(UserEntity userEntity) {

        try{
            return userRepository.save(userEntity);
        }catch (DataIntegrityViolationException e){
            throw new ApiException(ErrorCode.BAD_REQEUST, "중복된 이메일입니다.");
        }
    }

    public UserEntity getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(()-> new ApiException(UserErrorCode.USER_NOT_FOUNT));

        return userEntity;
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(()-> new ApiException(UserErrorCode.USER_NOT_FOUNT));
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public UserEntity getUserByIdToFetchJoin(Long userId) {
        return userRepository.findByIdToFetchJoin(userId).orElseThrow(()-> new ApiException(UserErrorCode.USER_NOT_FOUNT));
    }
}
