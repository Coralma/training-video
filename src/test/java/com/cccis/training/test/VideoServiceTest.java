package com.cccis.training.test;

import com.cccis.training.dao.VideoMongoDao;
import com.cccis.training.model.VideoVO;
import com.cccis.training.service.VideoService;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by ccc on 2018/4/24.
 */
@RunWith(SpringJUnit4ClassRunner.class) //使用junit4进行测试
@ContextConfiguration(locations={"classpath:spring-test.xml"}) //加载配置文件
public class VideoServiceTest {

    @Autowired
    VideoService videoService;

    @Resource(name= VideoMongoDao.SPRING_BEAN_NAME)
    VideoMongoDao dao;

    @Test
    public void testValidate() {
        String fs = videoService.validate("123");
        System.out.println("videoService.validate(\"123\") result is: " + fs);
        String ss = videoService.validate("CCCIS666");
        System.out.println("videoService.validate(\"CCCIS666\") result is: " + fs);
    }

    @Test
    @Ignore
    public void testData() {
        VideoVO v1 = new VideoVO("产品技术架构介绍","http://192.168.90.254:8070/video/home-video.mp4","1");
        VideoVO v2 = new VideoVO("Git版本控制工具培训","http://192.168.90.254:8070/video/home-video.mp4","1");
        VideoVO v3 = new VideoVO("FindBugs静态代码扫描工具培训","http://192.168.90.254:8070/video/home-video.mp4","1");
        VideoVO v4 = new VideoVO("自动化测试培训","http://192.168.90.254:8070/video/home-video.mp4","2");
        VideoVO v5 = new VideoVO("规则组件业务培训","http://192.168.90.254:8070/video/home-video.mp4","3");

        videoService.saveVideo(v1);
        videoService.saveVideo(v2);
        videoService.saveVideo(v3);
        videoService.saveVideo(v4);
        videoService.saveVideo(v5);

        System.out.println("saved");
    }

    @Test
    @Ignore
    public void testRemoveAllData() {
        List<VideoVO> videos = dao.findAll();
        for(VideoVO video : videos) {
            videoService.delete(video);
        }
    }
}
