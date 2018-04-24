package com.cccis.training.service;

import org.springframework.stereotype.Service;

/**
 * Created by ccc on 2017/7/28.
 */
@Service
public class PerformanceTestService {

    public Long takeTimeFive() {
        try {
            Thread.sleep(500);
            takeTimeOne();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return 500l;
    }

    public Long takeTimeOne() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return 100l;
    }
}
