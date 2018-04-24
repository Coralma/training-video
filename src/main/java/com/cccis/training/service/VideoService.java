package com.cccis.training.service;

import com.cccis.training.dao.VideoMongoDao;
import com.cccis.training.model.VideoVO;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by ccc on 2018/4/24.
 */
@Service
public class VideoService {

    public static final String ADMIN_PASSWORD="CCCIS123";
    @Resource(name=VideoMongoDao.SPRING_BEAN_NAME)
    VideoMongoDao dao;

    public List<VideoVO> getAll() {
        return dao.findAll();
    }

    public VideoVO saveVideo(VideoVO videoVO) {
        dao.save(videoVO);
        return videoVO;
    }

    public void delete(VideoVO videoVO) {
        dao.remove(videoVO);
    }

    public String validate(String pwd) {
        if(ADMIN_PASSWORD.equals(pwd)) {
            return "1";
        }
        return "0";
    }

}
