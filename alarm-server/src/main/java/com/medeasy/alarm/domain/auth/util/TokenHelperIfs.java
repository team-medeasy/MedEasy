package com.medeasy.alarm.domain.auth.util;

import com.medeasy.alarm.domain.auth.dto.TokenDto;

import java.util.Map;

public interface TokenHelperIfs {

    TokenDto issueAccessToken(Map<String, Object> data);

    TokenDto issueRefreshToken(Map<String, Object> data);

    TokenDto recreateAccessToken(String refreshToken);

    Map<String, Object> validationTokenWithThrow(String token);
}
