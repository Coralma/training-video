package com.cccis.training.utils;

import java.util.Map;

import com.google.common.collect.Maps;

/**
 * Created by CCC on 2016/10/27.
 */
public class RestfulUtils {
    private final static String SUCCESS = "success";
    private final static String FAILURE_MESSAGE = "message";

    public static Map<String, String> getSuccessResult() {
        Map<String, String> result = Maps.newHashMap();
        result.put(SUCCESS, "1");
        return result;
    }

    public static Map<String, String> getFailureResult(String reason) {
        Map<String, String> result = Maps.newHashMap();
        result.put(SUCCESS, "0");
        result.put(FAILURE_MESSAGE, reason);
        return result;
    }
}
