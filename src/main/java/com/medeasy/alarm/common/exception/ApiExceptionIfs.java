package com.medeasy.alarm.common.exception;

import com.medeasy.alarm.common.error.ErrorCodeIfs;

public interface ApiExceptionIfs {

    ErrorCodeIfs getErrorCodeIfs();

    String getErrorDescription();
}
