package com.cccis.training.action;

import com.cccis.training.model.VideoVO;
import com.cccis.training.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by ccc on 2018/4/24.
 */
@Controller
@RequestMapping("/video")
public class VideoAction {

    @Autowired
    VideoService videoService;

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public @ResponseBody
    List<VideoVO> getAll() {
        return videoService.getAll();
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public @ResponseBody
    VideoVO saveVideo(@RequestBody VideoVO videoVO) {
        return videoService.saveVideo(videoVO);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public @ResponseBody
    void delete(@RequestBody VideoVO videoVO) {
        videoService.delete(videoVO);
    }

    @RequestMapping(value = "/validate", method = RequestMethod.GET)
    public @ResponseBody
    String validate(@RequestParam(value="adminPassword") String adminPassword) {
        return videoService.validate(adminPassword);
    }
}
