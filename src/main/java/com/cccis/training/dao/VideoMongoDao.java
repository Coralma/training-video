package com.cccis.training.dao;

import com.cccis.base.mongo.MBaseDao;
import com.cccis.training.model.VideoVO;
import org.springframework.stereotype.Repository;

/**
 * Created by ccc on 2018/4/24.
 */
@Repository(VideoMongoDao.SPRING_BEAN_NAME)
public class VideoMongoDao extends MBaseDao<VideoVO> {

    public final static String SPRING_BEAN_NAME = "mongo.VideoMongoDao";

    @Override
    public Class getEntityClass() {
        return VideoVO.class;
    }
}
